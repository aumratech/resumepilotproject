'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  MessageSquare,
  FileText,
  Settings,
  Crown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileNavItems = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Chat', href: '/chat', icon: MessageSquare },
  { label: 'Resumes', href: '/resumes', icon: FileText },
  { label: 'Premium', href: '/pricing', icon: Crown },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-background/95 backdrop-blur-xl border-t border-border px-2 pb-safe pt-2 md:hidden">
      {mobileNavItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 min-w-[56px] py-1 px-2 rounded-xl transition-colors"
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary shadow-brand-sm scale-110'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon size={22} />
            </div>
            <span
              className={cn(
                'text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
