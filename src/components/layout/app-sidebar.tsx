'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  User,
  MessageSquare,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookmarkCheck,
  Layers,
  LogOut,
  Crown,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { signOut } from 'next-auth/react'
import { usePlan } from '@/components/providers/plan-provider'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    label: 'AI Chat',
    href: '/chat',
    icon: MessageSquare,
    badge: 'AI',
  },
  {
    label: 'Resumes',
    href: '/resumes',
    icon: FileText,
  },
  {
    label: 'Templates',
    href: '/templates',
    icon: Layers,
  },
  {
    label: 'Saved JDs',
    href: '/saved-jds',
    icon: BookmarkCheck,
  },
  {
    label: 'Premium Plans',
    href: '/pricing',
    icon: Crown,
    badge: 'PRO',
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { plan, isPremium } = usePlan()

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden"
    >
      {/* Logo Area with Premium Branding */}
      <Link
        href="/dashboard"
        className="flex items-center gap-3 px-4 h-16 shrink-0 border-b border-sidebar-border group"
      >
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-brand-sm transition-transform group-hover:scale-105',
            isPremium
              ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-white shadow-amber-500/30'
              : 'brand-gradient'
          )}
        >
          {isPremium ? (
            <Crown size={17} className="text-white drop-shadow-sm animate-pulse" />
          ) : (
            <Sparkles size={16} className="text-white" />
          )}
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 overflow-hidden"
            >
              <span className="font-display font-bold text-base tracking-tight text-foreground whitespace-nowrap">
                ResumeAI
              </span>
              {isPremium && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-950 shadow-sm">
                  <Crown size={10} className="fill-slate-950" />
                  PRO
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'text-sidebar-foreground'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                size={18}
                className={cn(
                  'shrink-0 transition-colors',
                  isActive
                    ? 'text-primary'
                    : item.href === '/pricing'
                    ? 'text-amber-500 group-hover:text-amber-600'
                    : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground'
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.12 }}
                    className="flex-1 whitespace-nowrap truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.badge && (
                <span
                  className={cn(
                    'ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    item.badge === 'PRO'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-primary/10 text-primary'
                  )}
                >
                  {item.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 w-0.5 h-6 bg-primary rounded-r-full"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Plan Status Card (Expanded View) */}
      {!collapsed && (
        <div className="px-2 mb-2">
          {!isPremium ? (
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/20 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Crown size={12} />
                </div>
                <span className="text-xs font-bold text-foreground">Upgrade to Pro</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2.5 leading-snug">
                Unlock all 7 templates, unlimited resumes & deep ATS scoring.
              </p>
              <Link
                href="/pricing"
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary py-1.5 px-2 text-[11px] font-bold text-primary-foreground shadow-sm hover:opacity-95 transition-opacity"
              >
                <span>View Plans</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-500/30 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <Crown size={14} className="text-amber-500 fill-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-foreground truncate">
                    {plan?.planName || 'Executive AI'}
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/20">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">
                All premium privileges unlocked
              </p>
              <Link
                href="/pricing"
                className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Manage Subscription</span>
                <ArrowRight size={11} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Bottom section */}
      <div className="shrink-0 border-t border-sidebar-border px-2 py-3 space-y-1">
        <Link
          href="/settings"
          className={cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
            'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            pathname.startsWith('/settings') && 'bg-sidebar-accent text-sidebar-accent-foreground'
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            'w-full group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer',
            'text-destructive hover:bg-destructive/10'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="shrink-0 text-destructive" />
          {!collapsed && <span>Logout</span>}
        </button>

        {!collapsed && (
          <div className="flex items-center justify-between px-3 py-1 pt-1 border-t border-sidebar-border/50">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        )}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center cursor-pointer',
          'rounded-full bg-background border border-border shadow-sm',
          'text-muted-foreground hover:text-foreground transition-colors'
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}
