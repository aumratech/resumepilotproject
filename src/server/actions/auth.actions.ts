'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { sendPasswordResetEmail, sendVerificationEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const resetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function sendVerificationTokenAction(email: string) {
  try {
    const targetEmail = email.toLowerCase()
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await supabaseAdmin
      .from('verification_tokens')
      .delete()
      .eq('identifier', targetEmail)

    await supabaseAdmin.from('verification_tokens').insert({
      identifier: targetEmail,
      token,
      expires: expires.toISOString(),
    })

    await sendVerificationEmail({ email: targetEmail, token })
    return { success: true }
  } catch (err) {
    console.error('Send verification token error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send verification link' }
  }
}

export async function resendVerificationAction() {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Unauthorized')

  const res = await sendVerificationTokenAction(session.user.email)
  if (!res.success) throw new Error(res.error || 'Failed to send verification email')

  return { success: true }
}

export async function verifyEmailAction(data: { email: string; token: string }) {
  try {
    const targetEmail = data.email.toLowerCase()

    // 1. Check if user is already verified
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('emailVerified')
      .eq('email', targetEmail)
      .maybeSingle()

    if (user?.emailVerified) {
      return { success: true }
    }

    // 2. Search for token
    const { data: verificationToken } = await supabaseAdmin
      .from('verification_tokens')
      .select('*')
      .eq('identifier', targetEmail)
      .eq('token', data.token)
      .maybeSingle()

    if (!verificationToken) {
      // Re-check if user was verified concurrently / on first render
      const { data: recheck } = await supabaseAdmin
        .from('users')
        .select('emailVerified')
        .eq('email', targetEmail)
        .maybeSingle()
      if (recheck?.emailVerified) {
        return { success: true }
      }
      throw new Error('Invalid or expired verification link.')
    }

    if (new Date(verificationToken.expires) < new Date()) {
      await supabaseAdmin
        .from('verification_tokens')
        .delete()
        .eq('identifier', targetEmail)
      throw new Error('This verification link has expired. Please request a new link.')
    }

    // Mark email verified in database
    const now = new Date().toISOString()
    await supabaseAdmin
      .from('users')
      .update({ emailVerified: now, updatedAt: now })
      .eq('email', targetEmail)

    // Clean up verification token
    await supabaseAdmin
      .from('verification_tokens')
      .delete()
      .eq('identifier', targetEmail)

    revalidatePath('/dashboard')
    revalidatePath('/resumes')
    revalidatePath('/profile')

    return { success: true }
  } catch (err) {
    console.error('Verify email error:', err)
    throw new Error(err instanceof Error ? err.message : 'Email verification failed.')
  }
}

export async function requestPasswordResetAction(email: string) {
  try {
    const parsed = forgotSchema.parse({ email })
    const targetEmail = parsed.email.toLowerCase().trim()

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', targetEmail)
      .maybeSingle()

    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Clean up previous tokens for this email
      await supabaseAdmin
        .from('verification_tokens')
        .delete()
        .eq('identifier', targetEmail)

      // Store new token
      await supabaseAdmin.from('verification_tokens').insert({
        identifier: targetEmail,
        token,
        expires: expires.toISOString(),
      })

      // Send email securely via Resend
      await sendPasswordResetEmail({ email: targetEmail, token })
    }

    // Always return a generic success message to prevent user enumeration
    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(err.errors[0]?.message || 'Invalid email')
    }
    console.error('Password reset request error:', err)
    throw new Error('Failed to send reset link. Please try again.')
  }
}

export async function resetPasswordAction(data: {
  email: string
  token: string
  newPassword: string
}) {
  try {
    const { email, token, newPassword } = resetSchema.parse(data)
    const targetEmail = email.toLowerCase()

    const { data: verificationToken } = await supabaseAdmin
      .from('verification_tokens')
      .select('*')
      .eq('identifier', targetEmail)
      .eq('token', token)
      .maybeSingle()

    if (!verificationToken) {
      throw new Error('Invalid or expired password reset token.')
    }

    if (new Date(verificationToken.expires) < new Date()) {
      await supabaseAdmin
        .from('verification_tokens')
        .delete()
        .eq('identifier', targetEmail)
      throw new Error('This password reset link has expired. Please request a new one.')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    const now = new Date().toISOString()

    await supabaseAdmin
      .from('users')
      .update({ password: hashedPassword, updatedAt: now })
      .eq('email', targetEmail)

    // Remove used token
    await supabaseAdmin
      .from('verification_tokens')
      .delete()
      .eq('identifier', targetEmail)

    return { success: true }
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(err.errors[0]?.message || 'Invalid input')
    }
    console.error('Password reset error:', err)
    throw new Error(err instanceof Error ? err.message : 'Failed to reset password.')
  }
}
