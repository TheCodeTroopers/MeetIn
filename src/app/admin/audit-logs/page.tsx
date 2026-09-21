'use client'
export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('audit_logs')
      .select(`*, user:profiles!audit_logs_user_id_fkey(full_name, email)`)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => { setLogs(data || []); setLoading(false) })
  }, [])

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Audit Logs</h1>
      <Card>
        <CardContent className="p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No audit logs yet</td></tr>
              ) : logs.map(log => (
                <tr key={log.id}>
                  <td className="text-xs font-mono text-muted-foreground">
                    {new Date(log.created_at).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <div className="text-sm font-medium">{log.user?.full_name || 'System'}</div>
                    <div className="text-xs text-muted-foreground">{log.user?.email}</div>
                  </td>
                  <td><Badge variant="outline" className="font-mono text-xs">{log.action}</Badge></td>
                  <td className="text-sm">{log.entity_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

