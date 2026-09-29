'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin, deleteUserFromSupabaseAuth } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function updateAccountInfoAction(data: { name: string; email: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const now = new Date().toISOString()
  await supabaseAdmin
    .from('users')
    .update({ name: data.name, email: data.email, updatedAt: now })
    .eq('id', session.user.id)

  revalidatePath('/settings')
  return { success: true }
}

export async function changePasswordAction(data: { currentPassword?: string; newPassword: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('password')
    .eq('id', session.user.id)
    .single()

  if (!user) throw new Error('User not found')

  if (user.password) {
    if (!data.currentPassword) {
      throw new Error('Current password is required to change password')
    }
    const isMatch = await bcrypt.compare(data.currentPassword, user.password)
    if (!isMatch) throw new Error('Current password does not match')
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 10)
  const now = new Date().toISOString()

  await supabaseAdmin
    .from('users')
    .update({ password: hashedPassword, updatedAt: now })
    .eq('id', session.user.id)

  return { success: true }
}

export async function clearChatHistoryAction() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await supabaseAdmin.from('chats').delete().eq('userId', session.user.id)

  revalidatePath('/chat')
  return { success: true }
}

export async function deleteAccountAction() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('email')
    .eq('id', session.user.id)
    .single()

  // 1. Delete from database (Supabase Postgres)
  await supabaseAdmin.from('users').delete().eq('id', session.user.id)

  // 2. Delete from Supabase Authentication
  if (user?.email) {
    await deleteUserFromSupabaseAuth(user.email)
  }

  return { success: true }
}

export async function exportUserDataAction() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { data: user } = await supabaseAdmin
    .from('users')
    .select(`
      *,
      profiles!userId(
        *,
        personal_info(*),
        experiences(*),
        projects(*),
        skills(*),
        educations(*),
        certifications(*)
      ),
      resume_versions(*),
      chats!userId(*, messages(*))
    `)
    .eq('id', session.user.id)
    .single()

  return JSON.stringify(user, null, 2)
}
