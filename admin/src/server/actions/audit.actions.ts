'use server'

import { db } from '@/lib/db'
import { getAdminSession, requireAdminSession } from '@/lib/admin-auth'

export async function logAdminAction(params: {
  action: string
  entity: string
  entityId?: string
  details?: Record<string, any>
}) {
  try {
    const session = await getAdminSession()
    await db.adminAuditLog.create({
      data: {
        adminId: session?.adminId || null,
        adminEmail: session?.email || 'system@resumeai.com',
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: params.details || {},
      },
    })
  } catch (err) {
    console.error('Failed to write admin audit log:', err)
  }
}

export async function getAuditLogsAction(page: number = 1, limit: number = 50) {
  try {
    await requireAdminSession()

    const skip = (page - 1) * limit
    const [total, logs] = await Promise.all([
      db.adminAuditLog.count(),
      db.adminAuditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { name: true, email: true, role: true, avatarUrl: true },
          },
        },
      }),
    ])

    return {
      success: true,
      data: logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch audit logs' }
  }
}
