'use client'
export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Notification } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Check, Loader2 } from 'lucide-react'

export default function NotificationsPage() {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (profile) fetchNotifications()
  }, [profile])

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile!.id)
      .order('created_at', { ascending: false })

    setNotifications(data || [])
    setLoading(false)
  }

  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', profile!.id)
      .eq('is_read', false)
    fetchNotifications()
  }

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const typeColor: Record<string, string> = {
    appointment_requested: 'hsl(230, 100%, 66%)',
    appointment_approved: 'hsl(145, 60%, 45%)',
    appointment_rejected: 'hsl(0, 80%, 60%)',
    appointment_cancelled: 'hsl(38, 92%, 55%)',
    appointment_completed: 'hsl(265, 83%, 67%)',
    appointment_reminder: 'hsl(195, 80%, 55%)',
    faculty_added: 'hsl(145, 60%, 45%)',
    faculty_deactivated: 'hsl(0, 80%, 60%)',
    system_alert: 'hsl(38, 92%, 55%)',
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
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
            <div
              key={n.id}
              className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200"
              style={{
                background: n.is_read ? 'hsl(var(--card))' : 'hsl(var(--primary)/0.05)',
                border: `1px solid ${n.is_read ? 'hsl(var(--border))' : 'hsl(var(--primary)/0.2)'}`,
              }}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${typeColor[n.type]}15` }}>
                <Bell className="w-5 h-5" style={{ color: typeColor[n.type] || 'hsl(var(--primary))' }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">{n.title}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!n.is_read && (
                      <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--primary))' }} />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleDateString('en-IN', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-sm mt-0.5 text-muted-foreground">
                  {n.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

