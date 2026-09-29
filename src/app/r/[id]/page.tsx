import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import { Lock, Sparkles } from 'lucide-react'
import { PublicResumeClient } from './_components/public-resume-client'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: resume } = await supabaseAdmin
    .from('resume_versions')
    .select('title, isPublic')
    .eq('id', id)
    .maybeSingle()

  if (!resume || !resume.isPublic) {
    return { title: 'Private Resume | ResumeAI' }
  }

  return {
    title: `${resume.title || 'Resume'} | ResumeAI Public Share`,
    description: `Public shared resume on ResumeAI`,
  }
}

export default async function PublicResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: rawResume } = await supabaseAdmin
    .from('resume_versions')
    .select(`
      *,
      users!userId(
        *,
        profiles!userId(
          *,
          personal_info(*),
          educations(*),
          experiences(*),
          projects(*),
          skills(*),
          certifications(*)
        )
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (!rawResume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Resume Not Found</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          This resume does not exist or has been permanently removed.
        </p>
        <Link
          href="/"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-brand hover:opacity-90 transition-all"
        >
          Go to ResumeAI Home
        </Link>
      </div>
    )
  }

  if (!rawResume.isPublic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 border border-amber-500/20">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">This Resume is Private</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          The owner of this resume has disabled public sharing. Only the author can view this document.
        </p>
        <Link
          href="/"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-brand hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Sparkles size={16} />
          <span>Build Your Own Resume on ResumeAI</span>
        </Link>
      </div>
    )
  }

  // Normalize nested profile shape
  const rawUser = (rawResume as any).users
  const rawProfile = rawUser?.profiles?.[0] ?? rawUser?.profiles ?? null
  const normalizedResume = {
    ...rawResume,
    user: rawUser
      ? {
          ...rawUser,
          profile: rawProfile
            ? {
                ...rawProfile,
                personalInfo: Array.isArray(rawProfile.personal_info)
                  ? rawProfile.personal_info[0] ?? null
                  : rawProfile.personal_info ?? null,
                educations: rawProfile.educations ?? [],
                experiences: rawProfile.experiences ?? [],
                projects: rawProfile.projects ?? [],
                skills: rawProfile.skills ?? [],
                certifications: rawProfile.certifications ?? [],
              }
            : null,
        }
      : null,
  }

  return <PublicResumeClient resume={JSON.parse(JSON.stringify(normalizedResume))} />
}
