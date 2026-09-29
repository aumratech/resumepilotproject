import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { getUserPlanAction } from '@/server/actions/subscription.actions'
import { TemplatesClient } from './_components/templates-client'

export const metadata: Metadata = {
  title: 'Resume Templates Gallery',
  description: 'Choose from professionally crafted, ATS-friendly resume templates. Executive and creative templates unlock with Premium.',
}

export default async function TemplatesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [locksRes, planRes] = await Promise.all([
    supabaseAdmin
      .from('resume_template_locks')
      .select('*, plan_packages(name, slug)'),
    getUserPlanAction(),
  ])

  const userPlan = planRes.success ? planRes.data || null : null

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 pb-24 md:pb-12">
      <div className="max-w-6xl mx-auto">
        <TemplatesClient
          initialLocks={locksRes.data ?? []}
          userPlan={userPlan}
        />
      </div>
    </div>
  )
}
