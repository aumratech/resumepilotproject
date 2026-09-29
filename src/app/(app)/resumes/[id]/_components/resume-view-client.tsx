'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Printer,
  Download,
  Share2,
  Check,
  Mail,
  Phone,
  MapPin,
  Globe,
  ExternalLink,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Trash2,
  Loader2,
  Lock,
  Link2,
  Copy,
  X,
  Pencil,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatDateRange } from '@/lib/utils'
import { exportResumeToPdf, PAPER_SIZES, type PaperSize } from '@/lib/pdf-export'
import {
  deleteResumeAction,
  toggleResumePublicAction,
  updateResumeTitleAction,
} from '@/server/actions/resume.actions'
import { usePlan } from '@/components/providers/plan-provider'
import { recordFeatureUsageAction } from '@/server/actions/subscription.actions'
import { UpgradeModal } from '@/components/modals/upgrade-modal'

interface ResumeViewClientProps {
  resume: {
    id: string
    title?: string | null
    version: number
    atsScore?: number | null
    template: string
    updatedAt: Date | string
    isPublic?: boolean
    content: any
    jd?: {
      title?: string | null
    } | null
  }
  profile: any
}

export function ResumeViewClient({ resume, profile }: ResumeViewClientProps) {
  const router = useRouter()
  const { hasPdfQuota, plan } = usePlan()
  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPublic, setIsPublic] = useState(!!resume.isPublic)
  const [isTogglingPublic, setIsTogglingPublic] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [selectedPaperSize, setSelectedPaperSize] = useState<PaperSize>('a4')
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  // Title Rename state
  const [title, setTitle] = useState(resume.title || 'Untitled Resume')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitleValue, setEditTitleValue] = useState(title)
  const [isSavingTitle, setIsSavingTitle] = useState(false)

  async function handleSaveTitle() {
    const trimmed = editTitleValue.trim() || 'Untitled Resume'
    setIsSavingTitle(true)
    try {
      await updateResumeTitleAction(resume.id, trimmed)
      setTitle(trimmed)
      setIsEditingTitle(false)
      toast.success('Resume renamed successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to rename resume')
    } finally {
      setIsSavingTitle(false)
    }
  }

  async function handleTogglePublic(nextValue: boolean) {
    setIsTogglingPublic(true)
    try {
      const res = await toggleResumePublicAction(resume.id, nextValue)
      setIsPublic(res.isPublic)
      if (res.isPublic) {
        toast.success('Public sharing enabled! Anyone with link can view on any device.')
      } else {
        toast.info('Public sharing disabled. Link is now private.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update sharing settings.')
    } finally {
      setIsTogglingPublic(false)
    }
  }

  async function handleDeleteDetail() {
    if (!confirm(`Are you sure you want to delete "${resume.title || 'this resume'}"?`)) return
    setIsDeleting(true)
    try {
      await deleteResumeAction(resume.id)
      toast.success('Resume deleted')
      router.push('/resumes')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete resume')
      setIsDeleting(false)
    }
  }

  // Merge content with profile fallback
  const personalInfo = resume.content?.personalInfo || profile?.personalInfo || {}
  const summary = resume.content?.summary || personalInfo?.summary || personalInfo?.careerObjective || ''
  const experiences = resume.content?.experiences || profile?.experiences || []
  const projects = resume.content?.projects || profile?.projects || []
  const educations = resume.content?.educations || profile?.educations || []
  const skills = resume.content?.skills || profile?.skills || []

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/r/${resume.id}` : `/r/${resume.id}`

  async function handlePrint(autoDownload = true) {
    if (!hasPdfQuota()) {
      setUpgradeModalOpen(true)
      return
    }

    if (!autoDownload) {
      await recordFeatureUsageAction('PDF_DOWNLOAD')
      window.print()
      return
    }

    const docEl = document.getElementById('resume-printable-document')
    if (!docEl) {
      await recordFeatureUsageAction('PDF_DOWNLOAD')
      window.print()
      return
    }

    setIsExportingPdf(true)
    const toastId = toast.loading(`Generating ${selectedPaperSize.toUpperCase()} PDF...`)

    try {
      await recordFeatureUsageAction('PDF_DOWNLOAD')
      const candidateName = personalInfo.fullName || userFallbackName(profile) || 'Resume'
      const cleanName = candidateName.replace(/[^a-zA-Z0-9]/g, '_')
      const resumeTitle = (resume.title || 'Resume').replace(/[^a-zA-Z0-9]/g, '_')
      const fileName = `${cleanName}_${resumeTitle}_${selectedPaperSize.toUpperCase()}.pdf`

      await exportResumeToPdf({
        element: docEl,
        fileName,
        paperSize: selectedPaperSize,
      })

      toast.success(`${selectedPaperSize.toUpperCase()} PDF downloaded successfully!`, { id: toastId })
    } catch (err: any) {
      console.error('PDF export error:', err)
      toast.error('Direct PDF export encountered an issue, opening print dialog instead...', { id: toastId })
      window.print()
    } finally {
      setIsExportingPdf(false)
    }
  }

  function handleExportJSON() {
    const dataStr = JSON.stringify(
      resume.content || { personalInfo, summary, experiences, projects, educations, skills },
      null,
      2
    )
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(resume.title || 'resume').toLowerCase().replace(/\s+/g, '-')}-v${resume.version}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Resume JSON downloaded!')
  }

  function copyPublicLink() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(publicUrl)
      } else {
        const input = document.createElement('input')
        input.value = publicUrl
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
      }
      setCopied(true)
      toast.success('Public link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Top Header Controls (Hidden during print) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/resumes"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {isEditingTitle ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={editTitleValue}
                    onChange={(e) => setEditTitleValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle()
                      if (e.key === 'Escape') setIsEditingTitle(false)
                    }}
                    autoFocus
                    className="rounded-lg border border-primary bg-background px-2.5 py-1 text-sm font-bold text-foreground focus:outline-none"
                  />
                  <button
                    onClick={handleSaveTitle}
                    disabled={isSavingTitle}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    title="Save Title"
                  >
                    {isSavingTitle ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
                  </button>
                  <button
                    onClick={() => {
                      setEditTitleValue(title)
                      setIsEditingTitle(false)
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors"
                    title="Cancel"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group">
                  <h1
                    onClick={() => {
                      setEditTitleValue(title)
                      setIsEditingTitle(true)
                    }}
                    className="font-bold text-xl text-foreground hover:text-primary transition-colors cursor-pointer"
                    title="Click to rename"
                  >
                    {title}
                  </h1>
                  <button
                    onClick={() => {
                      setEditTitleValue(title)
                      setIsEditingTitle(true)
                    }}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors opacity-70 group-hover:opacity-100"
                    title="Rename Resume"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}

              <span className="text-xs rounded-full bg-primary/10 px-2.5 py-0.5 font-bold text-primary">
                v{resume.version}
              </span>
              {isPublic ? (
                <span className="text-xs rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Globe size={11} /> Public
                </span>
              ) : (
                <span className="text-xs rounded-full bg-muted border border-border px-2.5 py-0.5 font-bold text-muted-foreground flex items-center gap-1">
                  <Lock size={11} /> Private
                </span>
              )}
              {resume.atsScore && (
                <span className="text-xs rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                  {resume.atsScore}% ATS Match
                </span>
              )}
            </div>
            {resume.jd?.title && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Tailored for: <span className="font-semibold text-foreground">{resume.jd.title}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-accent transition-all"
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-accent transition-all"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleDeleteDetail}
            disabled={isDeleting}
            className="flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            <span>Delete</span>
          </button>

          {/* Paper Size Selector (A1, A2, A3, A4) */}
          <div className="flex items-center rounded-xl border border-border bg-card p-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-muted-foreground px-2">Paper:</span>
            {(['a4', 'a3', 'a2', 'a1'] as PaperSize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedPaperSize(size)}
                className={`px-2.5 py-1 rounded-lg font-bold uppercase text-xs transition-all ${
                  selectedPaperSize === size
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title={PAPER_SIZES[size].description}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Auto Download PDF Button */}
          <button
            onClick={() => handlePrint(true)}
            disabled={isExportingPdf}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-brand-sm hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
            title={`Auto-download as ${selectedPaperSize.toUpperCase()} PDF`}
          >
            {isExportingPdf ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Downloading {selectedPaperSize.toUpperCase()} PDF...</span>
              </>
            ) : (
              <>
                <Printer size={15} />
                <span>Print Resume ({selectedPaperSize.toUpperCase()})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Share Resume</h3>
                  <p className="text-xs text-muted-foreground">Manage public link & access settings</p>
                </div>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Public Toggle Switch */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">Share with Public</span>
                  {isPublic ? (
                    <span className="text-[10px] rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                      ON
                    </span>
                  ) : (
                    <span className="text-[10px] rounded-full bg-muted-foreground/10 px-2 py-0.5 font-bold text-muted-foreground">
                      OFF
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPublic
                    ? 'Anyone with the link can view on any device'
                    : 'Public link is disabled. Only you can view when logged in'}
                </p>
              </div>

              <button
                onClick={() => handleTogglePublic(!isPublic)}
                disabled={isTogglingPublic}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPublic ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isPublic ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Share Link Box */}
            {isPublic ? (
              <div className="space-y-3 pt-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Public Shareable Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="flex-1 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs font-mono text-foreground focus:outline-none truncate"
                  />
                  <button
                    onClick={copyPublicLink}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-brand-sm hover:opacity-90 transition-all shrink-0"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
                <div className="flex justify-end pt-1">
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <span>Test Public Link in New Tab</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center space-y-2">
                <Lock size={24} className="mx-auto text-amber-500" />
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  Public link generation is turned OFF.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Turn on <strong>Share with Public</strong> above to generate a shareable link for other devices.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable Resume Sheet Document */}
      <div
        id="resume-printable-document"
        className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg text-foreground font-sans space-y-6 print:shadow-none print:border-none print:p-0 print:m-0 print:bg-white print:text-black"
      >
        {/* Header */}
        <div className="border-b border-border pb-6 space-y-3 print:border-gray-300">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight print:text-black">
            {personalInfo.fullName || userFallbackName(profile)}
          </h1>
          {personalInfo.headline && (
            <p className="text-base font-semibold text-primary print:text-gray-800">
              {personalInfo.headline}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground print:text-gray-700">
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                <Mail size={13} className="text-primary print:hidden" />
                {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1">
                <Phone size={13} className="text-primary print:hidden" />
                {personalInfo.phone}
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-primary print:hidden" />
                {personalInfo.location}
              </span>
            )}
            {personalInfo.linkedinUrl && (
              <span className="flex items-center gap-1">
                <Globe size={13} className="text-primary print:hidden" />
                {personalInfo.linkedinUrl}
              </span>
            )}
            {personalInfo.githubUrl && (
              <span className="flex items-center gap-1">
                <ExternalLink size={13} className="text-primary print:hidden" />
                {personalInfo.githubUrl}
              </span>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {summary && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-1 print:border-gray-300 print:text-black">
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-foreground/90 print:text-gray-900">
              {summary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {experiences.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-1 flex items-center gap-2 print:border-gray-300 print:text-black">
              <Briefcase size={14} className="print:hidden" /> Work Experience
            </h2>
            <div className="space-y-4">
              {experiences.map((exp: any, idx: number) => (
                <div key={exp.id || idx} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-xs text-foreground print:text-black">
                      {exp.role} <span className="font-medium text-muted-foreground print:text-gray-600">at {exp.company}</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono print:text-gray-600">
                      {formatDate(exp.startDate)} – {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.location && (
                    <p className="text-[11px] text-muted-foreground italic print:text-gray-600">{exp.location}</p>
                  )}
                  {exp.responsibilities && (
                    <p className="text-xs leading-relaxed text-foreground/80 print:text-gray-800 mt-1 whitespace-pre-line">
                      {exp.responsibilities}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-1 flex items-center gap-2 print:border-gray-300 print:text-black">
              <FolderGit2 size={14} className="print:hidden" /> Key Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj: any, idx: number) => (
                <div key={proj.id || idx} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-xs text-foreground print:text-black">{proj.name}</span>
                    <span className="text-[11px] text-muted-foreground font-mono print:text-gray-600">
                      {formatDateRange(proj.startDate, proj.endDate)}
                    </span>
                  </div>
                  {proj.techStack?.length > 0 && (
                    <p className="text-[11px] font-mono text-primary print:text-gray-700 font-medium">
                      Technologies: {Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                    </p>
                  )}
                  {proj.description && (
                    <p className="text-xs text-foreground/80 print:text-gray-800 leading-relaxed mt-1">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {educations.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-1 flex items-center gap-2 print:border-gray-300 print:text-black">
              <GraduationCap size={14} className="print:hidden" /> Education
            </h2>
            <div className="space-y-2">
              {educations.map((edu: any, idx: number) => (
                <div key={edu.id || idx} className="flex justify-between items-start text-xs">
                  <div>
                    <span className="font-bold text-foreground print:text-black">{edu.degree}</span>
                    {edu.branch && <span className="text-muted-foreground print:text-gray-700"> in {edu.branch}</span>}
                    <p className="text-[11px] text-muted-foreground print:text-gray-600">{edu.institution}</p>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground print:text-gray-600 font-mono">
                    {formatDate(edu.startDate)} – {edu.currentlyStudying ? 'Present' : formatDate(edu.endDate)}
                    {edu.cgpa && <p className="font-semibold text-foreground print:text-black">CGPA: {edu.cgpa}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-1 print:border-gray-300 print:text-black">
              Technical & Core Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((sk: any, idx: number) => {
                const skillName = typeof sk === 'string' ? sk : sk.name
                return (
                  <span
                    key={idx}
                    className="rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-semibold text-primary print:border-gray-300 print:text-black print:bg-gray-100"
                  >
                    {skillName}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* PDF Quota Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Monthly PDF Downloads Quota Reached"
        description="You have reached the PDF export limit for your current plan. Upgrade to Professional or Executive AI to enjoy unlimited high-resolution PDF and vector downloads."
        featureBadge="Download Quota Exceeded"
        requiredPlan="Professional or Executive AI"
      />
    </div>
  )
}

function userFallbackName(profile: any) {
  return profile?.personalInfo?.fullName || 'Your Name'
}
