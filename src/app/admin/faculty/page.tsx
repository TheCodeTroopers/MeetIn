'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FacultyWithProfile } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Search, Plus, UserCheck, UserX, Edit, Loader2, Sparkles, Filter, Upload, FileUp
} from 'lucide-react'
import Link from 'next/link'
import * as xlsx from 'xlsx'
import { createFacultyAuthUser } from '@/app/admin/actions'

const DEPARTMENTS = [
  'All Departments',
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Information Science & Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Artificial Intelligence & Data Science',
  'Mathematics',
  'Physics',
  'Chemistry',
]

const DESIGNATIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer',
  'Professor Emeritus',
  'Visiting Faculty',
]

interface FacultyFormData {
  full_name: string
  email: string
  employee_id: string
  department: string
  designation: string
  office_location: string
  bio: string
  phone: string
}

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<FacultyWithProfile[]>([])
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All Departments')
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingFaculty, setEditingFaculty] = useState<FacultyWithProfile | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FacultyFormData>({
    full_name: '',
    email: '',
    employee_id: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    office_location: '',
    bio: '',
    phone: '',
  })
  const supabase = createClient()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ total: 0, current: 0, success: 0, failed: 0 })

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBulkUploading(true)
    setUploadProgress({ total: 0, current: 0, success: 0, failed: 0 })

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = xlsx.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = xlsx.utils.sheet_to_json(worksheet)

        setUploadProgress(prev => ({ ...prev, total: json.length }))

        let successCount = 0
        let failedCount = 0

        for (const row of json as any[]) {
          try {
            // Smart extraction for messy Excel sheets (like Google Group exports)
            let email = ''
            let fullName = ''
            
            for (const key of Object.keys(row)) {
              const val = String(row[key]).trim()
              if (val.includes('@') && !email) email = val
              else if (!fullName && (key.toLowerCase().includes('name') || !val.includes('@'))) {
                 // Try to guess a name if it's not an email
                 if (val.length > 2 && val.length < 50) fullName = val
              }
            }

            email = email || `user_${Date.now()}@example.com`
            fullName = fullName || email.split('@')[0]

            const department = (row.department || row.Department || 'Computer Science & Engineering').toString().trim()
            const designation = (row.designation || row.Designation || 'Assistant Professor').toString().trim()
            const employeeId = (row.employee_id || row['Employee ID'] || row.EmployeeID || '').toString().trim()
            
            // 1. Check/Create profile
            let profileId = ''
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', email)
              .single()

            if (existingProfile) {
              profileId = existingProfile.id
              await supabase.from('profiles').update({
                full_name: fullName,
                role: 'faculty',
                is_active: true,
              }).eq('id', profileId)
            } else {
              // Call our new server action to create a real auth user
              const authRes = await createFacultyAuthUser(email, fullName)
              if (!authRes.success || !authRes.userId) {
                throw new Error(authRes.error || 'Failed to create auth user')
              }
              const newUserId = authRes.userId

              const { data: newProfile, error: profileErr } = await supabase
                .from('profiles')
                .upsert({
                  id: newUserId,
                  full_name: fullName,
                  email: email,
                  role: 'faculty',
                  is_active: true,
                })
                .select()
                .single()
              
              if (profileErr) throw profileErr
              profileId = newProfile.id
            }

            // 2. Create/Update faculty record
            const { data: existingFaculty } = await supabase
                .from('faculty')
                .select('id')
                .eq('profile_id', profileId)
                .single()
            
            if (existingFaculty) {
                 await supabase.from('faculty').update({
                    department,
                    designation,
                    employee_id: employeeId || null,
                 }).eq('id', existingFaculty.id)
            } else {
                 await supabase.from('faculty').insert({
                    profile_id: profileId,
                    department,
                    designation,
                    employee_id: employeeId || null,
                    is_active: true,
                 })
            }
            successCount++
          } catch (err) {
            console.error("Failed row:", row, err)
            failedCount++
          }
          setUploadProgress(prev => ({ ...prev, current: prev.current + 1, success: successCount, failed: failedCount }))
        }

        toast.success(`Bulk upload complete! ${successCount} added/updated, ${failedCount} failed.`)
        if (fileInputRef.current) fileInputRef.current.value = ''
        fetchFaculty()
        setTimeout(() => setShowBulkUploadDialog(false), 2000)

      } catch (err) {
        console.error("Excel parse error:", err)
        toast.error("Failed to parse the file. Please ensure it is a valid CSV or Excel file.")
      } finally {
        setBulkUploading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select(`
          *,
          profile:profiles!faculty_profile_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to load faculty list')
      } else {
        setFaculty(data as FacultyWithProfile[] || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (f: FacultyWithProfile) => {
    setEditingFaculty(f)
    setForm({
      full_name: f.profile?.full_name || '',
      email: f.profile?.email || '',
      employee_id: f.employee_id || '',
      department: f.department,
      designation: f.designation,
      office_location: f.office_location || '',
      bio: f.bio || '',
      phone: f.profile?.phone || '',
    })
    setShowDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    if (editingFaculty) {
      const [profileRes, facultyRes] = await Promise.all([
        supabase.from('profiles').update({
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
        }).eq('id', editingFaculty.profile_id),
        supabase.from('faculty').update({
          employee_id: form.employee_id.trim() || null,
          department: form.department,
          designation: form.designation,
          office_location: form.office_location.trim() || null,
          bio: form.bio.trim() || null,
        }).eq('id', editingFaculty.id),
      ])

      if (profileRes.error || facultyRes.error) {
        toast.error('Failed to update faculty member')
      } else {
        toast.success('Faculty member updated successfully')
        setShowDialog(false)
        fetchFaculty()
      }
    }
    setSubmitting(false)
  }

  const toggleStatus = async (f: FacultyWithProfile) => {
    const newStatus = !f.is_active
    const { error } = await supabase
      .from('faculty')
      .update({ is_active: newStatus })
      .eq('id', f.id)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(`Faculty ${newStatus ? 'activated' : 'deactivated'} successfully`)
      fetchFaculty()
    }
  }

  const filtered = faculty.filter(f => {
    const name = f.profile?.full_name || ''
    const dept = f.department || ''
    const desig = f.designation || ''
    const empId = f.employee_id || ''

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      dept.toLowerCase().includes(search.toLowerCase()) ||
      desig.toLowerCase().includes(search.toLowerCase()) ||
      empId.toLowerCase().includes(search.toLowerCase())

    const matchesDept = departmentFilter === 'All Departments' || dept === departmentFilter
    return matchesSearch && matchesDept
  })

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[11px] font-bold border border-[#E8B52D]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#7A1F57]" />
            <span>FACULTY DIRECTORY ADMIN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34252D] tracking-tight">
            Manage Faculty Accounts & Profiles
          </h1>
          <p className="text-xs sm:text-sm text-[#75676C]">
            {faculty.length} faculty profiles registered • {faculty.filter(f => f.is_active).length} active for booking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowBulkUploadDialog(true)}
            variant="outline" 
            className="h-11 px-5 rounded-2xl border-[#E9DED8] text-[#34252D] font-bold text-xs flex items-center gap-2 hover:bg-[#F7EFE8]"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Upload</span>
          </Button>
          <Link href="/admin/faculty/new">
            <Button className="h-11 px-5 rounded-2xl bg-[#7A1F57] hover:bg-[#651744] text-white font-bold text-xs shadow-md shadow-[#7A1F57]/15 flex items-center gap-2 cursor-pointer transition-all">
              <Plus className="w-4 h-4" />
              <span>Add New Faculty</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E9DED8] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search by faculty name, employee ID, or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.75rem' }}
            className="h-11 rounded-xl border-[#E9DED8] bg-[#FCF9F6] text-xs focus:border-[#7A1F57]"
          />
          <Search className="w-4 h-4 text-[#9A8E91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="w-full sm:w-80 relative">
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
            className="w-full h-11 rounded-xl border border-[#E9DED8] bg-[#FCF9F6] text-xs font-semibold text-[#34252D] focus:outline-none focus:border-[#7A1F57] pr-4 appearance-none"
          >
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <Filter className="w-4 h-4 text-[#9A8E91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Faculty Table (Section 25) */}
      <div className="bg-white rounded-3xl border border-[#E9DED8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#34252D]">
            <thead className="bg-[#FCF9F6] border-b border-[#E9DED8] text-[#75676C] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Faculty Member</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DED8]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7A1F57]" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[#75676C]">
                    No faculty members found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map(f => (
                  <tr key={f.id} className="hover:bg-[#FCF9F6] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F1DCE8] text-[#7A1F57] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {f.profile?.full_name?.charAt(0) || 'F'}
                        </div>
                        <div>
                          <div className="font-bold text-[#34252D]">{f.profile?.full_name}</div>
                          <div className="text-[11px] text-[#75676C]">{f.profile?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{f.department}</td>
                    <td className="px-6 py-4 font-medium text-[#7A1F57]">{f.designation}</td>
                    <td className="px-6 py-4 font-mono text-[#75676C]">{f.employee_id || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        f.is_active
                          ? 'bg-[#E5F4EC] text-[#2E7D5B]'
                          : 'bg-[#FBE8E8] text-[#B64242]'
                      }`}>
                        {f.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(f)}
                          className="p-1.5 rounded-lg border border-[#E9DED8] hover:bg-[#F7EFE8] text-[#75676C] hover:text-[#7A1F57] transition-all cursor-pointer"
                          title="Edit Faculty Profile"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleStatus(f)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            f.is_active
                              ? 'border-[#B64242]/30 text-[#B64242] hover:bg-[#FBE8E8]'
                              : 'border-[#2E7D5B]/30 text-[#2E7D5B] hover:bg-[#E5F4EC]'
                          }`}
                          title={f.is_active ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {f.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Faculty Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-3xl border border-[#E9DED8] p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#34252D]">Edit Faculty Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">Full Name *</label>
                <Input
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  required
                  className="h-10 rounded-xl bg-[#FCF9F6] border-[#E9DED8] text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">Email (Read-only)</label>
                <Input
                  type="email"
                  value={form.email}
                  disabled
                  className="h-10 rounded-xl bg-[#F7EFE8] border-[#E9DED8] text-xs text-[#75676C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">Department *</label>
                <select
                  value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="w-full h-10 rounded-xl border border-[#E9DED8] bg-[#FCF9F6] text-xs font-medium text-[#34252D] px-3"
                >
                  {DEPARTMENTS.filter(d => d !== 'All Departments').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">Designation *</label>
                <select
                  value={form.designation}
                  onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                  className="w-full h-10 rounded-xl border border-[#E9DED8] bg-[#FCF9F6] text-xs font-medium text-[#34252D] px-3"
                >
                  {DESIGNATIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">Employee ID</label>
                <Input
                  value={form.employee_id}
                  onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
                  placeholder="EMP001"
                  className="h-10 rounded-xl bg-[#FCF9F6] border-[#E9DED8] text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">Phone</label>
                <Input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 9876543210"
                  className="h-10 rounded-xl bg-[#FCF9F6] border-[#E9DED8] text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#34252D]">Office Location</label>
              <Input
                value={form.office_location}
                onChange={e => setForm(f => ({ ...f, office_location: e.target.value }))}
                placeholder="Block A, Room 201"
                className="h-10 rounded-xl bg-[#FCF9F6] border-[#E9DED8] text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#34252D]">Bio / Specialization</label>
              <Textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Brief description of expertise, research domains, or office hours..."
                rows={3}
                className="rounded-xl bg-[#FCF9F6] border-[#E9DED8] text-xs"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="rounded-xl border-[#E9DED8] text-xs font-semibold text-[#75676C]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#7A1F57] hover:bg-[#651744] text-white text-xs font-bold px-5"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUploadDialog} onOpenChange={(open) => !bulkUploading && setShowBulkUploadDialog(open)}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border border-[#E9DED8]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#34252D]">Bulk Upload Faculty</DialogTitle>
            <DialogDescription className="text-xs text-[#75676C]">
              Upload a CSV or Excel file to add multiple faculties at once. We will extract all available fields. Missing fields will use defaults and can be edited later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div 
              className="border-2 border-dashed border-[#E9DED8] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#FCF9F6] transition-colors"
              onClick={() => !bulkUploading && fileInputRef.current?.click()}
            >
              <FileUp className="w-8 h-8 text-[#9A8E91]" />
              <div className="text-center">
                <p className="text-sm font-bold text-[#34252D]">Click to browse files</p>
                <p className="text-xs text-[#75676C] mt-1">Supports .csv, .xls, .xlsx</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleBulkUpload}
              />
            </div>

            {bulkUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#75676C] font-semibold">
                  <span>Processing ({uploadProgress.current} / {uploadProgress.total})</span>
                  <span>{Math.round((uploadProgress.current / (uploadProgress.total || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-[#E9DED8] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#7A1F57] h-full transition-all duration-300"
                    style={{ width: `${(uploadProgress.current / (uploadProgress.total || 1)) * 100}%` }}
                  />
                </div>
                <div className="flex gap-4 text-[11px] font-bold mt-2">
                  <span className="text-[#2E7D5B]">✓ {uploadProgress.success} Success</span>
                  <span className="text-[#B64242]">✗ {uploadProgress.failed} Failed</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkUploadDialog(false)}
              disabled={bulkUploading}
              className="rounded-xl border-[#E9DED8] text-xs font-semibold text-[#75676C]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
