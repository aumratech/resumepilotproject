'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { extractFromDescription } from '@/lib/ai/openai'

// ─── Helper: ensure profile exists, return { id } ─────────────────────────
async function ensureProfile(userId: string) {
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('id, userId')
    .eq('userId', userId)
    .maybeSingle()

  if (existing) return existing

  const now = new Date().toISOString()
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .insert({ id: crypto.randomUUID(), userId, updatedAt: now })
    .select('id, userId')
    .single()

  if (error || !profile) throw new Error('Failed to create profile')
  return profile
}

// ============ Personal Info ============

const personalInfoSchema = z.object({
  fullName: z.string().optional().nullable(),
  headline: z.string().optional().nullable(),
  currentRole: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  portfolioUrl: z.string().optional().nullable(),
  websiteUrl: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  languages: z.array(z.string()).optional(),
  workAuthorization: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  careerObjective: z.string().optional().nullable(),
})

export async function upsertPersonalInfo(data: z.input<typeof personalInfoSchema>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const validated = personalInfoSchema.parse(data)
  const now = new Date().toISOString()

  const profile = await ensureProfile(session.user.id)

  // Check if personal info exists
  const { data: existing } = await supabaseAdmin
    .from('personal_info')
    .select('id')
    .eq('profileId', profile.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabaseAdmin
      .from('personal_info')
      .update({ ...validated, updatedAt: now })
      .eq('profileId', profile.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabaseAdmin.from('personal_info').insert({
      id: crypto.randomUUID(),
      profileId: profile.id,
      ...validated,
      createdAt: now,
      updatedAt: now,
    })
    if (error) throw new Error(error.message)
  }

  if (validated.fullName) {
    await supabaseAdmin
      .from('users')
      .update({ name: validated.fullName, updatedAt: now })
      .eq('id', session.user.id)
  }

  await updateCompletionScore(session.user.id)
  revalidatePath('/profile')
  revalidatePath('/dashboard')
}

// ============ Education ============

const educationSchema = z.object({
  id: z.string().optional().nullable(),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().optional().nullable(),
  branch: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  cgpa: z.number().min(0).max(10).optional().nullable(),
  percentage: z.number().min(0).max(100).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  currentlyStudying: z.boolean().optional().default(false),
  achievements: z.string().optional().nullable(),
  relevantCoursework: z.string().optional().nullable(),
  order: z.number().optional().default(0),
})

export async function upsertEducation(data: z.input<typeof educationSchema>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const profile = await ensureProfile(session.user.id)
  const { id, startDate, endDate, currentlyStudying, order, ...rest } = educationSchema.parse(data)
  const now = new Date().toISOString()
  const payload = {
    ...rest,
    profileId: profile.id,
    currentlyStudying: currentlyStudying ?? false,
    order: order ?? 0,
    startDate: startDate ? new Date(startDate).toISOString() : null,
    endDate: endDate ? new Date(endDate).toISOString() : null,
    updatedAt: now,
  }

  if (id) {
    const { data: existing } = await supabaseAdmin
      .from('educations')
      .select('id')
      .eq('id', id)
      .eq('profileId', profile.id)
      .maybeSingle()
    if (!existing) throw new Error('Education record not found or unauthorized')

    const { error } = await supabaseAdmin.from('educations').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabaseAdmin.from('educations').insert({ id: crypto.randomUUID(), ...payload })
    if (error) throw new Error(error.message)
  }

  await updateCompletionScore(session.user.id)
  revalidatePath('/profile')
}

export async function deleteEducation(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('userId', session.user.id)
    .maybeSingle()
  if (!profile) return

  await supabaseAdmin.from('educations').delete().eq('id', id).eq('profileId', profile.id)
  await updateCompletionScore(session.user.id)
  revalidatePath('/profile')
}

// ============ Projects ============

const projectSchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional().nullable(),
  techStack: z.array(z.string()).optional().default([]),
  githubUrl: z.string().optional().nullable(),
  liveUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  projectType: z.enum(['PERSONAL', 'COLLEGE', 'COMPANY', 'INTERNSHIP', 'RESEARCH', 'OPEN_SOURCE', 'FREELANCE', 'HACKATHON', 'CLIENT']).optional().default('PERSONAL'),
  role: z.string().optional().nullable(),
  responsibilities: z.string().optional().nullable(),
  achievements: z.string().optional().nullable(),
  problemSolved: z.string().optional().nullable(),
  impact: z.string().optional().nullable(),
  metrics: z.string().optional().nullable(),
  teamSize: z.number().optional().nullable(),
  clientName: z.string().optional().nullable(),
  roleTags: z.array(z.string()).optional().default([]),
  order: z.number().optional().default(0),
})

