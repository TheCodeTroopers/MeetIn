'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FacultyWithProfile } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Search, MapPin, Briefcase, ChevronRight, Loader2, Sparkles, Filter } from 'lucide-react'

const DEPARTMENTS = [
  'All Departments',
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Information Science & Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Data Science',
  'Mathematics',
  'Physics',
  'Chemistry',
]

export default function UserFacultyDirectoryPage() {
  const [faculty, setFaculty] = useState<FacultyWithProfile[]>([])
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All Departments')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

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
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching faculty:', error)
      } else {
        setFaculty((data as FacultyWithProfile[]) || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = faculty.filter(f => {
    const fullName = f.profile?.full_name || ''
    const dept = f.department || ''
    const desig = f.designation || ''

    const matchesSearch =
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      dept.toLowerCase().includes(search.toLowerCase()) ||
      desig.toLowerCase().includes(search.toLowerCase())
    const matchesDept = department === 'All Departments' || dept === department
    return matchesSearch && matchesDept
  })

  // Group by department
  const grouped = filtered.reduce((acc: Record<string, FacultyWithProfile[]>, f) => {
    const dept = f.department || 'General Faculty'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(f)
    return acc
  }, {})

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[11px] font-bold border border-[#E8B52D]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#7A1F57]" />
            <span>FACULTY DIRECTORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34252D] tracking-tight">
            Find Faculty & Consultations
          </h1>
          <p className="text-xs sm:text-sm text-[#75676C]">
            Browse professors, lecturers, and departmental office hours to book an appointment.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E9DED8] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search by faculty name or specialization..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.75rem' }}
            className="h-11 rounded-xl border-[#E9DED8] bg-[#FCF9F6] text-xs focus:border-[#7A1F57]"
          />
          <Search className="w-4 h-4 text-[#9A8E91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="w-full sm:w-80 relative">
          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
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

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#7A1F57]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E9DED8] text-center space-y-3 shadow-xs">
          <p className="text-sm font-bold text-[#34252D]">No faculty members found</p>
          <p className="text-xs text-[#75676C]">Try adjusting your search query or department filter.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([dept, members]) => (
            <div key={dept} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#7A1F57]"></span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#75676C]">
                  {dept} <span className="text-[#7A1F57]">({members.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {members.map(f => (
                  <div
                    key={f.id}
                    className="bg-white rounded-2xl p-5 border border-[#E9DED8] hover:border-[#7A1F57]/40 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#F1DCE8] text-[#7A1F57] flex items-center justify-center text-base font-bold flex-shrink-0 shadow-xs">
                          {f.profile?.image_url ? (
                            <img
                              src={f.profile.image_url}
                              alt={f.profile.full_name}
                              className="w-12 h-12 rounded-2xl object-cover"
                            />
                          ) : (
                            f.profile?.full_name?.charAt(0) || 'F'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-[#34252D] truncate">
                            {f.profile?.full_name}
                          </h3>
                          <p className="text-xs font-semibold text-[#7A1F57] mt-0.5">
                            {f.designation}
                          </p>
                        </div>
                      </div>

                      {(f.bio || f.profile?.bio) && (
                        <p className="text-xs text-[#75676C] mt-3.5 line-clamp-2 leading-relaxed">
                          {f.bio || f.profile?.bio}
                        </p>
                      )}

                      <div className="space-y-1.5 mt-4 pt-3 border-t border-[#E9DED8]">
                        <div className="flex items-center gap-2 text-xs text-[#75676C]">
                          <Briefcase className="w-3.5 h-3.5 text-[#9A8E91] flex-shrink-0" />
                          <span className="truncate">{f.department}</span>
                        </div>
                        {f.office_location && (
                          <div className="flex items-center gap-2 text-xs text-[#75676C]">
                            <MapPin className="w-3.5 h-3.5 text-[#9A8E91] flex-shrink-0" />
                            <span className="truncate">{f.office_location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link href={`/user/faculty/${f.id}`} className="block mt-5">
                      <Button
                        className="w-full h-10 rounded-xl bg-[#FCF9F6] hover:bg-[#7A1F57] text-[#7A1F57] hover:text-white border border-[#E9DED8] hover:border-[#7A1F57] font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>View Schedule & Book</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
