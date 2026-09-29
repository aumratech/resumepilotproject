'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Search, Sparkles, LogOut, User as UserIcon, Settings, Crown, Zap } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { getInitials } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import type { User } from 'next-auth'
import { signOut } from 'next-auth/react'
import { usePlan } from '@/components/providers/plan-provider'

interface AppHeaderProps {
  user: User
}

export function AppHeader({ user }: AppHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { plan, isPremium } = usePlan()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-background/95 backdrop-blur-sm shrink-0 sticky top-0 z-40">
      {/* Mobile logo with Premium icon */}
      <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            isPremium
              ? 'bg-gradient-to-tr from-amber-500 to-amber-600 shadow-amber-500/20 shadow-sm'
              : 'brand-gradient'
          }`}
        >
          {isPremium ? (
            <Crown size={16} className="text-white fill-white" />
          ) : (
            <Sparkles size={16} className="text-white" />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-display font-bold text-base tracking-tight">ResumeAI</span>
          {isPremium && (
            <span className="inline-flex items-center gap-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-500 px-1.5 py-0.5 text-[9px] font-black uppercase text-slate-950">
              <Crown size={9} className="fill-slate-950" />
              PRO
            </span>
          )}
        </div>
      </Link>

      {/* Search trigger (desktop) */}
      <button
        id="command-palette-trigger"
        className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground w-64 hover:border-border/80 hover:bg-muted transition-colors"
      >
        <Search size={14} />
        <span>Search anything...</span>
        <kbd className="ml-auto pointer-events-none flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </button>

      <div className="flex items-center gap-2.5">
        {/* Premium Upgrade / Status Pill */}
        {!isPremium ? (
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-brand-sm hover:opacity-95 transition-all"
          >
            <Crown size={13} className="fill-white" />
            <span className="hidden sm:inline">Upgrade to Pro</span>
            <span className="sm:hidden">Upgrade</span>
          </Link>
        ) : (
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all shadow-sm"
            title="Premium Subscription Active"
          >
            <Crown size={13} className="text-amber-500 fill-amber-500 animate-pulse" />
            <span className="hidden sm:inline font-extrabold">{plan?.planName || 'PRO'}</span>
            <span className="text-[10px] uppercase tracking-wider bg-amber-500/20 px-1.5 py-0.2 rounded font-black">
              MEMBER
            </span>
          </Link>
        )}

        <ThemeToggle />

        {/* Notifications */}
        <button
          id="notifications-button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* Direct Quick Logout Button */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="hidden lg:flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>

        {/* User avatar & dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="user-menu-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden ring-2 ring-border hover:ring-primary/40 transition-all focus:outline-none cursor-pointer"
            aria-label="User menu"
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? 'User'}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center brand-gradient text-white text-xs font-bold">
                {getInitials(user.name)}
              </div>
            )}

            {/* Premium Gold Crown on avatar */}
            {isPremium && (
              <span
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-sm"
                title="Premium Member"
              >
                <Crown size={9} className="fill-slate-950" />
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl border border-border bg-popover p-2 shadow-xl z-50 text-popover-foreground animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-sm font-semibold truncate">{user.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email || ''}</p>

                {/* Plan Badge in Menu */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Current Plan</span>
                  {isPremium ? (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400">
                      <Crown size={10} className="fill-amber-500" />
                      {plan?.planName}
                    </span>
                  ) : (
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                      Free Starter
                    </span>
                  )}
                </div>
              </div>

              <Link
                href="/pricing"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                <Crown size={14} />
                <span>{isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}</span>
              </Link>

              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <UserIcon size={14} />
                <span>My Profile</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Settings size={14} />
                <span>Settings</span>
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors mt-1 border-t border-border pt-2 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
