'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Zap, Plus, X, Loader2 } from 'lucide-react'
import { upsertSkill, deleteSkill } from '@/server/actions/profile.actions'
import { cn } from '@/lib/utils'

const SKILL_CATEGORIES = [
  { value: 'PROGRAMMING_LANGUAGE', label: 'Languages', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { value: 'FRAMEWORK', label: 'Frameworks', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { value: 'LIBRARY', label: 'Libraries', color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { value: 'DATABASE', label: 'Databases', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { value: 'CLOUD', label: 'Cloud', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  { value: 'DEVOPS', label: 'DevOps', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
  { value: 'AI_ML', label: 'AI/ML', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
  { value: 'TOOL', label: 'Tools', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
  { value: 'SOFT_SKILL', label: 'Soft Skills', color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  { value: 'OTHER', label: 'Other', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400' },
]

interface SkillsSectionProps {
  data: Record<string, unknown>[]
}

export function SkillsSection({ data }: SkillsSectionProps) {
  const router = useRouter()
  const [skills, setSkills] = useState(data)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillCategory, setNewSkillCategory] = useState('OTHER')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setSkills(data)
  }, [data])

  const grouped = SKILL_CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = skills.filter((s) => (s.category as string) === cat.value)
    return acc
  }, {} as Record<string, Record<string, unknown>[]>)

  const handleAdd = () => {
    if (!newSkillName.trim()) return
    startTransition(async () => {
      try {
        const result = await upsertSkill({
          name: newSkillName.trim(),
          category: newSkillCategory,
        })
        setSkills((prev) => [...prev, result as unknown as Record<string, unknown>])
        setNewSkillName('')
        toast.success('Skill added!')
        router.refresh()
      } catch {
        toast.error('Failed to add skill')
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteSkill(id)
        setSkills((prev) => prev.filter((s) => (s.id as string) !== id))
        toast.success('Skill removed')
        router.refresh()
      } catch {
        toast.error('Failed to remove skill')
      }
    })
  }

  const getCategoryInfo = (value: string) =>
    SKILL_CATEGORIES.find((c) => c.value === value) ?? SKILL_CATEGORIES[SKILL_CATEGORIES.length - 1]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
          <Zap size={20} className="text-yellow-500" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground text-lg">Skills</h2>
          <p className="text-sm text-muted-foreground">
            Auto-extracted from your profile + manual additions
          </p>
        </div>
      </div>

      {/* Add skill */}
      <div className="flex gap-2 p-4 rounded-xl bg-muted/30 border border-border">
        <input
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder="Add a skill (e.g. React, Python)..."
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
        <select
          value={newSkillCategory}
          onChange={(e) => setNewSkillCategory(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        >
          {SKILL_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={isPending || !newSkillName.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add
        </button>
      </div>

      {/* Skills by category */}
      <div className="space-y-5">
        {SKILL_CATEGORIES.map((cat) => {
          const catSkills = grouped[cat.value] ?? []
          if (catSkills.length === 0) return null
          return (
            <div key={cat.value}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                {cat.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {catSkills.map((skill) => (
                  <div
                    key={skill.id as string}
                    className={cn(
                      'group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                      cat.color
                    )}
                  >
                    <span>{skill.name as string}</span>
                    <button
                      onClick={() => handleDelete(skill.id as string)}
                      disabled={isPending}
                      className="ml-0.5 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                      aria-label={`Remove ${skill.name}`}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {skills.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Zap size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No skills yet. Add your first skill above or complete your projects and experience to auto-extract skills.</p>
          </div>
        )}
      </div>
    </div>
  )
}
