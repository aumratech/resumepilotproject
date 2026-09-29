import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/admin-auth'
import { DashboardClient } from './dashboard-client'
import { PaymentStatus } from '@prisma/client'

export default async function DashboardPage() {
  const session = await getAdminSession()

  // Fetch all real dashboard metrics in parallel
  const [
    userCount,
    resumeCount,
    chatCount,
    paymentCount,
    completedPayments,
    plans,
    recentUsers,
    recentResumes,
    recentPayments,
    collegesCount,
    degreesCount,
  ] = await Promise.all([
    db.user.count(),
    db.resumeVersion.count(),
    db.chat.count(),
    db.paymentTransaction.count(),
    db.paymentTransaction.findMany({
      where: { status: PaymentStatus.COMPLETED },
      select: { amount: true, createdAt: true, planPackageId: true },
    }),
    db.planPackage.findMany({
      include: {
        _count: {
          select: { subscriptions: true, payments: true },
        },
      },
    }),
    db.user.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptions: {
          where: { status: 'active' },
          include: { planPackage: true },
          take: 1,
        },
        _count: { select: { resumes: true } },
      },
    }),
    db.resumeVersion.findMany({
      take: 6,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    db.paymentTransaction.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        planPackage: { select: { name: true, slug: true } },
      },
    }),
    db.college.count(),
    db.degree.count(),
  ])

  const totalRevenue = completedPayments.reduce((acc, curr) => acc + curr.amount, 0)
  const activeSubs = plans.reduce((acc, p) => acc + p._count.subscriptions, 0)
  const mrr = plans.reduce((acc, p) => acc + p._count.subscriptions * p.priceMonthly, 0)

  // Plan distribution for charts
  const planDistribution = plans.map((p) => ({
    name: p.name,
    slug: p.slug,
    count: p._count.subscriptions,
    revenue: p._count.payments * p.priceMonthly,
    priceMonthly: p.priceMonthly,
  }))

  const metrics = {
    totalRevenue,
    mrr,
    userCount,
    resumeCount,
    chatCount,
    activeSubs,
    paymentCount,
    collegesCount,
    degreesCount,
    planDistribution,
    recentUsers,
    recentResumes,
    recentPayments,
  }

  return <DashboardClient metrics={metrics} />
}
