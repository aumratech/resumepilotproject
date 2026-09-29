'use client'

import { useState } from 'react'
import {
  FileText,
  Lock,
  Unlock,
  Eye,
  Trash2,
  Search,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Layers,
  Save,
  Loader2,
} from 'lucide-react'
import {
  getResumesAction,
  deleteResumeAction,
  updateTemplateLockAction,
} from '@/server/actions/resume.actions'
import { ResumeTemplate } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export function ResumesClient({
  initialResumes,
  totalResumes,
  initialLocks,
  availablePlans,
}: {
  initialResumes: any[]
  totalResumes: number
  initialLocks: any[]
  availablePlans: any[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'inventory' | 'locks'>('inventory')
  const [resumes, setResumes] = useState(initialResumes)
  const [total, setTotal] = useState(totalResumes)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  // Resume Preview Inspector Modal
  const [previewResume, setPreviewResume] = useState<any | null>(null)

  // Template locks state
  const [locks, setLocks] = useState(initialLocks)
  const [savingLock, setSavingLock] = useState<string | null>(null)

  // Filter Resumes
  const handleFilter = async (query = searchQuery, tmpl = selectedTemplate) => {
    setLoading(true)
    try {
      const res = await getResumesAction({
        query: query || undefined,
        template: tmpl !== 'all' ? (tmpl as ResumeTemplate) : undefined,
      })
      if (res.success && res.data) {
        setResumes(res.data)
        setTotal(res.pagination?.total ?? 0)
      }
    } catch {
      toast.error('Failed to filter resumes')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteResume = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete resume "${title}"?`)) return

    try {
      const res = await deleteResumeAction(id)
      if (res.success) {
        toast.success('Resume deleted successfully')
        setResumes(resumes.filter((r) => r.id !== id))
        setTotal((prev) => prev - 1)
      } else {
        toast.error(res.error || 'Failed to delete resume')
      }
    } catch {
      toast.error('Failed to delete resume')
    }
  }

  const handleUpdateLock = async (rule: any) => {
    setSavingLock(rule.template)
    try {
      const res = await updateTemplateLockAction({
        template: rule.template,
        isLocked: rule.isLocked,
        requiredPlanSlug: rule.requiredPlanSlug,
        lockReason: rule.lockReason,
      })
      if (res.success) {
        toast.success(`Lock policy for ${rule.template} updated!`)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to update lock')
      }
    } catch {
      toast.error('Failed to update lock')
    } finally {
      setSavingLock(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Toggle Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border overflow-x-auto w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <FileText className="w-4 h-4" />
          Candidate Resumes Inventory ({total})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('locks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'locks'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Lock className="w-4 h-4" />
          Template Lock Matrix ({locks.length} Templates)
        </button>
      </div>

      {/* ================= TAB 1: RESUME INVENTORY ================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl premium-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by resume title, candidate name, or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleFilter(e.target.value, selectedTemplate)
                }}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value)
                  handleFilter(searchQuery, e.target.value)
                }}
                className="px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
              >
                <option value="all">All Templates</option>
                <option value="MODERN">MODERN</option>
                <option value="ATS">ATS Clean</option>
                <option value="PROFESSIONAL">PROFESSIONAL</option>
                <option value="MINIMAL">MINIMAL</option>
                <option value="EXECUTIVE">EXECUTIVE</option>
                <option value="CREATIVE">CREATIVE</option>
                <option value="ACADEMIC">ACADEMIC</option>
              </select>
            </div>
          </div>

          {/* Resumes Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Candidate & Resume</th>
                    <th className="px-5 py-3.5">Template</th>
                    <th className="px-5 py-3.5">ATS Score</th>
                    <th className="px-5 py-3.5">Target Job Description</th>
                    <th className="px-5 py-3.5">Last Updated</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {resumes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                        No resumes match your filter criteria
                      </td>
                    </tr>
                  ) : (
                    resumes.map((res) => (
                      <tr key={res.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div>
                            <span className="font-semibold text-foreground text-sm block">
                              {res.title || 'Untitled Resume'}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {res.user?.name || 'Anonymous'} • {res.user?.email}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <Badge variant="secondary" className="font-mono">
                            {res.template}
                          </Badge>
                        </td>

                        <td className="px-5 py-4">
                          {res.atsScore ? (
                            <Badge
                              variant={
                                res.atsScore >= 80 ? 'success' : res.atsScore >= 60 ? 'warning' : 'destructive'
                              }
                            >
                              {res.atsScore}/100
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">N/A</span>
                          )}
                        </td>

                        <td className="px-5 py-4 max-w-xs truncate text-muted-foreground">
                          {res.jd?.title || 'General Profile'}
                        </td>

                        <td className="px-5 py-4 text-muted-foreground text-[11px]">
                          {formatDistanceToNow(new Date(res.updatedAt), { addSuffix: true })}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewResume(res)}
                              className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer transition-colors"
                              title="Inspect JSON / Content"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteResume(res.id, res.title || 'Untitled')}
                              className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 cursor-pointer transition-colors"
                              title="Delete Resume"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: TEMPLATE LOCK MATRIX ================= */}
      {activeTab === 'locks' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-start gap-3">
            <Shield className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Plan-Specific Template Access Control</p>
              <p className="mt-0.5 text-muted-foreground">
                Locking a template requires candidate users to be on the selected minimum plan package (or higher) to export or render that template.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {locks.map((lock, idx) => {
              const isBusy = savingLock === lock.template

              return (
                <div
                  key={lock.id || lock.template}
                  className="premium-card p-5 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-foreground">{lock.template}</span>
                      <Badge variant={lock.isLocked ? 'warning' : 'success'}>
                        {lock.isLocked ? 'Locked Tier' : 'Open / Free'}
                      </Badge>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lock.isLocked}
                        onChange={(e) => {
                          const next = [...locks]
                          next[idx].isLocked = e.target.checked
                          setLocks(next)
                        }}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                      />
                      Lock Template
                    </label>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-foreground mb-1 font-semibold">
                        Minimum Required Plan Tier
                      </label>
                      <select
                        value={lock.requiredPlanSlug}
                        disabled={!lock.isLocked}
                        onChange={(e) => {
                          const next = [...locks]
                          next[idx].requiredPlanSlug = e.target.value
                          setLocks(next)
                        }}
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs disabled:opacity-50 focus:border-primary focus:outline-none"
                      >
                        {availablePlans.map((p) => (
                          <option key={p.slug} value={p.slug}>
                            {p.name} ({p.slug})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-foreground mb-1 font-semibold">
                        Lock Explanation Message
                      </label>
                      <input
                        type="text"
                        disabled={!lock.isLocked}
                        value={lock.lockReason || ''}
                        onChange={(e) => {
                          const next = [...locks]
                          next[idx].lockReason = e.target.value
                          setLocks(next)
                        }}
                        placeholder="e.g. Upgrade to Pro to unlock this layout"
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs disabled:opacity-50 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex justify-end">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleUpdateLock(lock)}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-brand-sm hover:opacity-90 cursor-pointer disabled:opacity-60 transition-all"
                    >
                      {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Apply Lock Rule
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* JSON / RESUME INSPECTOR MODAL */}
      {previewResume && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 my-8 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  {previewResume.title || 'Untitled Resume'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Template: {previewResume.template} • Owner: {previewResume.user?.name} ({previewResume.user?.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewResume(null)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-muted/40 p-4 rounded-xl border border-border max-h-[60vh] overflow-y-auto">
              <pre className="text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(previewResume.content, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewResume(null)}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
