import { db } from '@/lib/db'
import { AuditLogsClient } from './audit-logs-client'

export default async function AuditLogsPage() {
  const [logs, totalCount] = await Promise.all([
    db.adminAuditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { name: true, email: true, role: true },
        },
      },
    }),
    db.adminAuditLog.count(),
  ])

  return <AuditLogsClient initialLogs={logs} totalLogs={totalCount} />
}
