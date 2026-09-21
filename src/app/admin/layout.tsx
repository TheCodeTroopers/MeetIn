'use client'

import { Sidebar } from '@/components/layout/sidebar'
import {
  LayoutDashboard, Users, UserCheck, Calendar, Settings, ClipboardList
} from 'lucide-react'

const adminNav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/faculty', label: 'Faculty', icon: UserCheck },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/appointments', label: 'Appointments', icon: ClipboardList },
  { href: '/admin/schedules', label: 'Schedules', icon: Calendar },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(var(--background))' }}>
      <Sidebar navItems={adminNav} role="admin" />
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  )
}
