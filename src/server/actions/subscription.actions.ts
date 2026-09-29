'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

const ResumeTemplate = {
  MODERN: 'MODERN',
  PROFESSIONAL: 'PROFESSIONAL',
  MINIMAL: 'MINIMAL',
  ATS: 'ATS',
  EXECUTIVE: 'EXECUTIVE',
  CREATIVE: 'CREATIVE',
  ACADEMIC: 'ACADEMIC',
} as const

export interface PlanFeatureMap {
  [key: string]: boolean
}

export interface UserPlanData {
  subscriptionId?: string
  planId: string
  planName: string
  planSlug: string
  badge?: string | null
  description?: string | null
  priceMonthly: number
  priceYearly: number
  currency: string
  billingCycle: string
  status: string
  currentPeriodEnd?: string | null
  isPremium: boolean
  limits: {
    maxResumes: number
    maxAiGenerations: number
    maxPdfDownloads: number
  }
  usage: {
    resumesCount: number
    aiGenerationsCount: number
    pdfDownloadsCount: number
  }
  features: PlanFeatureMap
  unlockedTemplates: string[]
}

/**
 * Ensures user has an active subscription record. If not, auto-links them to
 * the default active plan configured by the admin (e.g. Free Starter).
 */
export async function getUserPlanAction(): Promise<{
  success: boolean
  data?: UserPlanData
  error?: string
}> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const userId = session.user.id

    // 1. Fetch user's existing subscription
    let { data: subscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*, plan_packages(*)')
      .eq('userId', userId)
      .maybeSingle()

    // 2. If no subscription found, auto-link to default active plan
    if (!subscription) {
      let { data: defaultPlan } = await supabaseAdmin
        .from('plan_packages')
        .select('*')
        .eq('isDefault', true)
        .eq('isActive', true)
        .maybeSingle()

      if (!defaultPlan) {
        const { data: cheapestPlan } = await supabaseAdmin
          .from('plan_packages')
          .select('*')
          .eq('isActive', true)
          .order('priceMonthly', { ascending: true })
          .limit(1)
          .maybeSingle()
        defaultPlan = cheapestPlan
      }

      if (defaultPlan) {
        const now = new Date().toISOString()
        const { data: newSub } = await supabaseAdmin
          .from('user_subscriptions')
          .insert({
            id: crypto.randomUUID(),
            userId,
            planPackageId: defaultPlan.id,
            status: 'active',
            billingCycle: 'monthly',
            currentPeriodStart: now,
            currentPeriodEnd: null,
            updatedAt: now,
          })
          .select('*, plan_packages(*)')
          .single()
        subscription = newSub
      }
    }

    if (!subscription || !subscription.plan_packages) {
      return { success: false, error: 'No active plan package found' }
    }

    const plan = subscription.plan_packages as any

    // 3. Count current usage
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const startOfMonthISO = startOfMonth.toISOString()

    const [resumesRes, aiRes, pdfRes] = await Promise.all([
      supabaseAdmin
        .from('resume_versions')
        .select('*', { count: 'exact', head: true })
        .eq('userId', userId),
      supabaseAdmin
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('userId', userId)
        .eq('type', 'AI_CHAT_GENERATION')
        .gte('createdAt', startOfMonthISO),
      supabaseAdmin
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('userId', userId)
        .eq('type', 'PDF_DOWNLOAD')
        .gte('createdAt', startOfMonthISO),
    ])

    const resumesCount = resumesRes.count ?? 0
    const aiGenerationsCount = aiRes.count ?? 0
    const pdfDownloadsCount = pdfRes.count ?? 0

    // 4. Resolve custom features map
    const featuresMap: PlanFeatureMap = {}
    if (Array.isArray(plan.customFeatures)) {
      for (const item of plan.customFeatures as any[]) {
        if (item && item.key) {
          featuresMap[item.key] = !!item.included
        }
      }
    }

    // 5. Resolve unlocked templates based on ResumeTemplateLock rules set by admin
    const { data: templateLocks } = await supabaseAdmin.from('resume_template_locks').select('*')
    const allTemplates = Object.values(ResumeTemplate)

    const planHierarchy: Record<string, number> = {
      free: 1,
      starter: 2,
      pro: 3,
      enterprise: 4,
    }
    const userTierLevel = planHierarchy[plan.slug.toLowerCase()] || (plan.priceMonthly > 0 ? 2 : 1)

    const unlockedTemplates = allTemplates.filter((tmpl) => {
      const lock = (templateLocks ?? []).find((l: any) => l.template === tmpl)
      if (!lock || !lock.isLocked) return true
      const requiredTier = planHierarchy[lock.requiredPlanSlug?.toLowerCase()] || 1
      return userTierLevel >= requiredTier
    })

    const isPremium = plan.slug !== 'free' && (plan.priceMonthly > 0 || !plan.isDefault)

    return {
      success: true,
      data: {
        subscriptionId: subscription.id,
        planId: plan.id,
        planName: plan.name,
        planSlug: plan.slug,
        badge: plan.badge,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        currency: plan.currency || 'USD',
        billingCycle: subscription.billingCycle || 'monthly',
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd ?? null,
        isPremium,
        limits: {
          maxResumes: subscription.customMaxResumes ?? plan.maxResumes,
          maxAiGenerations: subscription.customMaxAiGenerations ?? plan.maxAiGenerations,
          maxPdfDownloads: plan.maxPdfDownloads,
        },
        usage: {
          resumesCount,
          aiGenerationsCount,
          pdfDownloadsCount,
        },
        features: featuresMap,
        unlockedTemplates,
      },
    }
  } catch (error: any) {
    console.error('Error fetching user plan:', error)
    return { success: false, error: error.message || 'Failed to retrieve plan' }
  }
}

