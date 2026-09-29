import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { getSavedJdsAction } from '@/server/actions/jd.actions'
import { SavedJdsClient } from './_components/saved-jds-client'
import { EmailVerificationBanner } from '@/components/email-verification-banner'

export const metadata: Metadata = {
  title: 'Saved Job Descriptions | ResumeAI',
  description: 'Manage, analyze, and tailor resumes to your saved target job descriptions.',
}

export default async function SavedJdsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [userRes, jds] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('email, emailVerified')
      .eq('id', session.user.id)
      .single(),
    getSavedJdsAction(),
  ])

  const user = userRes.data
  const isVerified = !!user?.emailVerified

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <EmailVerificationBanner email={user?.email} isVerified={isVerified} />
        <SavedJdsClient initialJds={jds} isVerified={isVerified} />
      </div>
    </div>
  )
}
