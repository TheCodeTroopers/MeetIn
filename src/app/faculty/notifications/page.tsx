'use client'
export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Bell, Check, Loader2 } from 'lucide-react'
import { Notification } from '@/types'
import { Button } from '@/components/ui/button'

export default function FacultyNotificationsPage() {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (profile) fetch()
  }, [profile])

  const fetch = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile!.id)
      .order('created_at', { ascending: false })
    setNotifications(data || [])
    setLoading(false)
  }

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile!.id).eq('is_read', false)
    fetch()
  }

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications {unreadCount > 0 && `(${unreadCount})`}</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-card border border-border">
          <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
              className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all"
              style={{
                background: n.is_read ? 'hsl(var(--card))' : 'hsl(var(--primary)/0.05)',
                border: `1px solid ${n.is_read ? 'hsl(var(--border))' : 'hsl(var(--primary)/0.2)'}`,
              }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'hsl(var(--primary)/0.1)' }}>
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between gap-2">
                  <span className="font-medium text-sm">{n.title}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!n.is_read && <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--primary))' }} />}
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <p className="text-sm mt-0.5 text-muted-foreground">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

