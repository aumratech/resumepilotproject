'use server'

import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/admin-auth'
import { logAdminAction } from './audit.actions'
import { revalidatePath } from 'next/cache'

export async function getUsersAction(params?: {
  search?: string
  planSlug?: string
  page?: number
  limit?: number
}) {
  try {
    await requireAdminSession()

    const page = params?.page || 1
    const limit = params?.limit || 20
    const skip = (page - 1) * limit

    const where: any = {}

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    if (params?.planSlug && params.planSlug !== 'all') {
      where.subscriptions = {
        some: {
          planPackage: { slug: params.planSlug },
          status: 'active',
        },
      }
    }

    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: {
            select: { completionScore: true, isPublic: true },
          },
          subscriptions: {
            where: { status: 'active' },
            include: { planPackage: true },
            take: 1,
          },
          _count: {
            select: { resumes: true, chats: true, payments: true },
          },
        },
      }),
    ])

    return {
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch users' }
  }
}

export async function getUserDetailsAction(id: string) {
  try {
    await requireAdminSession()

    const user = await db.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            personalInfo: true,
            educations: true,
            experiences: true,
            skills: true,
          },
        },
        subscriptions: {
          include: { planPackage: true },
          orderBy: { createdAt: 'desc' },
        },
        resumes: {
          orderBy: { updatedAt: 'desc' },
          take: 10,
        },
        payments: {
          include: { planPackage: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 15,
        },
      },
    })

    if (!user) return { success: false, error: 'User not found' }
    return { success: true, data: user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateUserPlanAction(params: {
  userId: string
  planPackageId: string
  billingCycle?: string
}) {
  try {
    const admin = await requireAdminSession()

    const plan = await db.planPackage.findUnique({
      where: { id: params.planPackageId },
    })
    if (!plan) return { success: false, error: 'Plan package not found' }

    const subscription = await db.userSubscription.upsert({
      where: { userId: params.userId },
      update: {
        planPackageId: params.planPackageId,
        status: 'active',
        billingCycle: params.billingCycle || 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      create: {
        userId: params.userId,
        planPackageId: params.planPackageId,
        status: 'active',
        billingCycle: params.billingCycle || 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    await logAdminAction({
      action: 'ADMIN_OVERRIDE_USER_PLAN',
      entity: 'UserSubscription',
      entityId: subscription.id,
      details: { userId: params.userId, planName: plan.name, planSlug: plan.slug, adminEmail: admin.email },
    })

    revalidatePath('/users')
    return { success: true, data: subscription }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update user plan' }
  }
}

export async function grantCustomLimitsAction(params: {
  userId: string
  customMaxResumes?: number
  customMaxAiGenerations?: number
}) {
  try {
    const admin = await requireAdminSession()

    // Get active subscription or create one with free plan
    let sub = await db.userSubscription.findUnique({
      where: { userId: params.userId },
    })

    if (!sub) {
      const freePlan = await db.planPackage.findFirst({ where: { slug: 'free' } })
      if (!freePlan) return { success: false, error: 'Free plan not found' }

      sub = await db.userSubscription.create({
        data: {
          userId: params.userId,
          planPackageId: freePlan.id,
          status: 'active',
        },
      })
    }

    const updated = await db.userSubscription.update({
      where: { id: sub.id },
      data: {
        customMaxResumes: params.customMaxResumes,
        customMaxAiGenerations: params.customMaxAiGenerations,
      },
    })

    await logAdminAction({
      action: 'GRANT_CUSTOM_LIMITS',
      entity: 'UserSubscription',
      entityId: updated.id,
      details: { userId: params.userId, customMaxResumes: params.customMaxResumes, customMaxAiGenerations: params.customMaxAiGenerations, adminEmail: admin.email },
    })

    revalidatePath('/users')
    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to grant custom limits' }
  }
}

export async function deleteUserAction(userId: string) {
  try {
    await requireAdminSession()

    const deleted = await db.user.delete({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    })

    await logAdminAction({
      action: 'DELETE_USER',
      entity: 'User',
      entityId: userId,
      details: { email: deleted.email, name: deleted.name },
    })

    revalidatePath('/users')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete user' }
  }
}
