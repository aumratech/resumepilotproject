'use server'

import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/admin-auth'
import { logAdminAction } from './audit.actions'
import { DegreeType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getDegreesAction() {
  try {
    await requireAdminSession()

    const degrees = await db.degree.findMany({
      orderBy: { name: 'asc' },
      include: {
        branches: {
          orderBy: { name: 'asc' },
        },
      },
    })
    return { success: true, data: degrees }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch degrees' }
  }
}

export async function createDegreeAction(data: {
  name: string
  code: string
  type: DegreeType
  durationYears: number
  branches?: { name: string; code?: string }[]
}) {
  try {
    await requireAdminSession()

    const degree = await db.degree.create({
      data: {
        name: data.name.trim(),
        code: data.code.trim(),
        type: data.type,
        durationYears: Number(data.durationYears || 4),
        branches: {
          create:
            data.branches?.map((b) => ({
              name: b.name.trim(),
              code: b.code?.trim() || null,
            })) || [],
        },
      },
      include: { branches: true },
    })

    await logAdminAction({
      action: 'CREATE_DEGREE',
      entity: 'Degree',
      entityId: degree.id,
      details: { name: degree.name, code: degree.code, branchesCount: degree.branches.length },
    })

    revalidatePath('/degrees')
    return { success: true, data: degree }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create degree' }
  }
}

export async function updateDegreeAction(
  id: string,
  data: {
    name?: string
    code?: string
    type?: DegreeType
    durationYears?: number
    isActive?: boolean
  }
) {
  try {
    await requireAdminSession()

    const updated = await db.degree.update({
      where: { id },
      data: {
        ...data,
        durationYears: data.durationYears !== undefined ? Number(data.durationYears) : undefined,
      },
    })

    await logAdminAction({
      action: 'UPDATE_DEGREE',
      entity: 'Degree',
      entityId: id,
      details: data,
    })

    revalidatePath('/degrees')
    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update degree' }
  }
}

export async function deleteDegreeAction(id: string) {
  try {
    await requireAdminSession()

    const deleted = await db.degree.delete({
      where: { id },
    })

    await logAdminAction({
      action: 'DELETE_DEGREE',
      entity: 'Degree',
      entityId: id,
      details: { name: deleted.name, code: deleted.code },
    })

    revalidatePath('/degrees')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete degree' }
  }
}

export async function createBranchAction(
  degreeId: string,
  data: {
    name: string
    code?: string
  }
) {
  try {
    await requireAdminSession()

    const branch = await db.degreeBranch.create({
      data: {
        degreeId,
        name: data.name.trim(),
        code: data.code?.trim() || null,
      },
    })

    await logAdminAction({
      action: 'CREATE_DEGREE_BRANCH',
      entity: 'DegreeBranch',
      entityId: branch.id,
      details: { degreeId, branchName: branch.name },
    })

    revalidatePath('/degrees')
    return { success: true, data: branch }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add branch' }
  }
}

export async function deleteBranchAction(branchId: string) {
  try {
    await requireAdminSession()

    const branch = await db.degreeBranch.delete({
      where: { id: branchId },
    })

    await logAdminAction({
      action: 'DELETE_DEGREE_BRANCH',
      entity: 'DegreeBranch',
      entityId: branchId,
      details: { name: branch.name, degreeId: branch.degreeId },
    })

    revalidatePath('/degrees')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete branch' }
  }
}
