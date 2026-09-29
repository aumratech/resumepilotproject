import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { streamChatResponse } from '@/lib/ai/openai'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { messages, chatId, profileSummary } = await req.json()

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
  }

  // Check subscription and AI generation quota
  let { data: userSub } = await supabaseAdmin
    .from('user_subscriptions')
    .select('*, plan_packages(*)')
    .eq('userId', session.user.id)
    .maybeSingle()

  if (!userSub) {
    const { data: defaultPlan } = await supabaseAdmin
      .from('plan_packages')
      .select('*')
      .eq('isDefault', true)
      .eq('isActive', true)
      .maybeSingle()

    if (defaultPlan) {
      const now = new Date().toISOString()
      const { data: newSub } = await supabaseAdmin
        .from('user_subscriptions')
        .insert({
          id: crypto.randomUUID(),
          userId: session.user.id,
          planPackageId: defaultPlan.id,
          status: 'active',
          billingCycle: 'monthly',
          updatedAt: now,
        })
        .select('*, plan_packages(*)')
        .single()
      userSub = newSub
    }
  }

  const planPackage = (userSub as any)?.plan_packages
  const maxAiGenerations =
    (userSub as any)?.customMaxAiGenerations ??
    planPackage?.maxAiGenerations ??
    10

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: usedAiCount } = await supabaseAdmin
    .from('activity_logs')
    .select('*', { count: 'exact', head: true })
    .eq('userId', session.user.id)
    .eq('type', 'AI_CHAT_GENERATION')
    .gte('createdAt', startOfMonth.toISOString())

  if (maxAiGenerations !== -1 && (usedAiCount ?? 0) >= maxAiGenerations) {
    return NextResponse.json(
      {
        error: `Monthly AI prompt quota reached (${usedAiCount}/${maxAiGenerations}). Please upgrade your plan on the Premium tab to continue AI tailoring.`,
        quotaExceeded: true,
      },
      { status: 429 }
    )
  }

  // Fetch full profile from database
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      personal_info(*),
      experiences(*),
      projects(*),
      skills(*),
      educations(*),
      certifications(*)
    `)
    .eq('userId', session.user.id)
    .maybeSingle()

  // Normalize profile shape for AI context
  const normalizedProfile = profile
    ? {
        ...profile,
        personalInfo: (profile as any).personal_info?.[0] ?? (profile as any).personal_info ?? null,
        experiences: (profile as any).experiences ?? [],
        projects: (profile as any).projects ?? [],
        skills: (profile as any).skills ?? [],
        educations: (profile as any).educations ?? [],
        certifications: (profile as any).certifications ?? [],
      }
    : null

  const systemPrompt = `You are ResumeAI, an expert AI resume architect and ATS specialist. 
Your goal is to analyze the user's complete profile against job descriptions or role requests, recommend which projects, skills, and experiences to highlight, and ASK FOR USER APPROVAL before generating tailored resumes.

${
  normalizedProfile
    ? `User Profile:
Name: ${normalizedProfile.personalInfo?.fullName ?? 'Candidate'}
Current Role: ${normalizedProfile.personalInfo?.currentRole ?? 'Not specified'}
Projects (${normalizedProfile.projects.length}): ${normalizedProfile.projects
        .map((p: any) => `${p.name} [Tech: ${Array.isArray(p.techStack) ? p.techStack.join(', ') : p.techStack}] - ${p.description || ''}`)
        .join('; ')}
Skills (${normalizedProfile.skills.length}): ${normalizedProfile.skills.map((s: any) => s.name).join(', ')}
Experiences (${normalizedProfile.experiences.length}): ${normalizedProfile.experiences.map((e: any) => `${e.role} at ${e.company}`).join('; ')}`
    : 'No saved profile yet'
}

Workflow:
1. When user inputs a JD or role, analyze all user projects, skills, and work experiences.
2. Recommend the specific projects and skills that best fit the target role.
3. Show ATS match breakdown.
4. Always ask for user confirmation/approval before generating the resume. Add \`\`\`create_resume_proposal:TargetRole\`\`\` at the bottom.`

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let fullContent = ''

      try {
        for await (const chunk of streamChatResponse(messages, systemPrompt, normalizedProfile)) {
          fullContent += chunk
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
        }

        // Save the message to DB only if chat belongs to authenticated user
        if (chatId) {
          const { data: chat } = await supabaseAdmin
            .from('chats')
            .select('id')
            .eq('id', chatId)
            .eq('userId', session.user.id)
            .maybeSingle()

          if (chat) {
            await supabaseAdmin.from('messages').insert({
              id: crypto.randomUUID(),
              chatId,
              role: 'ASSISTANT',
              content: fullContent,
            }).then(() => {}).catch(console.error)
          }

          // Record AI generation usage
          await supabaseAdmin.from('activity_logs').insert({
            id: crypto.randomUUID(),
            userId: session.user.id,
            type: 'AI_CHAT_GENERATION',
            metadata: { chatId },
            createdAt: new Date().toISOString(),
          }).then(() => {}).catch(console.error)
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        console.error('Stream error:', error)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`)
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
