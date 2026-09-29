'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { UserPlanData, getUserPlanAction } from '@/server/actions/subscription.actions'

interface PlanContextValue {
  plan: UserPlanData | null
  loading: boolean
  isPremium: boolean
  refreshPlan: () => Promise<void>
  hasFeature: (featureKey: string) => boolean
  isTemplateUnlocked: (template: string) => boolean
  hasResumeQuota: () => boolean
  hasAiQuota: () => boolean
  hasPdfQuota: () => boolean
}

const PlanContext = createContext<PlanContextValue | null>(null)

export function PlanProvider({
  initialPlan,
  children,
}: {
  initialPlan: UserPlanData | null
  children: React.ReactNode
}) {
  const [plan, setPlan] = useState<UserPlanData | null>(initialPlan)
  const [loading, setLoading] = useState(false)

  const refreshPlan = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getUserPlanAction()
      if (res.success && res.data) {
        setPlan(res.data)
      }
    } catch (err) {
      console.error('Failed to refresh plan:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const hasFeature = useCallback(
    (featureKey: string) => {
      if (!plan) return false
      return !!plan.features[featureKey]
    },
    [plan]
  )

  const isTemplateUnlocked = useCallback(
    (template: string) => {
      if (!plan) return template === 'MODERN' || template === 'ATS' || template === 'MINIMAL'
      return plan.unlockedTemplates.includes(template)
    },
    [plan]
  )

  const hasResumeQuota = useCallback(() => {
    if (!plan) return true
    if (plan.limits.maxResumes === -1) return true
    return plan.usage.resumesCount < plan.limits.maxResumes
  }, [plan])

  const hasAiQuota = useCallback(() => {
    if (!plan) return true
    if (plan.limits.maxAiGenerations === -1) return true
    return plan.usage.aiGenerationsCount < plan.limits.maxAiGenerations
  }, [plan])

  const hasPdfQuota = useCallback(() => {
    if (!plan) return true
    if (plan.limits.maxPdfDownloads === -1) return true
    return plan.usage.pdfDownloadsCount < plan.limits.maxPdfDownloads
  }, [plan])

  return (
    <PlanContext.Provider
      value={{
        plan,
        loading,
        isPremium: !!plan?.isPremium,
        refreshPlan,
        hasFeature,
        isTemplateUnlocked,
        hasResumeQuota,
        hasAiQuota,
        hasPdfQuota,
      }}
    >
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() {
  const context = useContext(PlanContext)
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider')
  }
  return context
}