export async function upsertProject(data: z.input<typeof projectSchema>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const profile = await ensureProfile(session.user.id)
  const { id, startDate, endDate, roleTags, techStack, projectType, order, ...rest } = projectSchema.parse(data)
  const now = new Date().toISOString()

  const payload = {
    ...rest,
    profileId: profile.id,
    techStack: techStack ?? [],
    projectType: projectType ?? 'PERSONAL',
    order: order ?? 0,
    startDate: startDate ? new Date(startDate).toISOString() : null,
    endDate: endDate ? new Date(endDate).toISOString() : null,
    updatedAt: now,
  }

  let projectId: string
  if (id) {
    const { data: existing } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('profileId', profile.id)
      .maybeSingle()
    if (!existing) throw new Error('Project not found or unauthorized')

    const { error } = await supabaseAdmin.from('projects').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
    projectId = id
  } else {
    projectId = crypto.randomUUID()
    const { error } = await supabaseAdmin.from('projects').insert({ id: projectId, ...payload })
    if (error) throw new Error(error.message)
  }

  // Sync roleTags
  await supabaseAdmin.from('project_role_tags').delete().eq('projectId', projectId)
  if (roleTags && roleTags.length > 0) {
    await supabaseAdmin.from('project_role_tags').insert(
      roleTags.map((role) => ({ id: crypto.randomUUID(), projectId, role }))
    )
  }

  // If description exists, extract skills via AI
  if (rest.description && rest.description.length > 50) {
    extractAndSaveSkills(profile.id, rest.description, techStack ?? [], 'PROJECT').catch(console.error)
  }

  await updateCompletionScore(session.user.id)
  revalidatePath('/profile')
}

export async function deleteProject(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('userId', session.user.id)
    .maybeSingle()
  if (!profile) return

  await supabaseAdmin.from('projects').delete().eq('id', id).eq('profileId', profile.id)
  await updateCompletionScore(session.user.id)
  revalidatePath('/profile')
}

// ============ Experience ============

const experienceSchema = z.object({
  id: z.string().optional().nullable(),
  company: z.string().min(1),
  role: z.string().min(1),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP']).optional().default('FULL_TIME'),
  location: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().optional().default(false),
  responsibilities: z.string().optional().nullable(),
  achievements: z.string().optional().nullable(),
  technologies: z.array(z.string()).optional().default([]),
  teamSize: z.number().optional().nullable(),
  hadPromotion: z.boolean().optional().default(false),
  impact: z.string().optional().nullable(),
  managerName: z.string().optional().nullable(),
  order: z.number().optional().default(0),
})

export async function upsertExperience(data: z.input<typeof experienceSchema>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const profile = await ensureProfile(session.user.id)
  const parsed = experienceSchema.parse(data)
  const { id, startDate, endDate, employmentType, isCurrent, hadPromotion, technologies, order, ...rest } = parsed
  const now = new Date().toISOString()

  const payload = {
    ...rest,
    profileId: profile.id,
    employmentType: employmentType ?? 'FULL_TIME',
    isCurrent: isCurrent ?? false,
    hadPromotion: hadPromotion ?? false,
    technologies: technologies ?? [],
    order: order ?? 0,
    startDate: startDate ? new Date(startDate).toISOString() : null,
    endDate: endDate ? new Date(endDate).toISOString() : null,
    updatedAt: now,
  }

  if (id) {
    const { data: existing } = await supabaseAdmin
      .from('experiences')
      .select('id')
      .eq('id', id)
      .eq('profileId', profile.id)
      .maybeSingle()
    if (!existing) throw new Error('Experience not found or unauthorized')

    const { error } = await supabaseAdmin.from('experiences').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabaseAdmin.from('experiences').insert({ id: crypto.randomUUID(), ...payload })
    if (error) throw new Error(error.message)
  }

  if (rest.responsibilities && rest.responsibilities.length > 50) {
    extractAndSaveSkills(profile.id, rest.responsibilities, technologies ?? [], 'EXPERIENCE').catch(console.error)
  }

  await updateCompletionScore(session.user.id)
  revalidatePath('/profile')
}

