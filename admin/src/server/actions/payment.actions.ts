'use server'

import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/admin-auth'
import { logAdminAction } from './audit.actions'
import { PaymentStatus, PaymentGateway } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getPaymentAnalyticsAction() {
  try {
    await requireAdminSession()

    const [
      totalTransactions,
      completedTransactions,
      plansWithRevenue,
      recentTransactions,
    ] = await Promise.all([
      db.paymentTransaction.count(),
      db.paymentTransaction.findMany({
        where: { status: PaymentStatus.COMPLETED },
        select: { amount: true, currency: true, createdAt: true, planPackageId: true },
      }),
      db.planPackage.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          priceMonthly: true,
          payments: {
            where: { status: PaymentStatus.COMPLETED },
            select: { amount: true },
          },
          subscriptions: {
            where: { status: 'active' },
            select: { id: true },
          },
        },
      }),
      db.paymentTransaction.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          planPackage: { select: { id: true, name: true, slug: true } },
        },
      }),
    ])

    const totalRevenue = completedTransactions.reduce((acc, curr) => acc + curr.amount, 0)
    
    // Estimate MRR based on active monthly subscriptions
    const activeSubsCount = await db.userSubscription.count({ where: { status: 'active' } })
    const mrr = plansWithRevenue.reduce((acc, plan) => {
      return acc + plan.subscriptions.length * plan.priceMonthly
    }, 0)

    // Plan-wise breakdown
    const planWiseRevenue = plansWithRevenue.map((p) => {
      const planRev = p.payments.reduce((sum, item) => sum + item.amount, 0)
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        subscribers: p.subscriptions.length,
        totalRevenue: planRev,
      }
    })

    return {
      success: true,
      data: {
        totalRevenue,
        mrr,
        totalTransactions,
        activeSubscribers: activeSubsCount,
        planWiseRevenue,
        recentTransactions,
      },
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch payment analytics' }
  }
}

export async function getPaymentsAction(params?: {
  planId?: string
  userId?: string
  status?: PaymentStatus
  query?: string
  page?: number
  limit?: number
}) {
  try {
    await requireAdminSession()

    const page = params?.page || 1
    const limit = params?.limit || 20
    const skip = (page - 1) * limit

    const where: any = {}

    if (params?.planId && params.planId !== 'all') {
      where.planPackageId = params.planId
    }

    if (params?.userId) {
      where.userId = params.userId
    }

    if (params?.status) {
      where.status = params.status
    }

    if (params?.query) {
      where.OR = [
        { transactionId: { contains: params.query, mode: 'insensitive' } },
        { customerEmail: { contains: params.query, mode: 'insensitive' } },
        { customerName: { contains: params.query, mode: 'insensitive' } },
        { user: { email: { contains: params.query, mode: 'insensitive' } } },
        { user: { name: { contains: params.query, mode: 'insensitive' } } },
      ]
    }

    const [total, transactions] = await Promise.all([
      db.paymentTransaction.count({ where }),
      db.paymentTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
          planPackage: {
            select: { id: true, name: true, slug: true, priceMonthly: true },
          },
        },
      }),
    ])

    return {
      success: true,
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch payments' }
  }
}

export async function createManualTransactionAction(data: {
  userId: string
  planPackageId: string
  amount: number
  currency?: string
  billingCycle?: string
  status?: PaymentStatus
  notes?: string
}) {
  try {
    const admin = await requireAdminSession()

    const user = await db.user.findUnique({
      where: { id: data.userId },
      select: { id: true, name: true, email: true },
    })

    if (!user) return { success: false, error: 'User not found' }

    const transaction = await db.paymentTransaction.create({
      data: {
        transactionId: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: user.id,
        planPackageId: data.planPackageId,
        amount: Number(data.amount),
        currency: data.currency || 'USD',
        status: data.status || PaymentStatus.COMPLETED,
        gateway: PaymentGateway.MANUAL,
        billingCycle: data.billingCycle || 'monthly',
        customerEmail: user.email,
        customerName: user.name || 'Customer',
        metadata: {
          createdByAdminId: admin.id,
          createdByAdminEmail: admin.email,
          notes: data.notes || 'Manually recorded transaction by admin',
        },
      },
    })

    // If completed, update or create user subscription
    if (data.status === PaymentStatus.COMPLETED) {
      await db.userSubscription.upsert({
        where: { userId: user.id },
        update: {
          planPackageId: data.planPackageId,
          status: 'active',
          billingCycle: data.billingCycle || 'monthly',
        },
        create: {
          userId: user.id,
          planPackageId: data.planPackageId,
          status: 'active',
          billingCycle: data.billingCycle || 'monthly',
        },
      })
    }

    await logAdminAction({
      action: 'MANUAL_PAYMENT_TRANSACTION',
      entity: 'PaymentTransaction',
      entityId: transaction.id,
      details: { amount: data.amount, userId: user.id, planPackageId: data.planPackageId },
    })

    revalidatePath('/payments')
    return { success: true, data: transaction }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create transaction' }
  }
}

export async function updatePaymentStatusAction(id: string, status: PaymentStatus) {
  try {
    await requireAdminSession()

    const updated = await db.paymentTransaction.update({
      where: { id },
      data: { status },
    })

    await logAdminAction({
      action: 'UPDATE_PAYMENT_STATUS',
      entity: 'PaymentTransaction',
      entityId: id,
      details: { status },
    })

    revalidatePath('/payments')
    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update payment status' }
  }
}
