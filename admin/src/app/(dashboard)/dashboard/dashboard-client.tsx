'use client'

import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  CreditCard,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Globe,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export function DashboardClient({ metrics }: { metrics: any }) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="relative rounded-2xl brand-gradient p-6 md:p-8 overflow-hidden shadow-brand-md text-white">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              ResumeAI Production Control Center
            </div>
            <h1 className="heading-display text-2xl md:text-3xl text-white font-bold tracking-tight">
              Welcome to the Administration Console
            </h1>
            <p className="text-sm text-white/85 mt-1 max-w-2xl leading-relaxed">
              Manage dynamic landing page sections, configure plan packages with custom feature flags, track live payments, curate colleges & degrees, and oversee users.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/landing-page"
              className="px-4 py-2.5 rounded-xl bg-white text-primary font-semibold text-xs md:text-sm flex items-center gap-2 shadow-md hover:bg-white/95 transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              Edit Landing Page
            </Link>
            <Link
              href="/plans"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm"
            >
              <Layers className="w-4 h-4" />
              Manage Plans
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="premium-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-foreground tracking-tight">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>MRR: {formatCurrency(metrics.mrr)}</span>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="premium-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Registered Users
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-foreground tracking-tight">
              {metrics.userCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-primary font-medium">
              <span>{metrics.activeSubs} active paid subscribers</span>
            </div>
          </div>
        </div>

        {/* Resumes Generated */}
        <div className="premium-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Resumes Created
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-foreground tracking-tight">
              {metrics.resumeCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
              <span>{metrics.chatCount} AI Assistant Chats</span>
            </div>
          </div>
        </div>

        {/* Academic Entities */}
        <div className="premium-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Colleges & Degrees
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-foreground tracking-tight">
              {metrics.collegesCount} Colleges
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <span>{metrics.degreesCount} Degree Programs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Distribution & Live Revenue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plans Breakdown */}
        <div className="lg:col-span-2 premium-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Plan Packages Distribution</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Active subscribers and price points per tier</p>
            </div>
            <Link
              href="/plans"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Configure Plans <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {metrics.planDistribution.map((plan: any) => {
              const maxSubs = Math.max(...metrics.planDistribution.map((p: any) => p.count), 1)

              return (
                <div
                  key={plan.slug}
                  className="p-4 rounded-xl bg-muted/40 border border-border hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-sm text-foreground">{plan.name}</span>
                      <Badge variant="secondary" className="font-mono">
                        ${plan.priceMonthly}/mo
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-primary">{plan.count}</span>
                      <span className="text-xs text-muted-foreground ml-1">subscribers</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full brand-gradient rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(8, (plan.count / maxSubs) * 100))}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Operations Actions */}
        <div className="premium-card p-6 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Quick Operations
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Direct administrative shortcuts</p>

            <div className="mt-4 space-y-2">
              <Link
                href="/landing-page"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-background hover:bg-accent border border-border text-foreground text-xs font-medium transition-all"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" /> Edit Hero, FAQs & CMS
                </span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                href="/plans"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-background hover:bg-accent border border-border text-foreground text-xs font-medium transition-all"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-500" /> Create / Edit Plan Package
                </span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                href="/resumes"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-background hover:bg-accent border border-border text-foreground text-xs font-medium transition-all"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" /> Resume Lock Policies
                </span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                href="/payments"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-background hover:bg-accent border border-border text-foreground text-xs font-medium transition-all"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" /> View Payment Ledger
                </span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                href="/users"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-background hover:bg-accent border border-border text-foreground text-xs font-medium transition-all"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-500" /> User Subscription Overrides
                </span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>All system changes sync live with the main user app on port 3000.</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <div className="premium-card p-6">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Recently Joined Users
            </h2>
            <Link
              href="/users"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {metrics.recentUsers.map((user: any) => {
              const activePlan = user.subscriptions?.[0]?.planPackage
              return (
                <div key={user.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-brand-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.name || 'Anonymous User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={activePlan ? 'default' : 'secondary'}>
                      {activePlan?.name || 'Free Tier'}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Payments Ledger */}
        <div className="premium-card p-6">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" /> Recent Payment Transactions
            </h2>
            <Link
              href="/payments"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Full Ledger <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {metrics.recentPayments.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No recent payment transactions recorded
              </div>
            ) : (
              metrics.recentPayments.map((txn: any) => (
                <div key={txn.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {txn.user?.name || txn.customerName || 'Customer'}
                      </span>
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {txn.planPackage?.name || 'Pro Plan'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{txn.transactionId}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +${txn.amount.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(txn.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
