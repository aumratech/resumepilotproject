'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Globe,
  Layers,
  FileText,
  CreditCard,
  GraduationCap,
  BookOpen,
  Users,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { logoutAdminAction } from '@/server/actions/admin-auth.actions'

const navItems = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Landing Page CMS',
    href: '/landing-page',
    icon: Globe,
    badge: 'Live',
  },
  {
    label: 'Plan Packages',
    href: '/plans',
    icon: Layers,
  },
  {
    label: 'Resumes & Locks',
    href: '/resumes',
    icon: FileText,
  },
  {
    label: 'Payments & Revenue',
    href: '/payments',
    icon: CreditCard,
  },
  {
    label: 'Colleges Directory',
    href: '/colleges',
    icon: GraduationCap,
  },
  {
    label: 'Degrees & Branches',
    href: '/degrees',
    icon: BookOpen,
  },
  {
    label: 'User Management',
    href: '/users',
    icon: Users,
  },
  {
    label: 'Audit Logs',
    href: '/audit-logs',
    icon: ShieldAlert,
  },
]

export function AdminSidebar({
  admin,
}: {
  admin?: { name: string; email: string; role: string }
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden select-none"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0 border-b border-sidebar-border">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg brand-gradient shadow-brand-sm">
          <Sparkles size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="font-display font-bold text-base tracking-tight text-foreground">
                ResumeAI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Admin
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
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
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="admin-sidebar-indicator"
                  className="absolute left-0 w-0.5 h-6 bg-primary rounded-r-full"
                />
              )}
            </Link>
          )
        })}

        {/* Live Client App Link */}
        <div className="pt-2 border-t border-sidebar-border/50">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
            )}
            title={collapsed ? 'Main App (localhost:3000)' : undefined}
          >
            <ExternalLink size={16} className="shrink-0 text-emerald-500" />
            {!collapsed && (
              <span className="flex-1 whitespace-nowrap truncate text-emerald-500 font-semibold">
                Client App (3000)
              </span>
            )}
          </a>
        </div>
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-sidebar-border px-2 py-3 space-y-1">
        {!collapsed && admin && (
          <div className="px-3 py-2 rounded-lg bg-sidebar-accent/50 mb-2">
            <p className="text-xs font-semibold truncate text-foreground">{admin.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{admin.role}</p>
          </div>
        )}

        <form action={logoutAdminAction}>
          <button
            type="submit"
            className={cn(
              'w-full group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer',
              'text-destructive hover:bg-destructive/10'
            )}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} className="shrink-0 text-destructive" />
            {!collapsed && <span>Logout</span>}
          </button>
        </form>

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
          'absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center',
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
