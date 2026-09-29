import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect, notFound } from 'next/navigation'
import { ResumeViewClient } from './_components/resume-view-client'

export const metadata: Metadata = { title: 'View Resume' }

interface ResumeDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ResumeDetailPage({ params }: ResumeDetailPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const resolvedParams = await params

  const [resumeRes, profileRes] = await Promise.all([
    supabaseAdmin
      .from('resume_versions')
      .select('*, job_descriptions(title)')
      .eq('id', resolvedParams.id)
      .maybeSingle(),
    supabaseAdmin
      .from('profiles')
      .select('*, personal_info(*), experiences(*), projects(*), educations(*), skills(*)')
      .eq('userId', session.user.id)
      .maybeSingle(),
  ])

  const resume = resumeRes.data
  if (!resume || resume.userId !== session.user.id) {
    notFound()
  }

  // Normalize resume jd shape
  const normalizedResume = {
    ...resume,
    jd: (resume as any).job_descriptions ?? null,
  }

  // Normalize profile shape
  const rawProfile = profileRes.data
  const profile = rawProfile
    ? {
        ...rawProfile,
        personalInfo: Array.isArray((rawProfile as any).personal_info)
          ? (rawProfile as any).personal_info[0] ?? null
          : (rawProfile as any).personal_info ?? null,
        experiences: (rawProfile as any).experiences ?? [],
        projects: (rawProfile as any).projects ?? [],
        educations: (rawProfile as any).educations ?? [],
        skills: (rawProfile as any).skills ?? [],
      }
    : null

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
      <ResumeViewClient resume={normalizedResume} profile={profile} />
    </div>
  )
}
