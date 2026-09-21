'use client'

import { Sidebar } from '@/components/layout/sidebar'
import {
  LayoutDashboard, Users, ClipboardList, Bell, User
} from 'lucide-react'

const userNav = [
  { href: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/user/faculty', label: 'Find Faculty', icon: Users },
  { href: '/user/appointments', label: 'My Appointments', icon: ClipboardList },
  { href: '/user/notifications', label: 'Notifications', icon: Bell },
  { href: '/user/profile', label: 'Profile', icon: User },
]

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(var(--background))' }}>
      <Sidebar navItems={userNav} role="user" />
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  )
}
