'use server'

import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/admin-auth'
import { logAdminAction } from './audit.actions'
import { ResumeTemplate } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getResumesAction(params?: {
  query?: string
  template?: ResumeTemplate
  minScore?: number
  page?: number
  limit?: number
}) {
  try {
    await requireAdminSession()

    const page = params?.page || 1
    const limit = params?.limit || 20
    const skip = (page - 1) * limit

    const where: any = {}

    if (params?.query) {
      where.OR = [
        { title: { contains: params.query, mode: 'insensitive' } },
        { user: { name: { contains: params.query, mode: 'insensitive' } } },
        { user: { email: { contains: params.query, mode: 'insensitive' } } },
      ]
    }

    if (params?.template) {
      where.template = params.template
    }

    if (params?.minScore) {
      where.atsScore = { gte: params.minScore }
    }

    const [total, resumes] = await Promise.all([
      db.resumeVersion.count({ where }),
      db.resumeVersion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
          jd: {
            select: { title: true },
          },
        },
      }),
    ])

    return {
      success: true,
      data: resumes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch resumes' }
  }
}

export async function getResumeDetailsAction(id: string) {
  try {
    await requireAdminSession()

    const resume = await db.resumeVersion.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, createdAt: true },
        },
        jd: true,
      },
    })
    if (!resume) return { success: false, error: 'Resume not found' }
    return { success: true, data: resume }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteResumeAction(id: string) {
  try {
    await requireAdminSession()

    const deleted = await db.resumeVersion.delete({
      where: { id },
      select: { id: true, title: true, userId: true },
    })

    await logAdminAction({
      action: 'ADMIN_DELETE_RESUME',
      entity: 'ResumeVersion',
      entityId: id,
      details: { title: deleted.title, userId: deleted.userId },
    })

    revalidatePath('/resumes')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete resume' }
  }
}

export async function getTemplateLocksAction() {
  try {
    await requireAdminSession()

    const locks = await db.resumeTemplateLock.findMany({
      orderBy: { template: 'asc' },
      include: {
        planPackage: {
          select: { id: true, name: true, slug: true },
        },
      },
    })
    return { success: true, data: locks }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch template locks' }
  }
}

export async function updateTemplateLockAction(params: {
  template: ResumeTemplate
  isLocked: boolean
  requiredPlanSlug: string
  lockReason?: string
}) {
  try {
    await requireAdminSession()

    // Find plan package matching requiredPlanSlug
    const plan = await db.planPackage.findUnique({
      where: { slug: params.requiredPlanSlug },
    })

    const lock = await db.resumeTemplateLock.upsert({
      where: { template: params.template },
      update: {
        isLocked: params.isLocked,
        requiredPlanSlug: params.requiredPlanSlug,
        planPackageId: plan?.id || null,
        lockReason: params.lockReason || 'Upgrade to access this premium template',
      },
      create: {
        template: params.template,
        isLocked: params.isLocked,
        requiredPlanSlug: params.requiredPlanSlug,
        planPackageId: plan?.id || null,
        lockReason: params.lockReason || 'Upgrade to access this premium template',
      },
    })

    await logAdminAction({
      action: 'UPDATE_TEMPLATE_LOCK',
      entity: 'ResumeTemplateLock',
      entityId: lock.id,
      details: params,
    })

    revalidatePath('/resumes')
    return { success: true, data: lock }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update template lock' }
  }
}
