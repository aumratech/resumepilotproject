import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { AppHeader } from '@/components/layout/app-header'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { UnverifiedAccountView } from '@/components/auth/unverified-account-view'
import { getUserPlanAction } from '@/server/actions/subscription.actions'
import { PlanProvider } from '@/components/providers/plan-provider'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [userRes, planRes] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('email, emailVerified')
      .eq('id', session.user.id)
      .single(),
    getUserPlanAction(),
  ])

  const dbUser = userRes.data

  // Block all navigation options until email is verified
  if (!dbUser?.emailVerified) {
    return <UnverifiedAccountView email={dbUser?.email || session.user.email || ''} />
  }

  const userPlan = planRes.success ? planRes.data || null : null

  return (
    <PlanProvider initialPlan={userPlan}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <AppSidebar />
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          <AppHeader user={session.user!} />
          <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav />
      </div>
    </PlanProvider>
  )
}