export async function deleteExperience(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('userId', session.user.id)
    .maybeSingle()
  if (!profile) return

  await supabaseAdmin.from('experiences').delete().eq('id', id).eq('profileId', profile.id)
  await updateCompletionScore(session.user.id)
  revalidatePath('/profile')
}

// ============ Skills ============

export async function upsertSkill(data: {
  name: string
  category: string
  proficiency?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const profile = await ensureProfile(session.user.id)
  const now = new Date().toISOString()

  const { data: existing } = await supabaseAdmin
    .from('skills')
    .select('id')
    .eq('profileId', profile.id)
    .eq('name', data.name)
    .maybeSingle()

  if (existing) {
    const { error } = await supabaseAdmin
      .from('skills')
      .update({ category: data.category, updatedAt: now })
      .eq('id', existing.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabaseAdmin.from('skills').insert({
      id: crypto.randomUUID(),
      profileId: profile.id,
      name: data.name,
      category: data.category,
      proficiency: data.proficiency ?? 'INTERMEDIATE',
      updatedAt: now,
    })
    if (error) throw new Error(error.message)
  }

  await updateCompletionScore(session.user.id)
  revalidatePath('/profile')
}

export async function deleteSkill(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('userId', session.user.id)
    .maybeSingle()
  if (!profile) return

  await supabaseAdmin.from('skills').delete().eq('id', id).eq('profileId', profile.id)
  await updateCompletionScore(session.user.id)
  revalidatePath('/profile')
}

// ============ AI Extraction ============

export async function aiExtractFromText(text: string, context: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const result = await extractFromDescription(text, context)
  return result
}

// ============ Helpers ============

async function extractAndSaveSkills(
  profileId: string,
  text: string,
  technologies: string[],
  source: 'PROJECT' | 'EXPERIENCE'
) {
  try {
    const extracted = await extractFromDescription(text, source.toLowerCase())
    const allSkills = [...(extracted.skills ?? []), ...technologies]
    const now = new Date().toISOString()

    for (const skill of allSkills) {
      if (typeof skill === 'string' && skill.trim()) {
        const name = skill.trim()
        const { data: existing } = await supabaseAdmin
          .from('skills')
          .select('id')
          .eq('profileId', profileId)
          .eq('name', name)
          .maybeSingle()

        if (!existing) {
          await supabaseAdmin.from('skills').insert({
            id: crypto.randomUUID(),
            profileId,
            name,
            category: 'OTHER',
            source: source === 'PROJECT' ? 'PROJECT' : 'EXPERIENCE',
            updatedAt: now,
          })
        }
      }
    }
  } catch (error) {
    console.error('Skill extraction failed:', error)
  }
}

async function updateCompletionScore(userId: string) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select(`
      id,
      personal_info(*),
      educations(*),
      experiences(*),
      projects(*),
      skills(*),
      certifications(*)
    `)
    .eq('userId', userId)
    .maybeSingle()

  if (!profile) return

  const sections = [
    Array.isArray((profile as any).personal_info)
      ? (profile as any).personal_info.length > 0
      : !!(profile as any).personal_info,
    ((profile as any).educations?.length ?? 0) > 0,
    ((profile as any).experiences?.length ?? 0) > 0,
    ((profile as any).projects?.length ?? 0) > 0,
    ((profile as any).skills?.length ?? 0) > 0,
    ((profile as any).certifications?.length ?? 0) > 0,
  ]

  const score = Math.round((sections.filter(Boolean).length / sections.length) * 100)
  const now = new Date().toISOString()

  await supabaseAdmin
    .from('profiles')
    .update({ completionScore: score, updatedAt: now })
    .eq('userId', userId)
}
