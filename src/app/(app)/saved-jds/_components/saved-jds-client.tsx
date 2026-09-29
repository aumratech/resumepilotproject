'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookmarkCheck,
  Plus,
  Search,
  Sparkles,
  Trash2,
  FileText,
  Building2,
  Briefcase,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Pencil,
  Check,
  X,
  Loader2,
  Copy,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Tag,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  SavedJd,
  saveJdAction,
  updateJdAction,
  deleteJdAction,
  analyzeExistingJdAction,
  createResumeFromSavedJdAction,
} from '@/server/actions/jd.actions'

interface SavedJdsClientProps {
  initialJds: SavedJd[]
  isVerified?: boolean
}

export function SavedJdsClient({ initialJds, isVerified = true }: SavedJdsClientProps) {
  const router = useRouter()
  const [jds, setJds] = useState<SavedJd[]>(initialJds)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'analyzed' | 'resumes'>('all')

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedJd, setSelectedJd] = useState<SavedJd | null>(null)
  const [activeModalTab, setActiveModalTab] = useState<'insights' | 'raw' | 'resumes'>('insights')

  // Form states for Add JD
  const [newTitle, setNewTitle] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newRawText, setNewRawText] = useState('')
  const [newRunAnalysis, setNewRunAnalysis] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit title state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitleValue, setEditTitleValue] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Loading actions
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [tailoringId, setTailoringId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filtering
  const filteredJds = jds.filter((jd) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      jd.title?.toLowerCase().includes(q) ||
      jd.analyzed?.company?.toLowerCase().includes(q) ||
      jd.rawText.toLowerCase().includes(q) ||
      (Array.isArray(jd.analyzed?.atsKeywords) &&
        jd.analyzed.atsKeywords.some((k: string) => k.toLowerCase().includes(q))) ||
      (Array.isArray(jd.analyzed?.requiredSkills) &&
        jd.analyzed.requiredSkills.some((s: string) => s.toLowerCase().includes(q)))

    if (!matchesSearch) return false

    if (filter === 'analyzed') {
      return !!jd.analyzed && Object.keys(jd.analyzed).length > 1
    }
    if (filter === 'resumes') {
      return (jd.resumesCount ?? 0) > 0
    }
    return true
  })

  // Stats
  const totalCount = jds.length
  const analyzedCount = jds.filter((j) => j.analyzed && Object.keys(j.analyzed).length > 1).length
  const tailoredCount = jds.reduce((acc, curr) => acc + (curr.resumesCount || 0), 0)

  // Handle Add JD
  async function handleAddJd(e: React.FormEvent) {
    e.preventDefault()
    if (!newRawText.trim() || newRawText.trim().length < 10) {
      toast.error('Please paste a full job description (at least 10 characters).')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await saveJdAction({
        title: newTitle.trim() || undefined,
        company: newCompany.trim() || undefined,
        rawText: newRawText.trim(),
        runAnalysis: newRunAnalysis,
      })

      if (res.success && res.jd) {
        setJds((prev) => [res.jd, ...prev])
        toast.success(newRunAnalysis ? 'Job description saved & analyzed!' : 'Job description saved!')
        setIsAddOpen(false)
        setNewTitle('')
        setNewCompany('')
        setNewRawText('')
        setNewRunAnalysis(true)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save job description')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Delete
  async function handleDelete(e: React.MouseEvent, id: string, title?: string | null) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Are you sure you want to delete "${title || 'this job description'}"?`)) return

    setDeletingId(id)
    try {
      await deleteJdAction(id)
      setJds((prev) => prev.filter((item) => item.id !== id))
      if (selectedJd?.id === id) setSelectedJd(null)
      toast.success('Job description deleted')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  // Handle AI Analysis on existing JD
  async function handleAnalyze(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()

    setAnalyzingId(id)
    try {
      const res = await analyzeExistingJdAction(id)
      if (res.success && res.jd) {
        setJds((prev) => prev.map((item) => (item.id === id ? { ...item, ...res.jd } : item)))
        if (selectedJd?.id === id) {
          setSelectedJd((prev) => (prev ? { ...prev, ...res.jd } : null))
        }
        toast.success('ATS analysis completed successfully!')
      }
    } catch (err: any) {
      toast.error(err.message || 'AI analysis failed')
    } finally {
      setAnalyzingId(null)
    }
  }

  // Handle Tailor Resume
  async function handleTailorResume(e: React.MouseEvent, jd: SavedJd) {
    e.preventDefault()
    e.stopPropagation()

    if (!isVerified) {
      toast.error('Please verify your email address to create resumes.')
      return
    }

    setTailoringId(jd.id)
    try {
      const res = await createResumeFromSavedJdAction(jd.id)
      if (res.success && res.resumeId) {
        toast.success('Tailored resume created!')
        router.push(`/resumes/${res.resumeId}`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate tailored resume')
    } finally {
      setTailoringId(null)
    }
  }

  // Handle Rename
  async function handleSaveEdit(id: string) {
    const trimmed = editTitleValue.trim() || 'Untitled Job Position'
    setIsSavingEdit(true)
    try {
      await updateJdAction({ id, title: trimmed })
      setJds((prev) => prev.map((j) => (j.id === id ? { ...j, title: trimmed } : j)))
      if (selectedJd?.id === id) {
        setSelectedJd((prev) => (prev ? { ...prev, title: trimmed } : null))
      }
      setEditingId(null)
      toast.success('Title updated')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update title')
    } finally {
      setIsSavingEdit(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="heading-display text-3xl text-foreground font-bold tracking-tight">
            Saved Job Descriptions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Store job postings, analyze key ATS requirements, and generate tailored resumes with 1 click.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          <span>Add Job Description</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="premium-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Saved</p>
            <p className="text-2xl font-bold text-foreground">{totalCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BookmarkCheck size={20} />
          </div>
        </div>

        <div className="premium-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ATS Analyzed</p>
            <p className="text-2xl font-bold text-foreground">{analyzedCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Sparkles size={20} />
          </div>
        </div>

        <div className="premium-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tailored Resumes</p>
            <p className="text-2xl font-bold text-foreground">{tailoredCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <FileText size={20} />
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by role, company, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/50 text-xs font-medium">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('analyzed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'analyzed'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Analyzed ({analyzedCount})
          </button>
          <button
            onClick={() => setFilter('resumes')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'resumes'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            With Resumes ({jds.filter((j) => (j.resumesCount || 0) > 0).length})
          </button>
        </div>
      </div>

      {/* JDs List / Grid */}
      {filteredJds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border bg-card/20 p-8">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <BookmarkCheck className="h-8 w-8" />
          </div>
          <h3 className="font-semibold text-foreground text-lg mb-1">
            {searchQuery ? 'No matching job descriptions' : 'No saved job descriptions yet'}
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mb-6">
            {searchQuery
              ? 'Try adjusting your search terms or filters to find what you are looking for.'
              : 'Save target job descriptions from LinkedIn, Indeed, or careers pages to analyze keyword requirements and generate targeted resumes.'}
          </p>

          {!searchQuery && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
            >
              <Plus size={16} />
              <span>Add Your First JD</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJds.map((jd) => {
            const hasAnalysis = jd.analyzed && Object.keys(jd.analyzed).length > 1
            const companyName = jd.analyzed?.company || null
            const seniority = jd.analyzed?.seniority || null
            const requiredSkills: string[] = Array.isArray(jd.analyzed?.requiredSkills)
              ? jd.analyzed.requiredSkills
              : []
            const atsKeywords: string[] = Array.isArray(jd.analyzed?.atsKeywords)
              ? jd.analyzed.atsKeywords
              : []

            return (
              <div
                key={jd.id}
                className="premium-card p-5 space-y-4 flex flex-col justify-between group relative hover:border-primary/40"
              >
                <div className="space-y-3.5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {hasAnalysis ? (
                        <span className="text-[10px] font-semibold tracking-wide rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          ATS Ready
                        </span>
                      ) : (
                        <span className="text-[10px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground font-medium">
                          Raw Text
                        </span>
                      )}

                      <button
                        onClick={(e) => handleDelete(e, jd.id, jd.title)}
                        disabled={deletingId === jd.id}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-80 group-hover:opacity-100"
                        title="Delete JD"
                      >
                        {deletingId === jd.id ? (
                          <Loader2 size={15} className="animate-spin text-destructive" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Title & Company */}
                  <div>
                    {editingId === jd.id ? (
                      <div className="flex items-center gap-1.5 my-1">
                        <input
                          type="text"
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(jd.id)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          autoFocus
                          className="flex-1 rounded-lg border border-primary bg-background px-2.5 py-1 text-xs font-semibold text-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEdit(jd.id)}
                          disabled={isSavingEdit}
                          className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {isSavingEdit ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Check size={13} />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-accent"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-1 group/title">
                        <button
                          onClick={() => {
                            setSelectedJd(jd)
                            setActiveModalTab('insights')
                          }}
                          className="font-bold text-foreground hover:text-primary transition-colors text-left text-base leading-snug line-clamp-1"
                        >
                          {jd.title || 'Untitled Job Position'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setEditingId(jd.id)
                            setEditTitleValue(jd.title || '')
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-foreground opacity-40 group-hover/title:opacity-100 transition-all shrink-0"
                          title="Rename"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                      {companyName ? (
                        <span className="flex items-center gap-1 text-foreground/80 font-medium">
                          <Building2 size={12} className="text-muted-foreground" />
                          {companyName}
                        </span>
                      ) : null}

                      {seniority ? (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">{seniority}</span>
                        </>
                      ) : null}

                      <span>•</span>
                      <span>{new Date(jd.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Skills / ATS Keywords Preview */}
                  {requiredSkills.length > 0 || atsKeywords.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <Tag size={11} />
                        Key Extracted Skills:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(requiredSkills.length > 0 ? requiredSkills : atsKeywords)
                          .slice(0, 4)
                          .map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/50"
                            >
                              {skill}
                            </span>
                          ))}
                        {(requiredSkills.length > 0 ? requiredSkills : atsKeywords).length > 4 && (
                          <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground font-medium">
                            +{(requiredSkills.length > 0 ? requiredSkills : atsKeywords).length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed pt-1">
                      {jd.rawText.slice(0, 120)}...
                    </p>
                  )}

                  {/* Linked Resumes Indicator */}
                  {(jd.resumesCount ?? 0) > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <FileText size={11} />
                        {jd.resumesCount} tailored {jd.resumesCount === 1 ? 'resume' : 'resumes'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedJd(jd)
                      setActiveModalTab('insights')
                    }}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
                  >
                    View Details
                  </button>

                  <div className="flex items-center gap-1.5">
                    {!hasAnalysis && (
                      <button
                        onClick={(e) => handleAnalyze(e, jd.id)}
                        disabled={analyzingId === jd.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
                        title="Extract ATS keywords & skills with AI"
                      >
                        {analyzingId === jd.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Sparkles size={13} />
                        )}
                        <span>Analyze</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => handleTailorResume(e, jd)}
                      disabled={tailoringId === jd.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm"
                    >
                      {tailoringId === jd.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Sparkles size={13} />
                      )}
                      <span>Tailor Resume</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ================= ADD NEW JD MODAL ================= */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <BookmarkCheck size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground text-lg">Save New Job Description</h2>
                    <p className="text-xs text-muted-foreground">
                      Paste a job posting to extract ATS criteria and generate matching resumes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleAddJd} className="p-5 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Job Title / Target Role <span className="text-muted-foreground">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Leave empty to let AI detect the role automatically
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Company Name <span className="text-muted-foreground">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Stripe, Netflix, Google"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">
                      Job Description Text <span className="text-destructive">*</span>
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      {newRawText.length} characters
                    </span>
                  </div>
                  <textarea
                    required
                    rows={8}
                    placeholder="Paste the full job posting here (responsibilities, required qualifications, tech stack, etc.)..."
                    value={newRawText}
                    onChange={(e) => setNewRawText(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-xs leading-relaxed"
                  />
                </div>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRunAnalysis}
                    onChange={(e) => setNewRunAnalysis(e.target.checked)}
                    className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles size={14} className="text-primary" />
                      Run AI ATS Analysis Immediately
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Extracts required skills, preferred qualifications, ATS keyword density, and seniority.
                    </p>
                  </div>
                </label>

                {/* Form Footer */}
                <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-accent transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newRawText.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Analyzing & Saving...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>Save Job Description</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= VIEW / ANALYSIS MODAL ================= */}
      <AnimatePresence>
        {selectedJd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-border flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-foreground text-lg leading-snug">
                      {selectedJd.title || 'Job Description Details'}
                    </h2>
                    {selectedJd.analyzed?.seniority && (
                      <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {selectedJd.analyzed.seniority}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {selectedJd.analyzed?.company && (
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Building2 size={13} className="text-muted-foreground" />
                        {selectedJd.analyzed.company}
                      </span>
                    )}
                    {selectedJd.analyzed?.location && (
                      <span>📍 {selectedJd.analyzed.location}</span>
                    )}
                    <span>Saved on {new Date(selectedJd.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedJd(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center border-b border-border px-5 gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveModalTab('insights')}
                  className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
                    activeModalTab === 'insights'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles size={14} />
                  <span>ATS Insights & Skills</span>
                </button>
                <button
                  onClick={() => setActiveModalTab('raw')}
                  className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
                    activeModalTab === 'raw'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileText size={14} />
                  <span>Full Job Posting</span>
                </button>
                <button
                  onClick={() => setActiveModalTab('resumes')}
                  className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
                    activeModalTab === 'resumes'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BookmarkCheck size={14} />
                  <span>Linked Resumes ({selectedJd.resumesCount || 0})</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {activeModalTab === 'insights' && (
                  <>
                    {!selectedJd.analyzed || Object.keys(selectedJd.analyzed).length <= 1 ? (
                      <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-muted/20 space-y-3">
                        <Sparkles className="h-8 w-8 text-primary mx-auto" />
                        <h4 className="font-semibold text-foreground">No ATS Analysis Performed Yet</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Run our AI parser to extract ATS keyword weights, required skills, and core responsibilities.
                        </p>
                        <button
                          onClick={(e) => handleAnalyze(e, selectedJd.id)}
                          disabled={analyzingId === selectedJd.id}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                        >
                          {analyzingId === selectedJd.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Sparkles size={14} />
                          )}
                          <span>Run AI ATS Analysis Now</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Summary Box */}
                        {selectedJd.analyzed.summary && (
                          <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 space-y-1">
                            <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                              <Sparkles size={13} />
                              Role Summary
                            </h4>
                            <p className="text-xs text-foreground/90 leading-relaxed">
                              {selectedJd.analyzed.summary}
                            </p>
                          </div>
                        )}

                        {/* ATS Keywords Cloud */}
                        {Array.isArray(selectedJd.analyzed.atsKeywords) &&
                          selectedJd.analyzed.atsKeywords.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <TrendingUp size={13} className="text-emerald-500" />
                                High-Priority ATS Keywords
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedJd.analyzed.atsKeywords.map((kw: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Required vs Preferred Skills */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl border border-border bg-card/50 space-y-2">
                            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <CheckCircle2 size={14} className="text-primary" />
                              Required Skills
                            </h4>
                            {Array.isArray(selectedJd.analyzed.requiredSkills) &&
                            selectedJd.analyzed.requiredSkills.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {selectedJd.analyzed.requiredSkills.map((s: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">None specified</p>
                            )}
                          </div>

                          <div className="p-4 rounded-xl border border-border bg-card/50 space-y-2">
                            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <Tag size={14} className="text-muted-foreground" />
                              Preferred / Nice to Have
                            </h4>
                            {Array.isArray(selectedJd.analyzed.preferredSkills) &&
                            selectedJd.analyzed.preferredSkills.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {selectedJd.analyzed.preferredSkills.map((s: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">None specified</p>
                            )}
                          </div>
                        </div>

                        {/* Responsibilities */}
                        {Array.isArray(selectedJd.analyzed.responsibilities) &&
                          selectedJd.analyzed.responsibilities.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Core Responsibilities
                              </h4>
                              <ul className="space-y-1.5 text-xs text-foreground/90">
                                {selectedJd.analyzed.responsibilities.map((resp: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5 font-bold">•</span>
                                    <span>{resp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        {/* Education & Experience info */}
                        {(selectedJd.analyzed.education || selectedJd.analyzed.experience) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                            {selectedJd.analyzed.education && (
                              <div>
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                                  Education:
                                </span>
                                <p className="text-xs font-medium text-foreground mt-0.5">
                                  {selectedJd.analyzed.education}
                                </p>
                              </div>
                            )}
                            {selectedJd.analyzed.experience && (
                              <div>
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                                  Experience:
                                </span>
                                <p className="text-xs font-medium text-foreground mt-0.5">
                                  {selectedJd.analyzed.experience}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {activeModalTab === 'raw' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Original pasted text ({selectedJd.rawText.length} characters)
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedJd.rawText)
                          toast.success('Job description copied to clipboard')
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        <Copy size={13} />
                        <span>Copy Text</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-muted/30 max-h-96 overflow-y-auto font-mono text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {selectedJd.rawText}
                    </div>
                  </div>
                )}

                {activeModalTab === 'resumes' && (
                  <div className="space-y-4">
                    {Array.isArray(selectedJd.resumes) && selectedJd.resumes.length > 0 ? (
                      <div className="space-y-2">
                        {selectedJd.resumes.map((r) => (
                          <div
                            key={r.id}
                            className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between hover:border-primary/40 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <FileText size={18} />
                              </div>
                              <div>
                                <Link
                                  href={`/resumes/${r.id}`}
                                  className="text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                                >
                                  {r.title || 'Untitled Resume'}
                                  <ExternalLink size={11} className="opacity-70" />
                                </Link>
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                  <span>Version {r.version}</span>
                                  {r.atsScore && (
                                    <>
                                      <span>•</span>
                                      <span className="text-emerald-500 font-semibold">
                                        ATS: {r.atsScore}%
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Link
                              href={`/resumes/${r.id}`}
                              className="text-xs font-semibold text-primary hover:underline px-3 py-1.5"
                            >
                              Open Resume →
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 space-y-2">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                        <h4 className="font-semibold text-foreground text-sm">No resumes created yet</h4>
                        <p className="text-xs text-muted-foreground">
                          Generate a tailored resume matching this job description with one click.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
                <button
                  onClick={() => setSelectedJd(null)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-accent transition-all"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleTailorResume(e, selectedJd)}
                    disabled={tailoringId === selectedJd.id}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm"
                  >
                    {tailoringId === selectedJd.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    <span>Tailor New Resume with this JD</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
