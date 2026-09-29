import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { ProfileClient } from './_components/profile-client'

export const metadata = { title: 'Profile' }

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // 1. Attempt to fetch profile with all related entities
  let { data: rawProfile, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      personal_info(*),
      educations(*),
      experiences(*),
      internships(*),
      projects(*, project_role_tags(*)),
      skills(*),
      certifications(*),
      achievements(*),
      publications(*),
      volunteer_experiences(*),
      extracurriculars(*),
      resume_preferences(*)
    `)
    .eq('userId', session.user.id)
    .maybeSingle()

  if (error) {
    console.warn('Profile primary query error, using fallback select:', error.message)
    const fallbackRes = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        personal_info(*),
        educations(*),
        experiences(*),
        internships(*),
        projects(*),
        skills(*),
        certifications(*),
        achievements(*),
        publications(*),
        volunteer_experiences(*),
        extracurriculars(*),
        resume_preferences(*)
      `)
      .eq('userId', session.user.id)
      .maybeSingle()
    rawProfile = fallbackRes.data
  }

  // 2. If profile doesn't exist yet, auto-create one and pre-populate personal_info
  if (!rawProfile) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('name, email')
      .eq('id', session.user.id)
      .maybeSingle()

    const profileId = crypto.randomUUID()
    const now = new Date().toISOString()
    const { data: newProfile } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: profileId,
        userId: session.user.id,
        completionScore: 15,
        createdAt: now,
        updatedAt: now,
      })
      .select('*')
      .single()

    if (newProfile) {
      const { data: newPi } = await supabaseAdmin
        .from('personal_info')
        .insert({
          id: crypto.randomUUID(),
          profileId: newProfile.id,
          fullName: user?.name ?? session.user.name ?? '',
          email: user?.email ?? session.user.email ?? '',
          updatedAt: now,
        })
        .select('*')
        .single()

      rawProfile = {
        ...newProfile,
        personal_info: newPi ? [newPi] : [],
      }
    }
  } else {
    // 3. If profile exists but personal_info is missing, auto-create it with user's name & email
    const piList = (rawProfile as any).personal_info
    const hasPi = Array.isArray(piList) ? piList.length > 0 : !!piList
    if (!hasPi) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('name, email')
        .eq('id', session.user.id)
        .maybeSingle()

      const now = new Date().toISOString()
      const { data: newPi } = await supabaseAdmin
        .from('personal_info')
        .insert({
          id: crypto.randomUUID(),
          profileId: rawProfile.id,
          fullName: user?.name ?? session.user.name ?? '',
          email: user?.email ?? session.user.email ?? '',
          updatedAt: now,
        })
        .select('*')
        .single()

      if (newPi) {
        ;(rawProfile as any).personal_info = [newPi]
      }
    }
  }

  const sortByOrder = (arr: any[] = []) =>
    [...arr].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const sortByCat = (arr: any[] = []) =>
    [...arr].sort((a, b) => String(a.category ?? '').localeCompare(String(b.category ?? '')))

  // Normalize PostgREST shape to match what ProfileClient expects (Prisma-like shape)
  const profile = rawProfile
    ? {
        ...rawProfile,
        personalInfo: Array.isArray((rawProfile as any).personal_info)
          ? (rawProfile as any).personal_info[0] ?? null
          : (rawProfile as any).personal_info ?? null,
        educations: sortByOrder((rawProfile as any).educations ?? []),
        experiences: sortByOrder((rawProfile as any).experiences ?? []),
        internships: sortByOrder((rawProfile as any).internships ?? []),
        projects: sortByOrder((rawProfile as any).projects ?? []).map((p: any) => ({
          ...p,
          roleTags: Array.isArray(p.project_role_tags)
            ? p.project_role_tags
            : [],
        })),
        skills: sortByCat((rawProfile as any).skills ?? []),
        certifications: sortByOrder((rawProfile as any).certifications ?? []),
        achievements: sortByOrder((rawProfile as any).achievements ?? []),
        publications: sortByOrder((rawProfile as any).publications ?? []),
        volunteerExp: sortByOrder((rawProfile as any).volunteer_experiences ?? []),
        extracurriculars: sortByOrder((rawProfile as any).extracurriculars ?? []),
        resumePreferences: Array.isArray((rawProfile as any).resume_preferences)
          ? (rawProfile as any).resume_preferences[0] ?? null
          : (rawProfile as any).resume_preferences ?? null,
      }
    : null

  return <ProfileClient profile={profile} userId={session.user.id} />
}
