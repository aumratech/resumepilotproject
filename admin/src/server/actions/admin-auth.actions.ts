'use server'

import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { setAdminSession, clearAdminSession, getAdminSession } from '@/lib/admin-auth'
import { logAdminAction } from './audit.actions'
import { redirect } from 'next/navigation'

export async function loginAdminAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' }
  }

  try {
    const admin = await db.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!admin || !admin.isActive) {
      return { success: false, error: 'Invalid credentials or inactive account' }
    }

    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Update last login
    await db.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    })

    // Set session cookie
    await setAdminSession({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    })

    await logAdminAction({
      action: 'ADMIN_LOGIN',
      entity: 'AdminUser',
      entityId: admin.id,
      details: { email: admin.email, role: admin.role },
    })

    return { success: true }
  } catch (error: any) {
    console.error('Login error:', error)
    return { success: false, error: error.message || 'Login failed' }
  }
}

export async function logoutAdminAction() {
  const session = await getAdminSession()
  if (session) {
    await logAdminAction({
      action: 'ADMIN_LOGOUT',
      entity: 'AdminUser',
      entityId: session.adminId,
      details: { email: session.email },
    })
  }
  await clearAdminSession()
  redirect('/login')
}

export async function getCurrentAdminAction() {
  try {
    const session = await getAdminSession()
    if (!session) return { success: false, admin: null }

    const admin = await db.adminUser.findUnique({
      where: { id: session.adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
      },
    })

    if (!admin || !admin.isActive) {
      return { success: false, admin: null }
    }

    return { success: true, admin }
  } catch (error: any) {
    return { success: false, error: error.message, admin: null }
  }
}
