import { db } from '@/lib/db'
import { DegreesClient } from './degrees-client'

export default async function DegreesManagementPage() {
  const degrees = await db.degree.findMany({
    orderBy: { name: 'asc' },
    include: {
      branches: {
        orderBy: { name: 'asc' },
      },
    },
  })

  return <DegreesClient initialDegrees={degrees} />
}
