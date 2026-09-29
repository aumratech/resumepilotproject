'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function deleteResumeAction(resumeId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { data: resume } = await supabaseAdmin
    .from('resume_versions')
    .select('userId')
    .eq('id', resumeId)
    .maybeSingle()

  if (!resume || resume.userId !== session.user.id) {
    throw new Error('Resume not found or permission denied')
  }

  await supabaseAdmin.from('resume_versions').delete().eq('id', resumeId)

  revalidatePath('/resumes')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function createTailoredResumeAction(data: {
  title?: string
  targetRole?: string
  selectedProjects?: string[]
  selectedSkills?: string[]
  jdText?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('emailVerified')
    .eq('id', session.user.id)
    .single()

  if (!user?.emailVerified) {
    throw new Error('Please verify your email address before creating resumes.')
  }

  const targetRole = data.targetRole || 'Software Engineer'

  // Get complete profile data
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

  // Create JobDescription record if jdText is present
  let jdId: string | undefined = undefined
  if (data.jdText) {
    const now = new Date().toISOString()
    const { data: jd } = await supabaseAdmin
      .from('job_descriptions')
      .insert({
        id: crypto.randomUUID(),
        userId: session.user.id,
        title: targetRole,
        rawText: data.jdText,
        analyzed: { role: targetRole },
        createdAt: now,
        updatedAt: now,
      })
      .select('id')
      .single()
    jdId = jd?.id
  }

  const projects = (profile as any)?.projects ?? []
  const skills = (profile as any)?.skills ?? []

  const selectedProjList = projects.filter(
    (p: any) =>
      !data.selectedProjects?.length ||
      data.selectedProjects.some(
        (sp) =>
          p.name.toLowerCase().includes(sp.toLowerCase()) ||
          sp.toLowerCase().includes(p.name.toLowerCase())
      )
  )

  const selectedSkillList = skills.filter(
    (s: any) =>
      !data.selectedSkills?.length ||
      data.selectedSkills.some(
        (ss) =>
          s.name.toLowerCase().includes(ss.toLowerCase()) ||
          ss.toLowerCase().includes(s.name.toLowerCase())
      )
  )

  const rawPi = (profile as any)?.personal_info
  const personalInfoObj = Array.isArray(rawPi) ? rawPi[0] ?? {} : rawPi ?? {}

  const resumeContent = {
    personalInfo: personalInfoObj,
    experiences: (profile as any)?.experiences ?? [],
    projects: selectedProjList.length > 0 ? selectedProjList : projects,
    skills: selectedSkillList.length > 0 ? selectedSkillList : skills,
    educations: (profile as any)?.educations ?? [],
    certifications: (profile as any)?.certifications ?? [],
    targetRole,
    atsScore: Math.floor(Math.random() * 12) + 86,
  }

  const { count: existingCount } = await supabaseAdmin
    .from('resume_versions')
    .select('*', { count: 'exact', head: true })
    .eq('userId', session.user.id)

  // Check subscription and plan quota limit
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
  const maxAllowedResumes =
    userSub?.customMaxResumes ??
    planPackage?.maxResumes ??
    1

  const currentCount = existingCount ?? 0
  if (maxAllowedResumes !== -1 && currentCount >= maxAllowedResumes) {
    throw new Error(
      `Resume creation limit reached (${currentCount}/${maxAllowedResumes}). Please upgrade your plan on the Premium tab to create more resumes.`
    )
  }

  const now = new Date().toISOString()
  const { data: newResume } = await supabaseAdmin
    .from('resume_versions')
    .insert({
      id: crypto.randomUUID(),
      userId: session.user.id,
      title: data.title || `${targetRole} - Tailored Resume v${currentCount + 1}`,
      content: resumeContent as any,
      version: currentCount + 1,
      atsScore: resumeContent.atsScore,
      jdId: jdId ?? null,
      updatedAt: now,
    })
    .select('id')
    .single()

  revalidatePath('/resumes')
  revalidatePath('/dashboard')

  return { success: true, resumeId: newResume?.id }
}

export async function toggleResumePublicAction(resumeId: string, isPublic: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { data: resume } = await supabaseAdmin
    .from('resume_versions')
    .select('userId')
    .eq('id', resumeId)
    .maybeSingle()

  if (!resume || resume.userId !== session.user.id) {
    throw new Error('Resume not found or permission denied')
  }

  const now = new Date().toISOString()
  await supabaseAdmin
    .from('resume_versions')
    .update({ isPublic, updatedAt: now })
    .eq('id', resumeId)

  revalidatePath(`/resumes/${resumeId}`)
  revalidatePath('/resumes')
  return { success: true, isPublic }
}

export async function updateResumeTitleAction(resumeId: string, title: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { data: resume } = await supabaseAdmin
    .from('resume_versions')
    .select('userId')
    .eq('id', resumeId)
    .maybeSingle()

  if (!resume || resume.userId !== session.user.id) {
    throw new Error('Resume not found or permission denied')
  }

  const trimmedTitle = title.trim() || 'Untitled Resume'
  const now = new Date().toISOString()

  await supabaseAdmin
    .from('resume_versions')
    .update({ title: trimmedTitle, updatedAt: now })
    .eq('id', resumeId)

  revalidatePath(`/resumes/${resumeId}`)
  revalidatePath('/resumes')
  revalidatePath('/dashboard')

  return { success: true, title: trimmedTitle }
}
