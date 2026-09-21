'use client'

import { Sidebar } from '@/components/layout/sidebar'
import {
  LayoutDashboard, Calendar, Clock, ClipboardList, User, Bell, Settings
} from 'lucide-react'

const facultyNav = [
  { href: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/faculty/appointments', label: 'Appointments', icon: ClipboardList },
  { href: '/faculty/availability', label: 'Availability', icon: Clock },
  { href: '/faculty/calendar', label: 'Calendar', icon: Calendar },
  { href: '/faculty/profile', label: 'Profile', icon: User },
  { href: '/faculty/notifications', label: 'Notifications', icon: Bell },
  { href: '/faculty/settings', label: 'Settings', icon: Settings },
]

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(var(--background))' }}>
      <Sidebar navItems={facultyNav} role="faculty" />
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  )
}
