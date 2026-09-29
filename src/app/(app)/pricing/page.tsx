import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getActivePlansAction, getUserPlanAction } from '@/server/actions/subscription.actions'
import { PricingClient } from './_components/pricing-client'

export const metadata: Metadata = {
  title: 'Premium Plans & Pricing',
  description: 'Choose the best plan for your career goals. Unlock all AI tailoring, executive templates, and unlimited downloads.',
}

export default async function PricingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [plansRes, userPlanRes] = await Promise.all([
    getActivePlansAction(),
    getUserPlanAction(),
  ])

  const plans = plansRes.success && plansRes.data ? plansRes.data : []
  const userPlan = userPlanRes.success ? userPlanRes.data || null : null

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 pb-24 md:pb-12">
      <div className="max-w-6xl mx-auto">
        <PricingClient initialPlans={plans} initialUserPlan={userPlan} />
      </div>
    </div>
  )
}
