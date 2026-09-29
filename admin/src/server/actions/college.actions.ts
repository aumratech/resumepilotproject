'use server'

import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/admin-auth'
import { logAdminAction } from './audit.actions'
import { revalidatePath } from 'next/cache'

export async function getCollegesAction(params?: {
  search?: string
  tier?: string
  state?: string
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
        { code: { contains: params.search, mode: 'insensitive' } },
        { city: { contains: params.search, mode: 'insensitive' } },
        { state: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    if (params?.tier && params.tier !== 'all') {
      where.tier = params.tier
    }

    if (params?.state && params.state !== 'all') {
      where.state = params.state
    }

    const [total, colleges] = await Promise.all([
      db.college.count({ where }),
      db.college.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ tier: 'asc' }, { name: 'asc' }],
      }),
    ])

    return {
      success: true,
      data: colleges,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch colleges' }
  }
}

export async function createCollegeAction(data: {
  name: string
  code?: string
  state?: string
  city?: string
  country?: string
  tier?: string
  website?: string
  logoUrl?: string
  isVerified?: boolean
  isActive?: boolean
}) {
  try {
    await requireAdminSession()

    const college = await db.college.create({
      data: {
        name: data.name.trim(),
        code: data.code?.trim() || null,
        state: data.state?.trim() || null,
        city: data.city?.trim() || null,
        country: data.country?.trim() || 'India',
        tier: data.tier || 'Tier 1',
        website: data.website?.trim() || null,
        logoUrl: data.logoUrl?.trim() || null,
        isVerified: data.isVerified !== undefined ? data.isVerified : true,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    })

    await logAdminAction({
      action: 'CREATE_COLLEGE',
      entity: 'College',
      entityId: college.id,
      details: { name: college.name, tier: college.tier },
    })

    revalidatePath('/colleges')
    return { success: true, data: college }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create college' }
  }
}

export async function updateCollegeAction(
  id: string,
  data: {
    name?: string
    code?: string
    state?: string
    city?: string
    country?: string
    tier?: string
    website?: string
    logoUrl?: string
    isVerified?: boolean
    isActive?: boolean
  }
) {
  try {
    await requireAdminSession()

    const updated = await db.college.update({
      where: { id },
      data: {
        ...data,
      },
    })

    await logAdminAction({
      action: 'UPDATE_COLLEGE',
      entity: 'College',
      entityId: id,
      details: data,
    })

    revalidatePath('/colleges')
    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update college' }
  }
}

export async function deleteCollegeAction(id: string) {
  try {
    await requireAdminSession()

    const deleted = await db.college.delete({
      where: { id },
    })

    await logAdminAction({
      action: 'DELETE_COLLEGE',
      entity: 'College',
      entityId: id,
      details: { name: deleted.name },
    })

    revalidatePath('/colleges')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete college' }
  }
}
