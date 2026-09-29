'use client'

import { useState, useTransition, useEffect } from 'react'
import { useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Briefcase, Plus, Trash2, Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { upsertExperience, deleteExperience } from '@/server/actions/profile.actions'

const schema = z.object({
  id: z.string().optional().nullable(),
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP']).optional(),
  location: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().optional(),
  responsibilities: z.string().optional().nullable(),
  achievements: z.string().optional().nullable(),
  technologies: z.array(z.string()).optional(),
  teamSize: z.coerce.number().optional().nullable(),
  hadPromotion: z.boolean().optional(),
  impact: z.string().optional().nullable(),
  managerName: z.string().optional().nullable(),
  order: z.number().optional(),
})

type FormData = z.infer<typeof schema>

const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'INTERNSHIP', label: 'Internship' },
]

function ExperienceForm({
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
  const [techInput, setTechInput] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { employmentType: 'FULL_TIME', isCurrent: false, hadPromotion: false, technologies: [], order: 0, ...(defaultValues as any) },
  })

  const isCurrent = watch('isCurrent')
  const techList = watch('technologies') ?? []

  const addTech = () => {
    const tech = techInput.trim()
    if (tech && !techList.includes(tech)) {
      setValue('technologies', [...techList, tech])
      setTechInput('')
    }
  }

  const removeTech = (tech: string) => {
    setValue('technologies', techList.filter((t) => t !== tech))
  }

  const router = useRouter()
  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      try {
        const saved = await upsertExperience(data)
        toast.success('Experience saved!')
        router.refresh()
        onSave(saved as unknown as Record<string, unknown>)
      } catch {
        toast.error('Failed to save experience')
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
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Company <span className="text-destructive">*</span></label>
          <input placeholder="Google, Microsoft, Startup..." {...register('company')} className={cn('w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all', errors.company ? 'border-destructive' : 'border-border')} />
          {errors.company && <p className="mt-1 text-xs text-destructive">{errors.company.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Role <span className="text-destructive">*</span></label>
          <input placeholder="Senior Software Engineer..." {...register('role')} className={cn('w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all', errors.role ? 'border-destructive' : 'border-border')} />
          {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Employment Type</label>
          <select {...register('employmentType')} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all">
            {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Location</label>
          <input placeholder="Bangalore, Remote..." {...register('location')} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Start Date</label>
          <input type="month" {...register('startDate')} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">End Date</label>
          <input type="month" {...register('endDate')} disabled={isCurrent} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all disabled:opacity-50" />
        </div>

        <div className="sm:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="isCurrent" {...register('isCurrent')} className="h-4 w-4 rounded border-border accent-primary" />
          <label htmlFor="isCurrent" className="text-sm text-foreground cursor-pointer">Currently working here</label>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Responsibilities</label>
          <textarea rows={4} placeholder="Developed scalable microservices, Led team of 5 engineers..." {...register('responsibilities')} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Achievements & Impact</label>
          <textarea rows={3} placeholder="Reduced API latency by 40%, Increased revenue by $2M..." {...register('achievements')} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
        </div>

        {/* Tech stack */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Technologies Used</label>
          <div className="flex gap-2 mb-2">
            <input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
              placeholder="Type a technology and press Enter..."
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <button type="button" onClick={addTech} className="rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Add
            </button>
          </div>
          {techList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {techList.map((tech: string) => (
                <span key={tech} className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {tech}
                  <button type="button" onClick={() => removeTech(tech)} className="hover:text-destructive transition-colors">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          {onDelete && (
            <button type="button" onClick={onDelete} className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 size={13} /> Delete
            </button>
          )}
          {onCancel && (
            <button type="button" onClick={onCancel} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
          )}
        </div>
        <button type="submit" disabled={isPending} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-brand-sm hover:bg-primary/90 transition-all disabled:opacity-60">
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}

interface ExperienceSectionProps {
  data: Record<string, unknown>[]
}

export function ExperienceSection({ data }: ExperienceSectionProps) {
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
        await deleteExperience(id)
        setItems((prev) => prev.filter((e) => (e.id as string) !== id))
        toast.success('Experience deleted')
        router.refresh()
      } catch {
        toast.error('Failed to delete')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
          <Briefcase size={20} className="text-green-500" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground text-lg">Work Experience</h2>
          <p className="text-sm text-muted-foreground">Add your professional work history</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((exp) => (
          <div key={exp.id as string} className="premium-card overflow-hidden">
            <button onClick={() => setExpandedId(expandedId === (exp.id as string) ? null : (exp.id as string))} className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/30 transition-colors">
              <div>
                <p className="font-medium text-foreground">{exp.role as string} <span className="text-muted-foreground font-normal">@ {exp.company as string}</span></p>
                <p className="text-sm text-muted-foreground capitalize">{(exp.employmentType as string).toLowerCase().replace('_', ' ')}</p>
              </div>
              {expandedId === (exp.id as string) ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
            </button>
            <AnimatePresence>
              {expandedId === (exp.id as string) && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4">
                    <ExperienceForm
                      defaultValues={{
                        ...exp,
                        startDate: exp.startDate ? new Date(exp.startDate as string).toISOString().slice(0, 7) : undefined,
                        endDate: exp.endDate ? new Date(exp.endDate as string).toISOString().slice(0, 7) : undefined,
                      } as Partial<FormData>}
                      onSave={handleSave}
                      onDelete={() => handleDelete(exp.id as string)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {showNew && (
          <ExperienceForm
            onSave={handleSave}
            onCancel={items.length > 0 ? () => setShowNew(false) : undefined}
          />
        )}
      </div>

      {!showNew && (
        <button onClick={() => setShowNew(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-all">
          <Plus size={18} /> Add Experience
        </button>
      )}
    </div>
  )
}
