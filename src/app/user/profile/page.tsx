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
import { Save, Loader2 } from 'lucide-react'

export default function UserProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({ full_name: '', phone: '', department: '', year: '' })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name,
        phone: profile.phone || '',
        department: profile.department || '',
        year: profile.year || '',
      })
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, phone: form.phone, department: form.department, year: form.year })
      .eq('id', profile!.id)

    if (error) toast.error('Failed to update profile')
    else { toast.success('Profile updated'); await refreshProfile() }
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
              </div>
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Computer Science" />
              </div>
              <div className="space-y-2">
                <Label>Year / Semester</Label>
                <Input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="3rd Year" />
              </div>
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
