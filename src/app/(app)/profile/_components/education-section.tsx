'use client'

import { useState, useTransition, useEffect } from 'react'
import { useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { GraduationCap, Plus, Trash2, Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatDateRange } from '@/lib/utils'
import { upsertEducation, deleteEducation } from '@/server/actions/profile.actions'

const schema = z.object({
  id: z.string().optional().nullable(),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().optional().nullable(),
  branch: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  cgpa: z.coerce.number().optional().nullable(),
  percentage: z.coerce.number().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  currentlyStudying: z.boolean().optional(),
  achievements: z.string().optional().nullable(),
  relevantCoursework: z.string().optional().nullable(),
  order: z.number().optional(),
})

type FormData = z.infer<typeof schema>

function EducationForm({
  defaultValues,
  onSave,
  onDelete,
  onCancel,
}: {
  defaultValues?: Record<string, any>
  onSave: (saved?: Record<string, unknown>) => void
  onDelete?: () => void
  onCancel?: () => void
}) {
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currentlyStudying: false, order: 0, ...(defaultValues as any) },
  })

  const isCurrent = watch('currentlyStudying')

  const router = useRouter()
  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      try {
        const saved = await upsertEducation(data)
        toast.success('Education saved!')
        router.refresh()
        onSave(saved as unknown as Record<string, unknown>)
      } catch {
        toast.error('Failed to save education')
      }
    })
  }

  const onInvalid = (errors: Record<string, any>) => {
    const firstKey = Object.keys(errors)[0]
    if (firstKey) {
      const err = errors[firstKey]
      toast.error(err?.message ? String(err.message) : `Please check ${firstKey}`)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4 p-5 bg-muted/30 rounded-xl border border-border">
      <input type="hidden" {...register('id')} />
      <input type="hidden" {...register('order')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Institution <span className="text-destructive">*</span>
          </label>
          <input
            placeholder="IIT Bombay, MIT, Stanford..."
            {...register('institution')}
            className={cn(
              'w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all',
              errors.institution ? 'border-destructive' : 'border-border'
            )}
          />
          {errors.institution && <p className="mt-1 text-xs text-destructive">{errors.institution.message}</p>}
        </div>

        {[
          { key: 'degree' as const, label: 'Degree', placeholder: 'B.Tech, M.S., MBA...' },
          { key: 'branch' as const, label: 'Branch / Major', placeholder: 'Computer Science' },
          { key: 'specialization' as const, label: 'Specialization', placeholder: 'AI & Machine Learning' },
        ].map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
            <input
              placeholder={f.placeholder}
              {...register(f.key)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">CGPA (0-10)</label>
          <input
            type="number"
            step="0.01"
            placeholder="9.2"
            {...register('cgpa')}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Start Date</label>
          <input
            type="month"
            {...register('startDate')}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">End Date</label>
          <input
            type="month"
            {...register('endDate')}
            disabled={isCurrent}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all disabled:opacity-50"
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="currentlyStudying"
            {...register('currentlyStudying')}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <label htmlFor="currentlyStudying" className="text-sm text-foreground cursor-pointer">
            Currently studying here
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Achievements / Activities</label>
          <textarea
            rows={3}
            placeholder="Dean's List, Student Body President, Academic Excellence Award..."
            {...register('achievements')}
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={13} />
              Delete
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-brand-sm hover:bg-primary/90 transition-all disabled:opacity-60"
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}

import { useRouter } from 'next/navigation'

interface EducationSectionProps {
  data: Record<string, unknown>[]
}

export function EducationSection({ data }: EducationSectionProps) {
  const router = useRouter()
  const [items, setItems] = useState(data)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(items.length === 0)
  const [, startTransition] = useTransition()

  useEffect(() => {
    setItems(data)
  }, [data])

  const handleSave = (saved?: Record<string, unknown>) => {
    setExpandedId(null)
    setShowNew(false)
    if (saved && saved.id) {
      setItems((prev) => {
        const idx = prev.findIndex((i) => (i.id as string) === (saved.id as string))
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = saved
          return next
        }
        return [...prev, saved]
      })
    }
    router.refresh()
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteEducation(id)
        setItems((prev) => prev.filter((e) => (e.id as string) !== id))
        toast.success('Education deleted')
        router.refresh()
      } catch {
        toast.error('Failed to delete')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
          <GraduationCap size={20} className="text-purple-500" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground text-lg">Education</h2>
          <p className="text-sm text-muted-foreground">Add your academic background</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((edu) => (
          <div key={edu.id as string} className="premium-card overflow-hidden">
            <button
              onClick={() =>
                setExpandedId(expandedId === (edu.id as string) ? null : (edu.id as string))
              }
              className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/30 transition-colors"
            >
              <div>
                <p className="font-medium text-foreground">{edu.institution as string}</p>
                <p className="text-sm text-muted-foreground">
                  {[edu.degree as string, edu.branch as string].filter(Boolean).join(' • ')}
                  {Boolean(edu.cgpa) && ` • CGPA: ${String(edu.cgpa)}`}
                </p>
              </div>
              {expandedId === (edu.id as string) ? (
                <ChevronUp size={16} className="text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-muted-foreground shrink-0" />
              )}
            </button>
            <AnimatePresence>
              {expandedId === (edu.id as string) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <EducationForm
                      defaultValues={{
                        ...edu,
                        startDate: edu.startDate
                          ? new Date(edu.startDate as string).toISOString().slice(0, 7)
                          : undefined,
                        endDate: edu.endDate
                          ? new Date(edu.endDate as string).toISOString().slice(0, 7)
                          : undefined,
                      } as Partial<FormData>}
                      onSave={handleSave}
                      onDelete={() => handleDelete(edu.id as string)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {showNew && (
          <EducationForm
            onSave={handleSave}
            onCancel={items.length > 0 ? () => setShowNew(false) : undefined}
          />
        )}
      </div>

      {!showNew && (
        <button
          onClick={() => setShowNew(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
        >
          <Plus size={18} />
          Add Education
        </button>
      )}
    </div>
  )
}
