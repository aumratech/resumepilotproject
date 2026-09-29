import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey && resendApiKey !== 're_demo_key' ? new Resend(resendApiKey) : null

export async function sendWelcomeEmail({
  email,
  name,
}: {
  email: string
  name?: string | null
}) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY is not configured or set to demo key. Skipping welcome email.')
    return { success: false, message: 'RESEND_API_KEY not configured' }
  }

  const recipientName = name || 'there'
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev'

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Welcome to ResumeAI! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Welcome to ResumeAI, ${recipientName}!</h2>
          <p>We're thrilled to have you on board.</p>
          <p>With ResumeAI, you can:</p>
          <ul>
            <li>Create ATS-optimized resumes tailored to any job description</li>
            <li>Analyze your resume score against target job specs</li>
            <li>Chat with our AI career assistant to polish your profile</li>
          </ul>
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Go to Dashboard &rarr;
            </a>
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 40px;">
            If you did not sign up for ResumeAI, please ignore this email.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('[Resend] Error sending welcome email:', error)
      return { success: false, error }
    }

    console.log(`[Resend] Welcome email sent successfully to ${email} (ID: ${data?.id})`)
    return { success: true, data }
  } catch (err: any) {
    console.error('[Resend] Unexpected error sending email:', err)
    return { success: false, error: err?.message || 'Email sending failed' }
  }
}

export async function sendPasswordResetEmail({
  email,
  token,
}: {
  email: string
  token: string
}) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY is not configured or set to demo key. Skipping password reset email.')
    return { success: false, message: 'RESEND_API_KEY not configured' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev'

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Reset your ResumeAI password 🔒',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Reset Your Password</h2>
          <p>We received a request to reset your password for your ResumeAI account.</p>
          <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Reset Password &rarr;
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 13px; word-break: break-all; color: #4f46e5;">${resetLink}</p>
          <p style="font-size: 12px; color: #666; margin-top: 40px;">
            If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('[Resend] Error sending password reset email:', error)
      return { success: false, error }
    }

    console.log(`[Resend] Password reset email sent to ${email} (ID: ${data?.id})`)
    return { success: true, data }
  } catch (err: any) {
    console.error('[Resend] Unexpected error sending password reset email:', err)
    return { success: false, error: err?.message || 'Password reset email failed' }
  }
}

export async function sendVerificationEmail({
  email,
  token,
}: {
  email: string
  token: string
}) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY is not configured or set to demo key. Skipping verification email.')
    return { success: false, message: 'RESEND_API_KEY not configured' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verifyLink = `${appUrl}/verify?token=${token}&email=${encodeURIComponent(email)}`
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev'

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Verify your email address - ResumeAI ✉️',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Verify Your Email Address</h2>
          <p>Thank you for creating an account with ResumeAI!</p>
          <p>Please click the button below to verify your email address and unlock full access to create and edit resumes.</p>
          <div style="margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Verify Email Address &rarr;
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 13px; word-break: break-all; color: #4f46e5;">${verifyLink}</p>
          <p style="font-size: 12px; color: #666; margin-top: 40px;">
            If you did not create an account on ResumeAI, please ignore this email.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('[Resend] Error sending verification email:', error)
      return { success: false, error }
    }

    console.log(`[Resend] Verification email sent to ${email} (ID: ${data?.id})`)
    return { success: true, data }
  } catch (err: any) {
    console.error('[Resend] Unexpected error sending verification email:', err)
    return { success: false, error: err?.message || 'Verification email failed' }
  }
}
