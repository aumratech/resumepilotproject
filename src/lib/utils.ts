import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  if (typeof date === 'string') {
    const trimmed = date.trim()
    if (!trimmed) return ''
    if (/^\d{4}-\d{2}$/.test(trimmed)) {
      const [year, month] = trimmed.split('-')
      const mIdx = parseInt(month, 10) - 1
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      if (mIdx >= 0 && mIdx < 12) {
        return `${months[mIdx]} ${year}`
      }
    }
  }
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return String(date)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function formatDateRange(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
  isCurrent?: boolean
): string {
  const startStr = start ? formatDate(start) : ''
  const endStr = isCurrent ? 'Present' : end ? formatDate(end) : ''
  if (!startStr && !endStr) return ''
  if (startStr && endStr) return `${startStr} – ${endStr}`
  return startStr || endStr
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trim() + '…'
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function calculateCompletionScore(profile: Record<string, unknown>): number {
  const sections = [
    'personalInfo',
    'educations',
    'experiences',
    'projects',
    'skills',
    'certifications',
  ]
  const filled = sections.filter((s) => {
    const val = profile[s]
    if (Array.isArray(val)) return val.length > 0
    return val !== null && val !== undefined
  })
  return Math.round((filled.length / sections.length) * 100)
}
