import { supabaseAdmin } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/email'
import { syncUserToSupabaseAuth } from '@/lib/supabase'
import { sendVerificationTokenAction } from '@/server/actions/auth.actions'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = schema.parse(body)
    const normalizedEmail = email.toLowerCase().trim()

    const { data: exists } = await supabaseAdmin
      .from('users')
      .select('id, password, name')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (exists) {
      if (!exists.password) {
        // User originally signed up via Google/OAuth. Attach password so they can log in both ways!
        const hashedPassword = await bcrypt.hash(password, 12)
        const now = new Date().toISOString()
        await supabaseAdmin
          .from('users')
          .update({ password: hashedPassword, name: exists.name || name, updatedAt: now })
          .eq('id', exists.id)
        return NextResponse.json({ id: exists.id, email: normalizedEmail }, { status: 200 })
      }

      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const now = new Date().toISOString()
    const userId = crypto.randomUUID()

    // 1. Create User in Supabase Postgres
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        updatedAt: now,
      })
      .select('id, email')
      .single()

    if (error || !user) throw new Error(error?.message || 'Failed to create user')

    // 2. Create Profile + PersonalInfo
    const profileId = crypto.randomUUID()
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .insert({ id: profileId, userId: user.id, updatedAt: now })
      .select('id')
      .single()

    if (profile) {
      await supabaseAdmin.from('personal_info').insert({
        id: crypto.randomUUID(),
        profileId: profile.id,
        fullName: name,
        email: normalizedEmail,
        updatedAt: now,
      })
    }

    // 3. Sync user to Supabase Authentication
    await syncUserToSupabaseAuth({ email: normalizedEmail, name, userId: user.id, password })

    // 4. Send Verification Email & Welcome Email via Resend
    try {
      await sendVerificationTokenAction(email)
      await sendWelcomeEmail({ email, name })
    } catch (emailErr) {
      console.warn('Email sending failed during registration:', emailErr)
    }

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 })
    }
    console.error('Registration error:', error)
    const errMessage = error instanceof Error ? error.message : 'Internal server error'
    if (errMessage.includes('does not exist') || errMessage.includes('connect')) {
      return NextResponse.json(
        { message: 'Database connection failed. Please check your Supabase setup.' },
        { status: 503 }
      )
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
