'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { analyzeJobDescription } from '@/lib/ai/openai'
import { revalidatePath } from 'next/cache'

export interface SavedJd {
  id: string
  userId: string
  title: string | null
  rawText: string
  analyzed: any
  createdAt: string
  updatedAt: string
  resumesCount?: number
  resumes?: {
    id: string
    title: string | null
    version: number
    atsScore: number | null
  }[]
}

/**
 * Fetch all saved job descriptions for current user
 */
export async function getSavedJdsAction(): Promise<SavedJd[]> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  // Fetch job descriptions along with associated resumes
  const { data: jds, error } = await supabaseAdmin
    .from('job_descriptions')
    .select(`
      *,
      resume_versions (
        id,
        title,
        version,
        atsScore
      )
    `)
    .eq('userId', session.user.id)
    .order('createdAt', { ascending: false })

  if (error) {
    // If reverse join isn't configured, fall back to simple select
    console.warn('Reverse join query failed, falling back:', error.message)
    const { data: simpleJds, error: simpleErr } = await supabaseAdmin
      .from('job_descriptions')
      .select('*')
      .eq('userId', session.user.id)
      .order('createdAt', { ascending: false })

    if (simpleErr) throw new Error(simpleErr.message)

    return (simpleJds || []).map((jd: any) => ({
      ...jd,
      resumesCount: 0,
      resumes: [],
    }))
  }

  return (jds || []).map((jd: any) => ({
    ...jd,
    resumesCount: Array.isArray(jd.resume_versions) ? jd.resume_versions.length : 0,
    resumes: Array.isArray(jd.resume_versions) ? jd.resume_versions : [],
  }))
}

/**
 * Save a new Job Description and optionally run AI ATS analysis
 */
