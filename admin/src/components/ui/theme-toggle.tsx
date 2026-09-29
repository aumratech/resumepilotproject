'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className={cn('h-9 w-9 rounded-lg bg-muted animate-pulse', className)} />
    )
  }

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  const current = themes.find((t) => t.value === theme) ?? themes[2]
  const Icon = current.icon

  const cycle = () => {
    const idx = themes.findIndex((t) => t.value === theme)
    const next = themes[(idx + 1) % themes.length]
    setTheme(next.value)
  }

  return (
    <button
      onClick={cycle}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground',
        'transition-colors hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      aria-label={`Switch to ${themes[(themes.findIndex((t) => t.value === theme) + 1) % themes.length].label} mode`}
      title={`Current: ${current.label}`}
    >
      <Icon size={18} />
    </button>
  )
}
