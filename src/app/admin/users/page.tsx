'use client'
export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Users } from 'lucide-react'
import { Profile } from '@/types'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setUsers(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const collegeUsers = filtered.filter(u => u.email.toLowerCase().endsWith('@sode-edu.in'))
  const otherUsers = filtered.filter(u => !u.email.toLowerCase().endsWith('@sode-edu.in'))

  const renderTable = (userList: Profile[], emptyMessage: string) => (
    <div className="bg-white rounded-3xl border border-[#E9DED8] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#34252D]">
          <thead className="bg-[#FCF9F6] border-b border-[#E9DED8] text-[#75676C] font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Year</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9DED8]">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7A1F57]" /></td></tr>
            ) : userList.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-16 text-[#75676C]">{emptyMessage}</td></tr>
            ) : userList.map(u => (
              <tr key={u.id} className="hover:bg-[#FCF9F6] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F1DCE8] text-[#7A1F57] flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {u.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-[#34252D]">{u.full_name}</div>
                      <div className="text-[11px] text-[#75676C]">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">{u.department || '—'}</td>
                <td className="px-6 py-4 font-mono text-[#75676C]">{u.year || '—'}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    u.is_active
                      ? 'bg-[#E5F4EC] text-[#2E7D5B]'
                      : 'bg-[#FBE8E8] text-[#B64242]'
                  }`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[11px] font-bold border border-[#E8B52D]/40">
            <Users className="w-3.5 h-3.5 text-[#7A1F57]" />
            <span>USER DIRECTORY ADMIN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34252D] tracking-tight">
            Manage System Users
          </h1>
          <p className="text-xs sm:text-sm text-[#75676C]">
            {users.length} registered users • {users.filter(u => u.is_active).length} active accounts
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E9DED8] shadow-xs flex gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.75rem' }}
            className="h-11 rounded-xl border-[#E9DED8] bg-[#FCF9F6] text-xs focus:border-[#7A1F57]"
          />
          <Search className="w-4 h-4 text-[#9A8E91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-bold mb-4 text-[#34252D] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7A1F57]"></span>
            College Members (Internal)
          </h2>
          {renderTable(collegeUsers, "No internal college members found matching your search.")}
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4 text-[#34252D] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E8B52D]"></span>
            External Users (Guests / Parents)
          </h2>
          {renderTable(otherUsers, "No external users found matching your search.")}
        </div>
      </div>
    </div>
  )
}

