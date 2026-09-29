'use client'

import { useState } from 'react'
import { ShieldAlert, Clock, Search, Shield, UserCheck, Terminal } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export function AuditLogsClient({
  initialLogs,
  totalLogs,
}: {
  initialLogs: any[]
  totalLogs: number
}) {
  const [logs, setLogs] = useState(initialLogs)
  const [search, setSearch] = useState('')

  const filteredLogs = logs.filter((log) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      log.action.toLowerCase().includes(q) ||
      log.adminEmail.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="p-4 rounded-2xl premium-card flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search audit logs by action, admin email, entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Action & Entity</th>
                <th className="px-5 py-3.5">Administrator</th>
                <th className="px-5 py-3.5">Details</th>
                <th className="px-5 py-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">
                    No audit records match your search
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <Badge variant="default" className="font-mono text-[10px]">
                          {log.action}
                        </Badge>
                        <span className="text-muted-foreground font-semibold">• {log.entity}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-semibold text-foreground">{log.adminEmail}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-[11px] text-muted-foreground max-w-md truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>

                    <td className="px-5 py-4 text-muted-foreground text-[11px]">
                      {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
