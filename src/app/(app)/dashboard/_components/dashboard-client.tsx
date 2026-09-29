'use client'

import { motion } from 'framer-motion'
import {
  FileText,
  MessageSquare,
  User,
  Clock,
  Sparkles,
  Plus,
  ChevronRight,
  TrendingUp,
  Zap,
  BookOpen,
  Crown,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { cn, formatDate, getInitials } from '@/lib/utils'
import type { User as AuthUser } from 'next-auth'
import { EmailVerificationBanner } from '@/components/email-verification-banner'
import { usePlan } from '@/components/providers/plan-provider'

const stagger = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  },
}

interface DashboardClientProps {
  user: AuthUser
  profile: Record<string, unknown> | null
  recentResumes: Record<string, unknown>[]
  recentChats: Record<string, unknown>[]
  recentActivity: Record<string, unknown>[]
}

function ProfileCompletionRing({ score }: { score: number }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg width="88" height="88" className="-rotate-90">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted"
        />
        <motion.circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(238 84% 67%)" />
            <stop offset="100%" stopColor="hsl(262 83% 58%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="block text-2xl font-bold font-display"
        >
          {score}%
        </motion.span>
      </div>
    </div>
  )
}

const quickActions = [
  {
    label: 'New AI Chat',
    desc: 'Paste a JD & generate resume',
    icon: MessageSquare,
    href: '/chat',
    color: 'from-violet-500 to-purple-600',
  },
  {
    label: 'Edit Profile',
    desc: 'Update your information',
    icon: User,
    href: '/profile',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    label: 'View Resumes',
    desc: 'See all your versions',
    icon: FileText,
    href: '/resumes',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    label: 'Explore Templates',
    desc: 'Choose a resume style',
    icon: BookOpen,
    href: '/templates',
    color: 'from-orange-500 to-rose-600',
  },
]

const activityIcons: Record<string, typeof Clock> = {
  resume_generated: FileText,
  chat_created: MessageSquare,
  profile_updated: User,
  jd_saved: BookOpen,
}