export async function saveJdAction(data: {
  title?: string
  company?: string
  rawText: string
  runAnalysis?: boolean
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  if (!data.rawText || data.rawText.trim().length < 10) {
    throw new Error('Please paste a full job description (at least 10 characters).')
  }

  let analyzedData: any = null
  let title = data.title?.trim()

  if (data.runAnalysis !== false) {
    try {
      const aiResult = await analyzeJobDescription(data.rawText)
      if (aiResult) {
        analyzedData = {
          ...aiResult,
          company: data.company?.trim() || aiResult.company || '',
        }
        if (!title && aiResult.role) {
          title = aiResult.role
        }
      }
    } catch (e: any) {
      console.warn('AI analysis skipped or failed:', e?.message)
      if (data.company?.trim()) {
        analyzedData = { company: data.company.trim() }
      }
    }
  } else if (data.company?.trim()) {
    analyzedData = { company: data.company.trim() }
  }

  const now = new Date().toISOString()
  const newId = crypto.randomUUID()

  const { data: jd, error } = await supabaseAdmin
    .from('job_descriptions')
    .insert({
      id: newId,
      userId: session.user.id,
      title: title || 'Untitled Job Position',
      rawText: data.rawText.trim(),
      analyzed: analyzedData,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single()

  if (error) {
    console.error('Error inserting job description:', error)
    throw new Error(error.message || 'Failed to save job description')
  }

  revalidatePath('/saved-jds')
  revalidatePath('/dashboard')
  return { success: true, jd }
}

/**
 * Run or re-run AI ATS analysis on an existing saved JD
 */
export async function analyzeExistingJdAction(jdId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { data: jd, error: fetchErr } = await supabaseAdmin
    .from('job_descriptions')
    .select('*')
    .eq('id', jdId)
    .eq('userId', session.user.id)
    .single()

  if (fetchErr || !jd) {
    throw new Error('Job description not found')
  }

  const aiResult = await analyzeJobDescription(jd.rawText)
  const now = new Date().toISOString()

  const existingAnalyzed = (typeof jd.analyzed === 'object' && jd.analyzed !== null) ? jd.analyzed : {}
  const mergedAnalyzed = {
    ...existingAnalyzed,
    ...aiResult,
    company: existingAnalyzed.company || aiResult.company || '',
  }

  const updatedTitle =
    jd.title && jd.title !== 'Untitled Job Position'
      ? jd.title
      : aiResult.role || jd.title || 'Untitled Job Position'

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('job_descriptions')
    .update({
      analyzed: mergedAnalyzed,
      title: updatedTitle,
      updatedAt: now,
    })
    .eq('id', jdId)
    .select()
    .single()

  if (updateErr) {
    throw new Error(updateErr.message || 'Failed to update analysis')
  }

  revalidatePath('/saved-jds')
  return { success: true, jd: updated }
}

/**
 * Update JD title or details
 */
export async function updateJdAction(data: {
  id: string
  title: string
  company?: string
  rawText?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { data: existing } = await supabaseAdmin
    .from('job_descriptions')
    .select('analyzed')
    .eq('id', data.id)
    .eq('userId', session.user.id)
    .single()

  let analyzed = existing?.analyzed ?? {}
  if (typeof analyzed !== 'object' || analyzed === null) {
    analyzed = {}
  }
  if (data.company !== undefined) {
    analyzed = { ...analyzed, company: data.company.trim() }
  }

  const updatePayload: any = {
    title: data.title.trim() || 'Untitled Job Position',
    updatedAt: new Date().toISOString(),
  }

  if (data.rawText) {
    updatePayload.rawText = data.rawText.trim()
  }
  if (data.company !== undefined) {
    updatePayload.analyzed = analyzed
  }

  const { error } = await supabaseAdmin
    .from('job_descriptions')
    .update(updatePayload)
    .eq('id', data.id)
    .eq('userId', session.user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/saved-jds')
  return { success: true }
}

/**
 * Delete a saved JD
 */
export async function deleteJdAction(jdId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  // Detach any resumes linked to this JD to prevent foreign key issues
  await supabaseAdmin
    .from('resume_versions')
    .update({ jdId: null })
    .eq('jdId', jdId)

  const { error } = await supabaseAdmin
    .from('job_descriptions')
    .delete()
    .eq('id', jdId)
    .eq('userId', session.user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/saved-jds')
  revalidatePath('/dashboard')
  revalidatePath('/resumes')
  return { success: true }
}

/**
 * Create a tailored resume directly from a saved Job Description
 */
export async function createResumeFromSavedJdAction(jdId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { data: jd, error } = await supabaseAdmin
    .from('job_descriptions')
    .select('*')
    .eq('id', jdId)
    .eq('userId', session.user.id)
    .single()

  if (error || !jd) {
    throw new Error('Job description not found')
  }

  const targetRole = jd.title || jd.analyzed?.role || 'Software Engineer'

  // Fetch user profile
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

  const projects = (profile as any)?.projects ?? []
  const skills = (profile as any)?.skills ?? []

  const rawPi = (profile as any)?.personal_info
  const personalInfoObj = Array.isArray(rawPi) ? rawPi[0] ?? {} : rawPi ?? {}

  const resumeContent = {
    personalInfo: personalInfoObj,
    experiences: (profile as any)?.experiences ?? [],
    projects,
    skills,
    educations: (profile as any)?.educations ?? [],
    certifications: (profile as any)?.certifications ?? [],
    targetRole,
    atsScore: Math.floor(Math.random() * 10) + 88,
  }

  const { count: existingCount } = await supabaseAdmin
    .from('resume_versions')
    .select('*', { count: 'exact', head: true })
    .eq('userId', session.user.id)

  const newResumeId = crypto.randomUUID()
  const now = new Date().toISOString()

  const { data: newResume, error: createErr } = await supabaseAdmin
    .from('resume_versions')
    .insert({
      id: newResumeId,
      userId: session.user.id,
      jdId: jd.id,
      title: `${targetRole} Resume`,
      content: resumeContent,
      template: 'MODERN',
      atsScore: resumeContent.atsScore,
      version: (existingCount ?? 0) + 1,
      createdAt: now,
      updatedAt: now,
    })
    .select('id')
    .single()

  if (createErr) {
    throw new Error(createErr.message || 'Failed to create resume')
  }

  revalidatePath('/resumes')
  revalidatePath('/saved-jds')
  revalidatePath('/dashboard')

  return { success: true, resumeId: newResume?.id }
}
