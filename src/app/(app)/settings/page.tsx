import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SettingsClient } from './_components/settings-client'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
      <SettingsClient user={session.user} />
    </div>
  )
}
