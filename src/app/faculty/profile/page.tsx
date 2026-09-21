'use client'
export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { User, Loader2, Save } from 'lucide-react'

export default function FacultyProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const [facultyData, setFacultyData] = useState<any>(null)
  const [form, setForm] = useState({ full_name: '', phone: '', bio: '', office_location: '' })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name, phone: profile.phone || '', bio: '', office_location: '' })
      fetchFaculty()
    }
  }, [profile])

  const fetchFaculty = async () => {
    const { data } = await supabase.from('faculty').select('*').eq('profile_id', profile!.id).single()
    if (data) {
      setFacultyData(data)
      setForm(f => ({ ...f, bio: data.bio || '', office_location: data.office_location || '' }))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await Promise.all([
      supabase.from('profiles').update({ full_name: form.full_name, phone: form.phone }).eq('id', profile!.id),
      facultyData && supabase.from('faculty').update({ bio: form.bio, office_location: form.office_location }).eq('id', facultyData.id),
    ])
    await refreshProfile()
    toast.success('Profile updated')
    setSaving(false)
  }

  if (!profile) return <div className="flex justify-center p-16"><Loader2 className="w-8 h-8 animate-spin" /></div>

  return (
    <div className="p-8 max-w-2xl space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">My Profile</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold bg-[#F1DCE8] text-[#7A1F57]">
                {profile.full_name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-[#34252D]">{profile.full_name}</div>
                <div className="text-sm text-[#75676C]">{profile.email}</div>
                <div className="text-xs mt-0.5 text-[#7A1F57] font-semibold">
                  {facultyData?.designation} • {facultyData?.department}
                </div>
              </div>
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Office Location</Label>
              <Input value={form.office_location} onChange={e => setForm(f => ({ ...f, office_location: e.target.value }))} placeholder="Block A, Room 201" />
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} placeholder="Brief description..." />
            </div>

            <div className="space-y-1 p-3 rounded-lg text-sm bg-muted/30">
              <div><span className="font-medium">Employee ID: </span>{facultyData?.employee_id || '—'}</div>
              <div><span className="font-medium">Department: </span>{facultyData?.department}</div>
              <div><span className="font-medium">Designation: </span>{facultyData?.designation}</div>
              <div className="text-xs mt-1 text-muted-foreground">Contact admin to change department or designation</div>
            </div>

            <Button type="submit" loading={saving}>
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

