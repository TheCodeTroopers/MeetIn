'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Lock, Loader2 } from 'lucide-react'

export function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setLoading(true)
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  return (
    <Card className="border-[#E9DED8] shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-[#34252D] flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#7A1F57]" />
          Change Password
        </CardTitle>
        <CardDescription className="text-[#75676C]">
          Update your account password to keep it secure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#34252D]">New Password</label>
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="text-xs border-[#E9DED8]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#34252D]">Confirm New Password</label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="text-xs border-[#E9DED8]"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading || !newPassword || !confirmPassword}
            className="w-full sm:w-auto bg-[#7A1F57] hover:bg-[#651744] text-white text-xs font-bold"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
