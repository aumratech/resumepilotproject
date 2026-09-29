'use client'

import { useState, useTransition, useEffect } from 'react'
import { useForm, type FieldErrors } from 'react-hook-form'
import { toast } from 'sonner'
import { Code2, Plus, Trash2, Save, Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { upsertProject, deleteProject, aiExtractFromText } from '@/server/actions/profile.actions'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'

const PROJECT_TYPES = [
  'PERSONAL', 'COLLEGE', 'COMPANY', 'INTERNSHIP', 'RESEARCH',
  'OPEN_SOURCE', 'FREELANCE', 'HACKATHON', 'CLIENT',
]

const ROLE_TAGS = [
  'Software Engineer', 'Frontend', 'Backend', 'Full Stack', 'AI Engineer',
  'ML Engineer', 'Data Analyst', 'Data Scientist', 'DevOps', 'Cloud Engineer',
  'Cybersecurity', 'Product Manager', 'UI/UX', 'Business Analyst', 'QA',
  'Android', 'iOS', 'Game Developer', 'Blockchain',
]

function formatMonthVal(dateVal: any) {
  if (!dateVal) return ''
  try {
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return String(dateVal).slice(0, 7)
    return d.toISOString().slice(0, 7)
  } catch {
    return String(dateVal)
  }
}

const schema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional().nullable(),
  techStack: z.array(z.string()).optional(),
  githubUrl: z.string().optional().nullable().or(z.literal('')),
  liveUrl: z.string().optional().nullable().or(z.literal('')),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  projectType: z.enum(['PERSONAL', 'COLLEGE', 'COMPANY', 'INTERNSHIP', 'RESEARCH', 'OPEN_SOURCE', 'FREELANCE', 'HACKATHON', 'CLIENT']).optional(),
  role: z.string().optional().nullable(),
  responsibilities: z.string().optional().nullable(),
  achievements: z.string().optional().nullable(),
  impact: z.string().optional().nullable(),
  teamSize: z.coerce.number().optional().nullable(),
  roleTags: z.array(z.string()).optional(),
  order: z.number().optional(),
})

type FormData = z.infer<typeof schema>

function extractRoleTagStrings(roleTags: any): string[] {
  if (!Array.isArray(roleTags)) return []
  return roleTags.map((t) => (typeof t === 'string' ? t : t?.role)).filter((r): r is string => typeof r === 'string' && r.length > 0)
}

