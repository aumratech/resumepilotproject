import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { ChatInterface } from './_components/chat-interface'

export const metadata = { title: 'AI Chat' }

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // Get profile for AI context
  const [profileRes, chatsRes] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select(`
        *,
        personal_info(*),
        experiences(*),
        projects(*, project_role_tags(*)),
        skills(*),
        educations(*),
        certifications(*)
      `)
      .eq('userId', session.user.id)
      .maybeSingle(),
    supabaseAdmin
      .from('chats')
      .select('*, messages(*)')
      .eq('userId', session.user.id)
      .order('updatedAt', { ascending: false })
      .limit(30),
  ])

  let rawProfile = profileRes.data
  if (profileRes.error) {
    console.warn('Chat profile query error, using fallback:', profileRes.error.message)
    const fallbackRes = await supabaseAdmin
      .from('profiles')
      .select('*, personal_info(*), experiences(*), projects(*), skills(*), educations(*), certifications(*)')
      .eq('userId', session.user.id)
      .maybeSingle()
    rawProfile = fallbackRes.data
  }

  // Normalize profile for the ChatInterface component
  const profile = rawProfile
    ? {
        ...rawProfile,
        personalInfo: Array.isArray((rawProfile as any).personal_info)
          ? (rawProfile as any).personal_info[0] ?? null
          : (rawProfile as any).personal_info ?? null,
        experiences: (rawProfile as any).experiences ?? [],
        projects: ((rawProfile as any).projects ?? []).map((p: any) => ({
          ...p,
          roleTags: p.project_role_tags ?? [],
        })),
        skills: (rawProfile as any).skills ?? [],
        educations: (rawProfile as any).educations ?? [],
        certifications: (rawProfile as any).certifications ?? [],
      }
    : null

  // Build profile summary for AI
  const profileSummary = profile
    ? `
Name: ${profile.personalInfo?.fullName ?? 'Unknown'}
Role: ${profile.personalInfo?.currentRole ?? 'Not specified'}
Skills: ${profile.skills.map((s: any) => s.name).join(', ')}
Experience: ${profile.experiences.map((e: any) => `${e.role} at ${e.company}`).join(', ')}
Projects: ${profile.projects.map((p: any) => `${p.name} (${(p.techStack as string[]).join(', ')})`).join('; ')}
Education: ${profile.educations.map((e: any) => `${e.degree} from ${e.institution}`).join(', ')}
    `.trim()
    : 'No profile created yet'

  return (
    <ChatInterface
      userId={session.user.id}
      chats={JSON.parse(JSON.stringify(chatsRes.data ?? []))}
      profileSummary={profileSummary}
      profileComplete={!!profile?.personalInfo}
    />
  )
}
