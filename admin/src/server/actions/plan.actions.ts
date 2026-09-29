'use server'

import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/admin-auth'
import { logAdminAction } from './audit.actions'
import { revalidatePath } from 'next/cache'

export interface CustomFeatureItem {
  key: string
  label: string
  included: boolean
}

export async function getPlansAction() {
  try {
    await requireAdminSession()

    const plans = await db.planPackage.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { subscriptions: true, payments: true },
        },
      },
    })
    return { success: true, data: plans }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch plans' }
  }
}

export async function createPlanAction(data: {
  name: string
  slug: string
  description?: string
  priceMonthly: number
  priceYearly: number
  currency?: string
  badge?: string
  isPopular?: boolean
  isActive?: boolean
  isDefault?: boolean
  maxResumes?: number
  maxAiGenerations?: number
  maxPdfDownloads?: number
  customFeatures: CustomFeatureItem[]
  sortOrder?: number
}) {
  try {
    await requireAdminSession()

    const plan = await db.planPackage.create({
      data: {
        name: data.name,
        slug: data.slug.toLowerCase().trim(),
        description: data.description || '',
        priceMonthly: Number(data.priceMonthly),
        priceYearly: Number(data.priceYearly),
        currency: data.currency || 'USD',
        badge: data.badge || null,
        isPopular: !!data.isPopular,
        isActive: data.isActive !== undefined ? !!data.isActive : true,
        isDefault: !!data.isDefault,
        maxResumes: Number(data.maxResumes ?? 1),
        maxAiGenerations: Number(data.maxAiGenerations ?? 10),
        maxPdfDownloads: Number(data.maxPdfDownloads ?? 3),
        customFeatures: data.customFeatures as any,
        sortOrder: Number(data.sortOrder ?? 0),
      },
    })

    await logAdminAction({
      action: 'CREATE_PLAN_PACKAGE',
      entity: 'PlanPackage',
      entityId: plan.id,
      details: { name: plan.name, slug: plan.slug, priceMonthly: plan.priceMonthly },
    })

    revalidatePath('/plans')
    return { success: true, data: plan }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create plan' }
  }
}

export async function updatePlanAction(
  id: string,
  data: {
    name?: string
    slug?: string
    description?: string
    priceMonthly?: number
    priceYearly?: number
    currency?: string
    badge?: string | null
    isPopular?: boolean
    isActive?: boolean
    isDefault?: boolean
    maxResumes?: number
    maxAiGenerations?: number
    maxPdfDownloads?: number
    customFeatures?: CustomFeatureItem[]
    sortOrder?: number
  }
) {
  try {
    await requireAdminSession()

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.slug !== undefined) updateData.slug = data.slug.toLowerCase().trim()
    if (data.description !== undefined) updateData.description = data.description
    if (data.priceMonthly !== undefined) updateData.priceMonthly = Number(data.priceMonthly)
    if (data.priceYearly !== undefined) updateData.priceYearly = Number(data.priceYearly)
    if (data.currency !== undefined) updateData.currency = data.currency
    if (data.badge !== undefined) updateData.badge = data.badge
    if (data.isPopular !== undefined) updateData.isPopular = data.isPopular
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault
    if (data.maxResumes !== undefined) updateData.maxResumes = Number(data.maxResumes)
    if (data.maxAiGenerations !== undefined) updateData.maxAiGenerations = Number(data.maxAiGenerations)
    if (data.maxPdfDownloads !== undefined) updateData.maxPdfDownloads = Number(data.maxPdfDownloads)
    if (data.customFeatures !== undefined) updateData.customFeatures = data.customFeatures
    if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder)

    const updated = await db.planPackage.update({
      where: { id },
      data: updateData,
    })

    await logAdminAction({
      action: 'UPDATE_PLAN_PACKAGE',
      entity: 'PlanPackage',
      entityId: updated.id,
      details: updateData,
    })

    revalidatePath('/plans')
    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update plan' }
  }
}

export async function deletePlanAction(id: string) {
  try {
    await requireAdminSession()

    // Check if plan has active subscribers
    const activeSubsCount = await db.userSubscription.count({
      where: { planPackageId: id },
    })

    if (activeSubsCount > 0) {
      return {
        success: false,
        error: `Cannot delete plan with ${activeSubsCount} active subscriber(s). Please migrate users or disable plan instead.`,
      }
    }

    const deleted = await db.planPackage.delete({
      where: { id },
    })

    await logAdminAction({
      action: 'DELETE_PLAN_PACKAGE',
      entity: 'PlanPackage',
      entityId: id,
      details: { name: deleted.name, slug: deleted.slug },
    })

    revalidatePath('/plans')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete plan' }
  }
}