/**
 * Fetch all active plans created by admin for display on the pricing page.
 */
export async function getActivePlansAction() {
  try {
    const { data: plans } = await supabaseAdmin
      .from('plan_packages')
      .select('*')
      .eq('isActive', true)
      .order('sortOrder', { ascending: true })

    return { success: true, data: plans }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch active plans' }
  }
}

/**
 * Purchase / Upgrade to an admin-configured plan package.
 */
export async function purchasePlanAction(params: {
  planPackageId: string
  billingCycle: 'monthly' | 'yearly'
  paymentMethod?: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('Please log in to purchase or upgrade a plan')
    }

    const userId = session.user.id

    // 1. Fetch targeted plan package
    const { data: targetPlan } = await supabaseAdmin
      .from('plan_packages')
      .select('*')
      .eq('id', params.planPackageId)
      .single()

    if (!targetPlan || !targetPlan.isActive) {
      throw new Error('Selected plan is currently unavailable.')
    }

    const amount =
      params.billingCycle === 'yearly' ? targetPlan.priceYearly : targetPlan.priceMonthly

    // 2. Calculate subscription period
    const now = new Date()
    const periodEnd = new Date(now)
    if (params.billingCycle === 'yearly') {
      periodEnd.setFullYear(now.getFullYear() + 1)
    } else {
      periodEnd.setMonth(now.getMonth() + 1)
    }

    const nowISO = now.toISOString()

    // 3. Create completed PaymentTransaction in DB
    const transactionId = crypto.randomUUID()
    await supabaseAdmin.from('payment_transactions').insert({
      id: crypto.randomUUID(),
      transactionId,
      userId,
      planPackageId: targetPlan.id,
      amount,
      currency: targetPlan.currency || 'USD',
      status: 'COMPLETED',
      gateway: 'MANUAL',
      billingCycle: params.billingCycle,
      paymentMethod: params.paymentMethod || 'Credit Card',
      customerEmail: session.user.email,
      customerName: session.user.name,
      metadata: {
        planSlug: targetPlan.slug,
        planName: targetPlan.name,
        instantActivation: true,
      },
      updatedAt: nowISO,
    })

    // 4. Update or create user's active subscription
    const { data: existingSub } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id')
      .eq('userId', userId)
      .maybeSingle()

    if (existingSub) {
      await supabaseAdmin
        .from('user_subscriptions')
        .update({
          planPackageId: targetPlan.id,
          status: 'active',
          billingCycle: params.billingCycle,
          currentPeriodStart: nowISO,
          currentPeriodEnd: periodEnd.toISOString(),
          cancelAtPeriodEnd: false,
          updatedAt: nowISO,
        })
        .eq('userId', userId)
    } else {
      await supabaseAdmin.from('user_subscriptions').insert({
        id: crypto.randomUUID(),
        userId,
        planPackageId: targetPlan.id,
        status: 'active',
        billingCycle: params.billingCycle,
        currentPeriodStart: nowISO,
        currentPeriodEnd: periodEnd.toISOString(),
        updatedAt: nowISO,
      })
    }

    // 5. Log activity
    await supabaseAdmin.from('activity_logs').insert({
      id: crypto.randomUUID(),
      userId,
      type: 'PLAN_PURCHASE',
      metadata: {
        planName: targetPlan.name,
        planSlug: targetPlan.slug,
        amount,
        billingCycle: params.billingCycle,
        transactionId,
      },
      createdAt: nowISO,
    })

    revalidatePath('/pricing')
    revalidatePath('/dashboard')
    revalidatePath('/resumes')
    revalidatePath('/templates')
    revalidatePath('/chat')
    revalidatePath('/settings')

    return {
      success: true,
      data: {
        plan: targetPlan,
        transactionId,
      },
    }
  } catch (error: any) {
    console.error('Plan purchase error:', error)
    return { success: false, error: error.message || 'Failed to process plan purchase' }
  }
}

/**
 * Record feature usage (e.g. AI Generation or PDF download) to count against quotas.
 */
export async function recordFeatureUsageAction(type: 'AI_CHAT_GENERATION' | 'PDF_DOWNLOAD') {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false }

    await supabaseAdmin.from('activity_logs').insert({
      id: crypto.randomUUID(),
      userId: session.user.id,
      type,
      metadata: { timestamp: new Date().toISOString() },
      createdAt: new Date().toISOString(),
    })

    return { success: true }
  } catch (err) {
    console.warn('Failed to record feature usage:', err)
    return { success: false }
  }
}
