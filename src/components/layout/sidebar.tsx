'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import {
  BookOpen, ChevronRight, LogOut
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

interface SidebarProps {
  navItems: NavItem[]
  role: 'admin' | 'faculty' | 'user'
}

const roleBadge = {
  admin: 'Admin Panel',
  faculty: 'Faculty Workspace',
  user: 'Student Portal',
}

export function Sidebar({ navItems, role }: SidebarProps) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40 bg-white border-r border-[#E9DED8] text-[#34252D] shadow-xs">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 gap-3 border-b border-[#E9DED8]">
        <div className="w-10 h-10 rounded-2xl bg-[#7A1F57] text-[#E8B52D] flex items-center justify-center flex-shrink-0 font-bold shadow-md shadow-[#7A1F57]/10">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <div className="text-base font-bold tracking-tight text-[#7A1F57] leading-tight">
            Vichaara
          </div>
          <div className="text-[10px] font-bold text-[#75676C] uppercase tracking-wider mt-0.5">
            {roleBadge[role]}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3.5 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-150 group',
                isActive
                  ? 'bg-[#F1DCE8] text-[#7A1F57]'
                  : 'text-[#75676C] hover:bg-[#F7EFE8] hover:text-[#34252D]'
              )}
            >
              <item.icon className={cn('w-4 h-4 flex-shrink-0 transition-colors', isActive ? 'text-[#7A1F57]' : 'text-[#9A8E91] group-hover:text-[#34252D]')} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#7A1F57] opacity-90" />}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Card */}
      <div className="p-4 border-t border-[#E9DED8] bg-[#FCF9F6]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white border border-[#E9DED8] mb-2.5 shadow-xs">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-[#F1DCE8] text-[#7A1F57]">
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate text-[#34252D]">
              {profile?.full_name || 'Loading...'}
            </div>
            <div className="text-[10px] truncate text-[#75676C]">
              {profile?.email}
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium w-full text-[#75676C] hover:text-[#B64242] hover:bg-[#FBE8E8] transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
