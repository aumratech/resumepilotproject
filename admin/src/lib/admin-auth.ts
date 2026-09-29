import { cookies } from 'next/headers'
import crypto from 'crypto'
import { db } from './db'
import { AdminRole } from '@prisma/client'

const ADMIN_COOKIE_NAME = 'resumeai_admin_session'
const AUTH_SECRET =
  process.env.ADMIN_AUTH_SECRET ||
  process.env.AUTH_SECRET ||
  'dev-secret-key-32-characters-long-for-resumeai'

if (process.env.NODE_ENV === 'production' && (!process.env.ADMIN_AUTH_SECRET && !process.env.AUTH_SECRET)) {
  console.warn('⚠️ SECURITY WARNING: ADMIN_AUTH_SECRET or AUTH_SECRET should be configured in production.')
}

export interface AdminSessionPayload {
  adminId: string
  email: string
  name: string
  role: AdminRole
  exp: number
}

// Generate secure signature for session token
function signToken(payload: AdminSessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(data)
    .digest('base64url')
  return `${data}.${signature}`
}

// Verify token using constant-time comparison to prevent timing attacks
export function verifyToken(token: string): AdminSessionPayload | null {
  try {
    const [data, signature] = token.split('.')
    if (!data || !signature) return null

    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(data)
      .digest('base64url')

    const sigBuf = Buffer.from(signature)
    const expectedBuf = Buffer.from(expectedSignature)

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null
    }

    const payload: AdminSessionPayload = JSON.parse(
      Buffer.from(data, 'base64url').toString('utf8')
    )

    if (Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export async function setAdminSession(admin: {
  id: string
  email: string
  name: string
  role: AdminRole
}) {
  const cookieStore = await cookies()
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  const token = signToken({
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    exp,
  })

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get(ADMIN_COOKIE_NAME)
  if (!tokenCookie || !tokenCookie.value) return null
  return verifyToken(tokenCookie.value)
}

export async function requireAdminSession() {
  const session = await getAdminSession()
  if (!session) {
    throw new Error('Unauthorized: Admin session required')
  }

  // Also verify in DB that admin user is still active
  const admin = await db.adminUser.findUnique({
    where: { id: session.adminId },
    select: { id: true, email: true, name: true, role: true, isActive: true, avatarUrl: true },
  })

  if (!admin || !admin.isActive) {
    throw new Error('Unauthorized: Admin account is inactive or deleted')
  }

  return admin
}
