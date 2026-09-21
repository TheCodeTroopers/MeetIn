'use client'
export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loader2, Search } from 'lucide-react'
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

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="mt-1 text-muted-foreground">Registered students</p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Year</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td><div className="font-medium">{u.full_name}</div></td>
                  <td className="text-sm">{u.email}</td>
                  <td className="text-sm">{u.department || '—'}</td>
                  <td className="text-sm">{u.year || '—'}</td>
                  <td><Badge variant={u.is_active ? 'success' : 'secondary'}>{u.is_active ? 'Active' : 'Inactive'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

