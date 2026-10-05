'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Loader2, Shield, History, Activity, Database, Search, User, Eye, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLog, setSelectedLog] = useState<any | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('audit_logs')
      .select(`*, user:profiles!audit_logs_user_id_fkey(full_name, email)`)
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => { setLogs(data || []); setLoading(false) })
  }, [])

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATED': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'UPDATED': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'DELETED': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="p-6 sm:p-10 max-w-[1400px] mx-auto space-y-8 animate-fade-in bg-[#fbfbfa] min-h-screen">
      
      {/* Header section */}
      <div className="bg-white rounded-3xl p-6 border border-[#E9DED8] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center shrink-0 shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fce8eb] text-[#982b3d] text-[10px] font-bold border border-[#982b3d]/20 mb-1">
              <History className="w-3 h-3" />
              <span>SYSTEM LOGS</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1b1c1a]">Audit Logs</h1>
            <p className="text-sm text-[#554243]">Monitor all critical system actions, changes, and security events.</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#897375]" />
          <Input 
            placeholder="Search logs by action, user, or entity..." 
            className="pl-10 rounded-xl border-[#e4e2de] bg-white focus-visible:ring-[#3b82f6] shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white rounded-3xl border border-[#e4e2de] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e4e2de] bg-[#fcfbf9]">
                <th className="py-4 px-6 text-xs font-bold text-[#897375] uppercase tracking-wider">Timestamp</th>
                <th className="py-4 px-6 text-xs font-bold text-[#897375] uppercase tracking-wider">User</th>
                <th className="py-4 px-6 text-xs font-bold text-[#897375] uppercase tracking-wider">Action</th>
                <th className="py-4 px-6 text-xs font-bold text-[#897375] uppercase tracking-wider">Entity</th>
                <th className="py-4 px-6 text-xs font-bold text-[#897375] uppercase tracking-wider text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e2de]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#3b82f6]" />
                    <p className="text-[#897375] mt-4 text-sm font-medium">Loading system logs...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <Database className="w-12 h-12 mx-auto text-[#e4e2de] mb-4" />
                    <p className="text-[#554243] font-medium">No audit logs found</p>
                    <p className="text-[#897375] text-sm mt-1">Actions taken in the system will appear here.</p>
                  </td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#fcfbf9] transition-colors group">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#1b1c1a]">
                      {new Date(log.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-xs text-[#897375] flex items-center gap-1 mt-0.5">
                      <Activity className="w-3 h-3" />
                      {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center border border-[#e5e7eb]">
                        <User className="w-4 h-4 text-[#6b7280]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#1b1c1a]">{log.user?.full_name || 'System Auto'}</div>
                        <div className="text-xs text-[#897375]">{log.user?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant="outline" className={`font-bold text-[10px] tracking-wide uppercase shadow-none ${getActionColor(log.action)}`}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f3f4f6] text-[#4b5563] text-xs font-semibold border border-[#e5e7eb]">
                      <Database className="w-3.5 h-3.5" />
                      {log.entity_type}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      className="text-[#3b82f6] hover:bg-[#eff6ff] hover:text-[#2563eb]"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metadata Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white rounded-3xl">
          <div className="p-6 border-b border-[#e4e2de] bg-[#fcfbf9]">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Activity className="w-5 h-5 text-[#3b82f6]" />
                  Log Inspector
                </DialogTitle>
                <Badge variant="outline" className={`font-bold shadow-none ${getActionColor(selectedLog?.action || '')}`}>
                  {selectedLog?.action}
                </Badge>
              </div>
              <DialogDescription className="mt-2 text-[#554243]">
                Detailed metadata snapshot for this transaction.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-[#e4e2de] bg-white shadow-sm space-y-1">
                <p className="text-xs font-bold text-[#897375] uppercase tracking-wider">Executor</p>
                <p className="text-sm font-semibold text-[#1b1c1a]">{selectedLog?.user?.full_name || 'System'}</p>
                <p className="text-xs text-[#554243]">{selectedLog?.user?.email}</p>
              </div>
              <div className="p-4 rounded-2xl border border-[#e4e2de] bg-white shadow-sm space-y-1">
                <p className="text-xs font-bold text-[#897375] uppercase tracking-wider">Target Entity</p>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#897375]" />
                  <p className="text-sm font-semibold text-[#1b1c1a] capitalize">{selectedLog?.entity_type}</p>
                </div>
                <p className="text-[10px] font-mono text-[#897375] truncate">{selectedLog?.entity_id}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#1b1c1a] font-bold">
                <Info className="w-4 h-4 text-[#3b82f6]" />
                <h3>Payload Metadata</h3>
              </div>
              <div className="bg-[#1b1c1a] rounded-2xl p-4 overflow-x-auto shadow-inner">
                <pre className="text-xs text-[#a3e635] font-mono leading-relaxed">
                  {JSON.stringify(selectedLog?.metadata, null, 2)}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-[#e4e2de] bg-[#fcfbf9] flex justify-end">
            <Button variant="outline" onClick={() => setSelectedLog(null)} className="rounded-xl">
              Close Inspector
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


