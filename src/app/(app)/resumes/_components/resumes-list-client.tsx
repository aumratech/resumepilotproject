'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, FileText, Loader2, Sparkles, Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { deleteResumeAction, updateResumeTitleAction } from '@/server/actions/resume.actions'

interface Resume {
  id: string
  title?: string | null
  version: number
  atsScore?: number | null
  updatedAt: Date | string
  jd?: {
    title?: string | null
  } | null
}

interface ResumesListClientProps {
  initialResumes: Resume[]
  isVerified?: boolean
}

export function ResumesListClient({ initialResumes, isVerified = true }: ResumesListClientProps) {
  const [resumes, setResumes] = useState<Resume[]>(initialResumes)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  async function handleRename(id: string) {
    const trimmed = editingTitle.trim() || 'Untitled Resume'
    setSavingId(id)
    try {
      await updateResumeTitleAction(id, trimmed)
      setResumes((prev) => prev.map((r) => (r.id === id ? { ...r, title: trimmed } : r)))
      setEditingId(null)
      toast.success('Resume renamed')
    } catch (err: any) {
      toast.error(err.message || 'Failed to rename resume')
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string, title?: string | null) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`Are you sure you want to delete "${title || 'this resume'}"?`)) {
      return
    }

    setDeletingId(id)
    try {
      await deleteResumeAction(id)
      setResumes((prev) => prev.filter((r) => r.id !== id))
      toast.success('Resume deleted successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete resume')
    } finally {
      setDeletingId(null)
    }
  }

  if (resumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
          {!isVerified ? <FileText className="h-8 w-8 text-amber-500" /> : <FileText className="h-8 w-8" />}
        </div>
        <h3 className="font-semibold text-foreground text-lg mb-2">
          {!isVerified ? 'Email Verification Pending' : 'No resumes yet'}
        </h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-md">
          {!isVerified
            ? 'Please verify your email address using the link sent to your inbox to unlock resume creation.'
            : 'Start an AI chat, paste a job description, and generate your first tailored resume.'}
        </p>

        {isVerified ? (
          <Link
            href="/chat"
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-brand-sm hover:bg-primary/90 transition-all"
          >
            <Sparkles size={16} />
            <span>Start AI Chat</span>
          </Link>
        ) : (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-2.5 text-xs text-amber-600 dark:text-amber-300 font-medium">
            🔒 Resume creation locked until email is verified
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {resumes.map((resume) => (
        <div
          key={resume.id}
          className="premium-card p-5 space-y-4 flex flex-col justify-between group relative"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground font-mono">
                  v{resume.version}
                </span>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(e, resume.id, resume.title)}
                  disabled={deletingId === resume.id}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-80 group-hover:opacity-100"
                  title="Delete Resume"
                >
                  {deletingId === resume.id ? (
                    <Loader2 size={15} className="animate-spin text-destructive" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </div>
            </div>

            <div>
              {editingId === resume.id ? (
                <div className="flex items-center gap-1.5 my-1">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(resume.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    autoFocus
                    className="flex-1 rounded-lg border border-primary bg-background px-2 py-1 text-xs font-semibold text-foreground focus:outline-none"
                  />
                  <button
                    onClick={() => handleRename(resume.id)}
                    disabled={savingId === resume.id}
                    className="p-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                    title="Save"
                  >
                    {savingId === resume.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 rounded-lg border border-border text-muted-foreground hover:bg-accent transition-all"
                    title="Cancel"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 group/title">
                  <Link
                    href={`/resumes/${resume.id}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors truncate text-sm"
                  >
                    {resume.title ?? 'Untitled Resume'}
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setEditingId(resume.id)
                      setEditingTitle(resume.title || 'Untitled Resume')
                    }}
                    className="p-1 rounded text-muted-foreground hover:text-foreground opacity-60 group-hover/title:opacity-100 transition-all shrink-0"
                    title="Rename Resume"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              )}

              {resume.jd?.title && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  For: {resume.jd.title}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(resume.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            {resume.atsScore && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${resume.atsScore}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                  {resume.atsScore}% ATS
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-3 border-t border-border mt-3">
            <Link
              href={`/resumes/${resume.id}`}
              className="flex-1 text-center rounded-lg border border-border py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              View
            </Link>
            <Link
              href={`/resumes/${resume.id}`}
              className="flex-1 text-center rounded-lg bg-primary/10 text-primary py-2 text-xs font-semibold hover:bg-primary/20 transition-colors"
            >
              View & Print
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
