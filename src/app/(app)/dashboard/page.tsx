import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { DashboardClient } from './_components/dashboard-client'

export const metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [profileRes, resumesRes, chatsRes, activityRes, userRes] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('*, personal_info(*), educations(*), experiences(*), projects(*), skills(*), certifications(*)')
      .eq('userId', session.user.id)
      .maybeSingle(),
    supabaseAdmin
      .from('resume_versions')
      .select('*, job_descriptions(*)')
      .eq('userId', session.user.id)
      .order('updatedAt', { ascending: false })
      .limit(6),
    supabaseAdmin
      .from('chats')
      .select('*')
      .eq('userId', session.user.id)
      .order('updatedAt', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('activity_logs')
      .select('*')
      .eq('userId', session.user.id)
      .order('createdAt', { ascending: false })
      .limit(8),
    supabaseAdmin
      .from('users')
      .select('name, email, emailVerified')
      .eq('id', session.user.id)
      .single(),
  ])

  // Normalize profile shape to match what ProfileClient expects
  const rawProfile = profileRes.data
  const profile = rawProfile
    ? {
        ...rawProfile,
        personalInfo: Array.isArray((rawProfile as any).personal_info)
          ? (rawProfile as any).personal_info[0] ?? null
          : (rawProfile as any).personal_info ?? null,
        educations: (rawProfile as any).educations ?? [],
        experiences: (rawProfile as any).experiences ?? [],
        projects: (rawProfile as any).projects ?? [],
        skills: (rawProfile as any).skills ?? [],
        certifications: (rawProfile as any).certifications ?? [],
      }
    : null

  const dbUser = userRes.data

  return (
    <DashboardClient
      user={{
        ...session.user,
        name: dbUser?.name || session.user.name,
        email: dbUser?.email || session.user.email,
        emailVerified: dbUser?.emailVerified ? new Date(dbUser.emailVerified) : undefined,
      }}
      profile={profile}
      recentResumes={resumesRes.data ?? []}
      recentChats={chatsRes.data ?? []}
      recentActivity={activityRes.data ?? []}
    />
  )
}
