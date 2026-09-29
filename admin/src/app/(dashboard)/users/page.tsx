import { db } from '@/lib/db'
import { UsersClient } from './users-client'

export default async function UsersManagementPage() {
  const [users, totalCount, plans] = await Promise.all([
    db.user.findMany({
      take: 25,
      orderBy: { createdAt: 'desc' },
      include: {
        profile: {
          select: { completionScore: true, isPublic: true },
        },
        subscriptions: {
          where: { status: 'active' },
          include: { planPackage: true },
          take: 1,
        },
        _count: {
          select: { resumes: true, chats: true, payments: true },
        },
      },
    }),
    db.user.count(),
    db.planPackage.findMany({
      select: { id: true, name: true, slug: true, priceMonthly: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  return <UsersClient initialUsers={users} totalUsers={totalCount} availablePlans={plans} />
}
