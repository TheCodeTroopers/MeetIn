'use client'


import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loader2, CalendarDays, Clock, User, Users, Search } from 'lucide-react'
import { formatTime12h, formatDateShort } from '@/utils/slot-generator'

export default function AdminSchedulesPage() {
  const [availability, setAvailability] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('faculty_availability')
      .select(`
        *, 
        faculty:faculty!faculty_availability_faculty_id_fkey(
          designation,
          profile:profiles!faculty_profile_id_fkey(full_name)
        ),
        slot_count:appointment_slots(count)
      `)
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        setAvailability((data || []).map((a: any) => ({
          ...a,
          slot_count: a.slot_count?.[0]?.count || 0,
        })))
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-serif text-[#701a28] flex items-center gap-2">
          <CalendarDays className="w-8 h-8 text-[#982b3d]" />
          Faculty Schedules
        </h1>
        <p className="text-[#554243] mt-2">Manage and view all upcoming faculty availability and slots.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24 min-h-[400px] border border-dashed border-[#e4e2de] rounded-lg bg-[#fcfbf9]/50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#982b3d]" />
            <p className="text-sm font-medium text-[#554243] animate-pulse">Loading schedules...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#982b3d]/50" />
            <Input 
              placeholder="Search faculty..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-[#e4e2de] focus-visible:ring-[#982b3d]/20"
            />
          </div>
          <Card className="border-[#e4e2de] shadow-sm overflow-hidden">

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#fcfbf9] border-b border-[#e4e2de] text-[#554243]">
                <tr>
                  <th className="h-12 px-6 align-middle font-semibold whitespace-nowrap">Faculty</th>
                  <th className="h-12 px-6 align-middle font-semibold whitespace-nowrap">Date</th>
                  <th className="h-12 px-6 align-middle font-semibold whitespace-nowrap">Time</th>
                  <th className="h-12 px-6 align-middle font-semibold whitespace-nowrap">Mode</th>
                  <th className="h-12 px-6 align-middle font-semibold whitespace-nowrap text-right">Slots Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e2de]">
                {availability.filter(a => a.faculty?.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-[#554243]">
                      <div className="flex flex-col items-center gap-2">
                        <CalendarDays className="w-8 h-8 opacity-20" />
                        <p>No schedules found matching your search.</p>
                      </div>
                    </td>
                  </tr>
                ) : availability.filter(a => a.faculty?.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())).map(a => (
                  <tr key={a.id} className="hover:bg-[#fcfbf9]/50 transition-colors group">
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#fce8eb] text-[#982b3d] flex items-center justify-center shrink-0 border border-[#f5d0d6]">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-[#1b1c1a]">{a.faculty?.profile?.full_name}</div>
                          <div className="text-xs text-[#554243] mt-0.5">{a.faculty?.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle font-medium text-[#554243]">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-[#982b3d]/70" />
                        {a.date ? formatDateShort(a.date) : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-[#554243]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#982b3d]/70" />
                        {formatTime12h(a.start_time)} – {formatTime12h(a.end_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <Badge variant={a.slot_mode === 'MINUTE_BASED' ? 'default' : 'secondary'} className="font-medium shadow-none">
                        {a.slot_mode === 'MINUTE_BASED' ? `${a.slot_duration} min slots` : 'Manual Entry'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2 text-[#554243] font-medium">
                        <Users className="w-4 h-4 text-[#982b3d]/70" />
                        {a.slot_count} <span className="text-[#897375] font-normal ml-1">slots</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        </div>
      )}
    </div>
  )
}

