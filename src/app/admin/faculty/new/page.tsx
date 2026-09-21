'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ChevronLeft, UserPlus, Sparkles, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const DEPARTMENTS = [
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

export default function AddFacultyPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState('Computer Science & Engineering')
  const [designation, setDesignation] = useState('Assistant Professor')
  const [officeLocation, setOfficeLocation] = useState('')
  const [bio, setBio] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !email) {
      toast.error('Full name and email are required')
      return
    }

    setSubmitting(true)

    try {
      // 1. Check if profile exists for this email
      let profileId = ''
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .single()

      if (existingProfile) {
        profileId = existingProfile.id
        // Update role to faculty
        await supabase.from('profiles').update({
          full_name: fullName.trim(),
          role: 'faculty',
          phone: phone.trim() || null,
          is_active: true,
        }).eq('id', profileId)
      } else {
        // Create random or client id for testing / database profile entry
        // If Supabase auth is enabled, user will link on first login
        const fakeUserId = crypto.randomUUID()
        const { data: newProfile, error: profileErr } = await supabase
          .from('profiles')
          .insert({
            id: fakeUserId,
            full_name: fullName.trim(),
            email: email.trim(),
            role: 'faculty',
            phone: phone.trim() || null,
            is_active: true,
          })
          .select()
          .single()

        if (profileErr) {
          toast.error(`Profile error: ${profileErr.message}`)
          setSubmitting(false)
          return
        }
        profileId = newProfile.id
      }

      // 2. Create faculty record
      const { error: facultyErr } = await supabase
        .from('faculty')
        .insert({
          profile_id: profileId,
          employee_id: employeeId.trim() || null,
          department,
          designation,
          office_location: officeLocation.trim() || null,
          bio: bio.trim() || null,
          is_active: true,
        })

      if (facultyErr) {
        toast.error(`Faculty record error: ${facultyErr.message}`)
      } else {
        toast.success(`Faculty profile created for ${fullName}!`)
        router.push('/admin/faculty')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Back to Faculty List */}
      <Link
        href="/admin/faculty"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#75676C] hover:text-[#7A1F57] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Faculty Accounts</span>
      </Link>

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E9DED8] shadow-xs space-y-8">
        <div className="border-b border-[#E9DED8] pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[11px] font-bold border border-[#E8B52D]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#7A1F57]" />
            <span>FACULTY ONBOARDING</span>
          </div>
          <h1 className="text-2xl font-bold text-[#34252D]">Add Faculty Member</h1>
          <p className="text-xs text-[#75676C]">
            Register a new professor or lecturer to enable student appointment scheduling.
          </p>
        </div>

        <form onSubmit={handleCreateFaculty} className="space-y-8">
          
          {/* 1. Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#7A1F57] uppercase tracking-wider">
              1. Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">
                  Full Name <span className="text-[#B64242]">*</span>
                </label>
                <Input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Rao"
                  required
                  className="h-11 rounded-xl bg-[#FCF9F6] border-[#E9DED8] text-xs focus:border-[#7A1F57]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">
                  College Email <span className="text-[#B64242]">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ramesh@sode-edu.in"
                  required
                  className="h-11 rounded-xl bg-[#FCF9F6] border-[#E9DED8] text-xs focus:border-[#7A1F57]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">Employee ID</label>
                <Input
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  placeholder="e.g. EMP4021"
                  className="h-11 rounded-xl bg-[#FCF9F6] border-[#E9DED8] text-xs focus:border-[#7A1F57]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">Phone Number</label>
                <Input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="h-11 rounded-xl bg-[#FCF9F6] border-[#E9DED8] text-xs focus:border-[#7A1F57]"
                />
              </div>
            </div>
          </div>

          {/* 2. Professional Information */}
          <div className="space-y-4 pt-4 border-t border-[#E9DED8]">
            <h3 className="text-sm font-bold text-[#7A1F57] uppercase tracking-wider">
              2. Professional Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">Department *</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#E9DED8] bg-[#FCF9F6] text-xs font-medium text-[#34252D] px-3 focus:border-[#7A1F57]"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">Designation *</label>
                <select
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#E9DED8] bg-[#FCF9F6] text-xs font-medium text-[#34252D] px-3 focus:border-[#7A1F57]"
                >
                  {DESIGNATIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">Office Location</label>
                <Input
                  value={officeLocation}
                  onChange={e => setOfficeLocation(e.target.value)}
                  placeholder="Block A, Room 204, Faculty Block"
                  className="h-11 rounded-xl bg-[#FCF9F6] border-[#E9DED8] text-xs focus:border-[#7A1F57]"
                />
              </div>
            </div>
          </div>

          {/* 3. Biography & Domain */}
          <div className="space-y-4 pt-4 border-t border-[#E9DED8]">
            <h3 className="text-sm font-bold text-[#7A1F57] uppercase tracking-wider">
              3. Biography & Research Interests
            </h3>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#34252D]">Short Bio</label>
              <Textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Specialization in Algorithms, Machine Learning, and Distributed Systems..."
                rows={3}
                className="rounded-xl bg-[#FCF9F6] border-[#E9DED8] text-xs focus:border-[#7A1F57]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#E9DED8]">
            <Link href="/admin/faculty">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-5 rounded-xl border-[#E9DED8] text-xs font-bold text-[#75676C]"
              >
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 px-6 rounded-xl bg-[#7A1F57] hover:bg-[#651744] text-white text-xs font-bold shadow-md shadow-[#7A1F57]/15 flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Faculty...</span>
                </>
              ) : (
                <>
                  <span>Create Faculty Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

        </form>
      </div>

    </div>
  )
}
