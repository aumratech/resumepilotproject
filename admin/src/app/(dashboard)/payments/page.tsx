import { db } from '@/lib/db'
import { PaymentsClient } from './payments-client'
import { PaymentStatus } from '@prisma/client'

export default async function PaymentsManagementPage() {
  const [
    transactions,
    totalCount,
    plans,
    allUsers,
    completedTxns,
  ] = await Promise.all([
    db.paymentTransaction.findMany({
      take: 25,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        planPackage: { select: { id: true, name: true, slug: true, priceMonthly: true } },
      },
    }),
    db.paymentTransaction.count(),
    db.planPackage.findMany({
      include: {
        subscriptions: { where: { status: 'active' } },
        payments: { where: { status: PaymentStatus.COMPLETED } },
      },
    }),
    db.user.findMany({
      select: { id: true, name: true, email: true },
      take: 100,
    }),
    db.paymentTransaction.findMany({
      where: { status: PaymentStatus.COMPLETED },
      select: { amount: true },
    }),
  ])

  const totalRevenue = completedTxns.reduce((acc, curr) => acc + curr.amount, 0)
  const mrr = plans.reduce((acc, p) => acc + p.subscriptions.length * p.priceMonthly, 0)

  // Plan-wise breakdown
  const planBreakdown = plans.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    priceMonthly: p.priceMonthly,
    activeSubscribers: p.subscriptions.length,
    totalRevenue: p.payments.reduce((sum, item) => sum + item.amount, 0),
    totalTransactions: p.payments.length,
  }))

  const stats = {
    totalRevenue,
    mrr,
    totalTransactions: totalCount,
    planBreakdown,
  }

  return (
    <PaymentsClient
      initialTransactions={transactions}
      totalCount={totalCount}
      stats={stats}
      plans={plans}
      usersList={allUsers}
    />
  )
}