export function DashboardClient({
  user,
  profile,
  recentResumes,
  recentChats,
  recentActivity,
}: DashboardClientProps) {
  const { plan, isPremium } = usePlan()

  const completionScore = (profile as Record<string, unknown> | null)
    ? (() => {
        const p = profile as Record<string, unknown>
        const sections = ['personalInfo', 'educations', 'experiences', 'projects', 'skills', 'certifications']
        const filled = sections.filter((s) => {
          const val = p[s]
          if (Array.isArray(val)) return val.length > 0
          return val !== null && val !== undefined
        })
        return Math.round((filled.length / sections.length) * 100)
      })()
    : 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 md:pb-8"
      >
      <EmailVerificationBanner email={user?.email} isVerified={!!(user as any)?.emailVerified} />
      
      {/* Welcome header */}
      <motion.div variants={stagger.item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{greeting} 👋</p>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="heading-display text-3xl md:text-4xl text-foreground">
              {user.name?.split(' ')[0] ?? 'Welcome'}
            </h1>
            {isPremium ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 px-3 py-1 text-xs font-black text-amber-600 dark:text-amber-400">
                <Crown size={13} className="fill-amber-500 text-amber-500" />
                <span>{plan?.planName || 'Executive AI'} Member</span>
              </span>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                <span>Free Plan</span>
                <span className="font-normal text-muted-foreground">• Upgrade</span>
              </Link>
            )}
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Here&apos;s what&apos;s happening with your career journey today.
          </p>
        </div>

        {/* Quick Plan Info Pill */}
        <Link
          href="/pricing"
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-4 transition-all ${
            isPremium
              ? 'bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
              : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/40'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              {isPremium ? <Crown size={14} className="text-amber-500 fill-amber-500" /> : <Sparkles size={14} className="text-primary" />}
              <span>{plan?.planName || 'Free Starter'}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {plan?.limits.maxResumes === -1
                ? 'Unlimited Resumes & Prompts'
                : `${plan?.usage.resumesCount || 0}/${plan?.limits.maxResumes || 1} resumes used`}
            </p>
          </div>
          <div className="flex items-center gap-1 font-bold text-primary text-xs">
            <span>{isPremium ? 'Manage' : 'Upgrade'}</span>
            <ArrowRight size={13} />
          </div>
        </Link>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={stagger.item}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Resumes Created', value: recentResumes.length, icon: FileText, color: 'text-primary' },
          { label: 'AI Chats', value: recentChats.length, icon: MessageSquare, color: 'text-violet-500' },
          { label: 'Profile Score', value: `${completionScore}%`, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Skills Added', value: '—', icon: Zap, color: 'text-amber-500' },
        ].map((stat) => (
          <div key={stat.label} className="premium-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <stat.icon size={14} className={stat.color} />
            </div>
            <p className="text-2xl font-bold font-display">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile completion */}
        <motion.div variants={stagger.item} className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-foreground">Profile Completion</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completionScore < 100
                  ? 'Complete your profile for better AI results'
                  : 'Your profile is complete! 🎉'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <ProfileCompletionRing score={completionScore} />
            <div className="flex-1 space-y-2">
              {[
                { label: 'Personal Info', done: !!(profile as Record<string, unknown> | null)?.personalInfo },
                { label: 'Education', done: ((profile as Record<string, unknown> | null)?.educations as unknown[])?.length > 0 },
                { label: 'Projects', done: ((profile as Record<string, unknown> | null)?.projects as unknown[])?.length > 0 },
                { label: 'Skills', done: ((profile as Record<string, unknown> | null)?.skills as unknown[])?.length > 0 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={cn(
                    'h-1.5 w-1.5 rounded-full shrink-0',
                    item.done ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                  )} />
                  <span className={cn(
                    'text-xs',
                    item.done ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/profile"
            className="mt-4 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {completionScore < 100 ? 'Complete Profile' : 'View Profile'}
            <ChevronRight size={12} />
          </Link>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={stagger.item} className="lg:col-span-2 space-y-3">
          <h2 className="font-semibold text-foreground px-1">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group premium-card p-4 flex items-start gap-3 hover:border-primary/30 transition-all"
              >
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
                  action.color
                )}>
                  <action.icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Resumes */}
      <motion.div variants={stagger.item} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Resumes</h2>
          <Link href="/resumes" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ChevronRight size={12} />
          </Link>
        </div>

        {recentResumes.length === 0 ? (
          <div className="premium-card p-12 flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No resumes yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start a new AI chat to generate your first tailored resume
              </p>
            </div>
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-brand-sm"
            >
              <Plus size={16} />
              New AI Chat
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentResumes.map((resume) => {
              const r = resume as Record<string, unknown>
              return (
                <Link
                  key={r.id as string}
                  href={`/resumes/${r.id}`}
                  className="group premium-card p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText size={20} />
                    </div>
                    <span className="text-[10px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                      v{r.version as number}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {(r.title as string) || 'Untitled Resume'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(r.updatedAt as string)}
                    </p>
                  </div>
                  {Boolean(r.atsScore) && (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${Number(r.atsScore)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{String(r.atsScore)}% ATS</span>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Activity Timeline */}
      {recentActivity.length > 0 && (
        <motion.div variants={stagger.item} className="space-y-4">
          <h2 className="font-semibold text-foreground">Recent Activity</h2>
          <div className="premium-card divide-y divide-border">
            {recentActivity.map((log) => {
              const l = log as Record<string, unknown>
              const IconComponent = activityIcons[l.type as string] ?? Clock
              return (
                <div key={l.id as string} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <IconComponent size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground capitalize">
                      {(l.type as string).replace(/_/g, ' ')}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDate(l.createdAt as string)}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
    </div>
  )
}
