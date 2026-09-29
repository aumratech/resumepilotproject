'use server'

import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/admin-auth'
import { logAdminAction } from './audit.actions'
import { revalidatePath } from 'next/cache'

export async function getLandingPageConfigsAction() {
  try {
    const configs = await db.landingPageConfig.findMany({
      orderBy: { order: 'asc' },
    })
    return { success: true, data: configs }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch CMS configs' }
  }
}

export async function updateLandingPageConfigAction(params: {
  sectionKey: string
  title?: string
  subtitle?: string
  badge?: string
  content: Record<string, any>
  isActive?: boolean
}) {
  try {
    const admin = await requireAdminSession()

    const updated = await db.landingPageConfig.upsert({
      where: { sectionKey: params.sectionKey },
      update: {
        title: params.title,
        subtitle: params.subtitle,
        badge: params.badge,
        content: params.content,
        isActive: params.isActive !== undefined ? params.isActive : true,
        updatedBy: admin.email,
      },
      create: {
        sectionKey: params.sectionKey,
        title: params.title,
        subtitle: params.subtitle,
        badge: params.badge,
        content: params.content,
        isActive: params.isActive !== undefined ? params.isActive : true,
        updatedBy: admin.email,
      },
    })

    await logAdminAction({
      action: 'UPDATE_LANDING_PAGE_CMS',
      entity: 'LandingPageConfig',
      entityId: updated.id,
      details: { sectionKey: params.sectionKey, title: params.title },
    })

    revalidatePath('/landing-page')
    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update CMS config' }
  }
}

export async function toggleLandingPageSectionAction(sectionKey: string, isActive: boolean) {
  try {
    const admin = await requireAdminSession()

    const updated = await db.landingPageConfig.update({
      where: { sectionKey },
      data: { isActive, updatedBy: admin.email },
    })

    await logAdminAction({
      action: 'TOGGLE_LANDING_PAGE_SECTION',
      entity: 'LandingPageConfig',
      entityId: updated.id,
      details: { sectionKey, isActive },
    })

    revalidatePath('/landing-page')
    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to toggle section' }
  }
}
