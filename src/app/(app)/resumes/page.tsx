import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { ResumesListClient } from './_components/resumes-list-client'
import { EmailVerificationBanner } from '@/components/email-verification-banner'

export const metadata: Metadata = { title: 'My Resumes' }

export default async function ResumesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [userRes, resumesRes] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('email, emailVerified')
      .eq('id', session.user.id)
      .single(),
    supabaseAdmin
      .from('resume_versions')
      .select('*, job_descriptions(title)')
      .eq('userId', session.user.id)
      .order('updatedAt', { ascending: false }),
  ])

  const user = userRes.data
  const isVerified = !!user?.emailVerified

  // Normalize resume shape: flatten nested job_descriptions to { jd: { title } }
  const resumes = (resumesRes.data ?? []).map((r: any) => ({
    ...r,
    jd: r.job_descriptions ?? null,
  }))

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto">
        <EmailVerificationBanner email={user?.email} isVerified={isVerified} />

        <div className="mb-8">
          <h1 className="heading-display text-3xl text-foreground mb-2">My Resumes</h1>
          <p className="text-muted-foreground">All your AI-generated resume versions</p>
        </div>

        <ResumesListClient initialResumes={resumes} isVerified={isVerified} />
      </div>
    </div>
  )
}
