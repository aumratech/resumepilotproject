import { db } from '@/lib/db'
import { PlansClient } from './plans-client'

export default async function PlansManagementPage() {
  const plans = await db.planPackage.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { subscriptions: true, payments: true },
      },
    },
  })

  return <PlansClient initialPlans={plans} />
}
