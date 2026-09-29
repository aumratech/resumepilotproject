'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Search, Sparkles, LogOut, ShieldCheck, RefreshCw } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { getInitials } from '@/lib/utils'
import { logoutAdminAction } from '@/server/actions/admin-auth.actions'
import { useRouter } from 'next/navigation'

interface AdminHeaderProps {
  title?: string
  subtitle?: string
  admin?: { name: string; email: string; role: string }
}

export function AdminHeader({ title, subtitle, admin }: AdminHeaderProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    router.refresh()
    setTimeout(() => setRefreshing(false), 500)
  }

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-background/95 backdrop-blur-sm shrink-0 sticky top-0 z-40">
      {/* Mobile / Title */}
      <div>
        <h1 className="font-display font-bold text-base md:text-lg tracking-tight text-foreground flex items-center gap-2">
          {title || 'Admin Control Center'}
        </h1>
        {subtitle && <p className="text-xs text-muted-foreground hidden sm:block">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Refresh button */}
        <button
          type="button"
          onClick={handleRefresh}
          title="Refresh view"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
        </button>

        <ThemeToggle />

        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-foreground">Port 3001</span>
        </div>

        {/* Notifications */}
        <button
          id="admin-notifications-button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* Quick Logout Button */}
        <form action={logoutAdminAction}>
          <button
            type="submit"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </form>

        {/* Admin Avatar & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="admin-menu-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden ring-2 ring-border hover:ring-primary/40 transition-all focus:outline-none cursor-pointer"
            aria-label="Admin menu"
          >
            <div className="flex h-full w-full items-center justify-center brand-gradient text-white text-xs font-bold">
              {getInitials(admin?.name || 'Super Admin')}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-popover p-2 shadow-xl z-50 text-popover-foreground animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-sm font-semibold truncate">{admin?.name || 'Super Admin'}</p>
                <p className="text-xs text-muted-foreground truncate">{admin?.email || 'admin@resumeai.com'}</p>
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck size={10} />
                  <span>{admin?.role || 'SUPER_ADMIN'}</span>
                </div>
              </div>

              <form action={logoutAdminAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors mt-1 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