function ProjectForm({
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
  const [isExtracting, setIsExtracting] = useState(false)
  const [techInput, setTechInput] = useState('')
  const [technologies, setTechnologies] = useState<string[]>((defaultValues?.techStack as string[]) ?? [])
  const [selectedRoleTags, setSelectedRoleTags] = useState<string[]>(() => extractRoleTagStrings(defaultValues?.roleTags))
  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    if (defaultValues?.roleTags) {
      setSelectedRoleTags(extractRoleTagStrings(defaultValues.roleTags))
    }
  }, [defaultValues])

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectType: 'PERSONAL',
      techStack: [],
      roleTags: extractRoleTagStrings(defaultValues?.roleTags),
      order: 0,
      ...(defaultValues as any),
      startDate: formatMonthVal(defaultValues?.startDate),
      endDate: formatMonthVal(defaultValues?.endDate),
    },
  })

  const description = watch('description')

  const addTech = () => {
    const tech = techInput.trim()
    if (tech && !technologies.includes(tech)) {
      const updated = [...technologies, tech]
      setTechnologies(updated)
      setValue('techStack', updated)
      setTechInput('')
    }
  }

  const toggleRoleTag = (tag: string) => {
    const updated = selectedRoleTags.includes(tag)
      ? selectedRoleTags.filter((t) => t !== tag)
      : [...selectedRoleTags, tag]
    setSelectedRoleTags(updated)
    setValue('roleTags', updated)
  }

  const handleAIExtract = async () => {
    if (!description || description.length < 30) {
      toast.error('Please write a more detailed description first')
      return
    }
    setIsExtracting(true)
    try {
      const result = await aiExtractFromText(description, 'project')
      setAiResult(result)
      if (result.technologies) {
        const newTechs = [...new Set([...technologies, ...(result.technologies as string[])])]
        setTechnologies(newTechs)
        setValue('techStack', newTechs)
      }
      toast.success('AI extracted skills and insights!')
    } catch {
      toast.error('AI extraction failed. Please try again.')
    } finally {
      setIsExtracting(false)
    }
  }

  const router = useRouter()
  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      try {
        const saved = await upsertProject({
          ...data,
          techStack: technologies,
          roleTags: selectedRoleTags,
        })
        toast.success('Project saved!')
        router.refresh()
        onSave(saved as unknown as Record<string, unknown>)
      } catch {
        toast.error('Failed to save project')
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
          <label className="block text-sm font-medium text-foreground mb-1.5">Project Name <span className="text-destructive">*</span></label>
          <input placeholder="My Awesome Project" {...register('name')} className={cn('w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all', errors.name ? 'border-destructive' : 'border-border')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Project Type</label>
          <select {...register('projectType')} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all">
            {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase().replace('_', ' ')}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-foreground">Description</label>
            <button type="button" onClick={handleAIExtract} disabled={isExtracting} className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-60">
              {isExtracting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {isExtracting ? 'Extracting...' : 'AI Extract'}
            </button>
          </div>
          <textarea rows={4} placeholder="Describe what you built, the problem it solves, and your role..." {...register('description')} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
        </div>

        {/* AI results */}
        {aiResult && (
          <div className="sm:col-span-2 rounded-xl bg-primary/5 border border-primary/20 p-4">
            <p className="text-xs font-semibold text-primary mb-2">✨ AI Extracted Insights</p>
            {(aiResult.resumeBullets as string[])?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">Resume Bullets:</p>
                <ul className="space-y-1">
                  {(aiResult.resumeBullets as string[]).map((bullet, i) => (
                    <li key={i} className="text-xs text-foreground flex gap-2">
                      <span className="text-primary">•</span> {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(aiResult.atsKeywords as string[])?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">ATS Keywords:</p>
                <div className="flex flex-wrap gap-1">
                  {(aiResult.atsKeywords as string[]).map((kw) => (
                    <span key={kw} className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Start Month & Year</label>
          <input
            type="month"
            {...register('startDate')}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">End Month & Year</label>
          <input
            type="month"
            {...register('endDate')}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">GitHub URL</label>
          <input type="url" placeholder="https://github.com/..." {...register('githubUrl')} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Live URL</label>
          <input type="url" placeholder="https://..." {...register('liveUrl')} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
        </div>

        {/* Tech stack */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Tech Stack</label>
          <div className="flex gap-2 mb-2">
            <input value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())} placeholder="React, Node.js, MongoDB..." className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
            <button type="button" onClick={addTech} className="rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Add</button>
          </div>
          {technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <span key={tech} className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {tech} <button type="button" onClick={() => { const u = technologies.filter((t) => t !== tech); setTechnologies(u); setValue('techStack', u) }} className="hover:text-destructive">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Role tags */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">Suitable Roles (for AI targeting)</label>
          <div className="flex flex-wrap gap-2">
            {ROLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleRoleTag(tag)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                  selectedRoleTags.includes(tag)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
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
            <button type="button" onClick={onCancel} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent transition-colors">Cancel</button>
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

interface ProjectsSectionProps {
  data: Record<string, unknown>[]
}

export function ProjectsSection({ data }: ProjectsSectionProps) {
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
        await deleteProject(id)
        setItems((prev) => prev.filter((p) => (p.id as string) !== id))
        toast.success('Project deleted')
        router.refresh()
      } catch {
        toast.error('Failed to delete')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
          <Code2 size={20} className="text-orange-500" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground text-lg">Projects</h2>
          <p className="text-sm text-muted-foreground">Showcase your best work. AI extracts skills automatically.</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((project) => (
          <div key={project.id as string} className="premium-card overflow-hidden">
            <button onClick={() => setExpandedId(expandedId === (project.id as string) ? null : (project.id as string))} className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/30 transition-colors">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-medium text-foreground">{project.name as string}</p>
                  {extractRoleTagStrings(project.roleTags).map((tag) => (
                    <span key={tag} className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {((project.techStack as string[]) ?? []).slice(0, 4).join(' • ')}
                  {((project.techStack as string[]) ?? []).length > 4 && ` +${((project.techStack as string[]) ?? []).length - 4}`}
                </p>
              </div>
              {expandedId === (project.id as string) ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
            </button>
            <AnimatePresence>
              {expandedId === (project.id as string) && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4">
                    <ProjectForm
                      defaultValues={project as Partial<FormData>}
                      onSave={handleSave}
                      onDelete={() => handleDelete(project.id as string)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {showNew && (
          <ProjectForm
            onSave={handleSave}
            onCancel={items.length > 0 ? () => setShowNew(false) : undefined}
          />
        )}
      </div>

      {!showNew && (
        <button onClick={() => setShowNew(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-all">
          <Plus size={18} /> Add Project
        </button>
      )}
    </div>
  )
}
