'use client'
export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { formatTime12h, formatDateShort } from '@/utils/slot-generator'

export default function AdminSchedulesPage() {
  const [availability, setAvailability] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
    <div className="p-8 space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Faculty Schedules</h1>
      <p className="text-muted-foreground">Upcoming faculty availability</p>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Mode</th>
                  <th>Slots</th>
                </tr>
              </thead>
              <tbody>
                {availability.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No upcoming schedules</td></tr>
                ) : availability.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="font-medium">{a.faculty?.profile?.full_name}</div>
                      <div className="text-xs text-muted-foreground">{a.faculty?.designation}</div>
                    </td>
                    <td className="font-medium">{a.date ? formatDateShort(a.date) : '—'}</td>
                    <td className="text-sm">{formatTime12h(a.start_time)} – {formatTime12h(a.end_time)}</td>
                    <td><Badge variant={a.slot_mode === 'MINUTE_BASED' ? 'default' : 'secondary'}>{a.slot_mode === 'MINUTE_BASED' ? `${a.slot_duration}min` : 'Manual'}</Badge></td>
                    <td>{a.slot_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

