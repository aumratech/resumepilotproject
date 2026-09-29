'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Printer,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDateRange } from '@/lib/utils'
import { exportResumeToPdf, PAPER_SIZES, type PaperSize } from '@/lib/pdf-export'

interface PublicResumeClientProps {
  resume: any
}

export function PublicResumeClient({ resume }: PublicResumeClientProps) {
  const profile = resume.user?.profile
  const personalInfo = resume.content?.personalInfo || profile?.personalInfo || {}
  const experiences = resume.content?.experiences || profile?.experiences || []
  const projects = resume.content?.projects || profile?.projects || []
  const educations = resume.content?.educations || profile?.educations || []
  const skills = resume.content?.skills || profile?.skills || []
  const certifications = resume.content?.certifications || profile?.certifications || []

  const [selectedPaperSize, setSelectedPaperSize] = useState<PaperSize>('a4')
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  async function handlePrint(autoDownload = true) {
    if (!autoDownload) {
      window.print()
      return
    }

    const docEl = document.getElementById('public-resume-document')
    if (!docEl) {
      window.print()
      return
    }

    setIsExportingPdf(true)
    const toastId = toast.loading(`Generating ${selectedPaperSize.toUpperCase()} PDF...`)

    try {
      const candidateName = personalInfo.fullName || resume.user?.name || 'Resume'
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
      toast.error('Falling back to browser print...', { id: toastId })
      window.print()
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 md:p-8 text-foreground">
      {/* Top Banner (Hidden during print) */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl brand-gradient flex items-center justify-center text-white font-bold shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-foreground">
              {resume.title || 'Shared Resume'}
            </h2>
            <p className="text-xs text-muted-foreground">Publicly shared via ResumeAI</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <button
            onClick={() => handlePrint(true)}
            disabled={isExportingPdf}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-brand-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
            title={`Auto-download as ${selectedPaperSize.toUpperCase()} PDF`}
          >
            {isExportingPdf ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Downloading {selectedPaperSize.toUpperCase()}...</span>
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

      {/* Printable Public Resume Sheet */}
      <div
        id="public-resume-document"
        className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-border rounded-2xl p-8 md:p-12 shadow-xl space-y-6 print:shadow-none print:border-none print:p-0 print:m-0 print:bg-white print:text-black"
      >
        {/* Header */}
        <div className="border-b border-border pb-6 space-y-2 print:border-gray-300">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight print:text-black">
            {personalInfo.fullName || resume.user?.name || 'Candidate Name'}
          </h1>
          {personalInfo.headline && (
            <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400 print:text-gray-800">
              {personalInfo.headline}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 print:text-gray-700 pt-1">
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                <Mail size={13} className="text-indigo-500 print:hidden" />
                {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1">
                <Phone size={13} className="text-indigo-500 print:hidden" />
                {personalInfo.phone}
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-indigo-500 print:hidden" />
                {personalInfo.location}
              </span>
            )}
            {personalInfo.websiteUrl && (
              <span className="flex items-center gap-1">
                <Globe size={13} className="text-indigo-500 print:hidden" />
                {personalInfo.websiteUrl}
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        {(personalInfo.summary || personalInfo.careerObjective) && (
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 print:text-gray-500">
              Professional Summary
            </h2>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:text-black">
              {personalInfo.summary || personalInfo.careerObjective}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {experiences.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 print:text-gray-500 flex items-center gap-1.5">
              <Briefcase size={14} className="text-indigo-500 print:hidden" />
              Work Experience
            </h2>
            <div className="space-y-4">
              {experiences.map((exp: any, idx: number) => (
                <div key={exp.id || idx} className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 print:text-black">
                      {exp.role}{' '}
                      <span className="font-normal text-slate-500 dark:text-slate-400">
                        at {exp.company}
                      </span>
                    </h3>
                    {(exp.startDate || exp.endDate || exp.isCurrent) && (
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 print:text-gray-600">
                        {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} -{' '}
                        {exp.isCurrent
                          ? 'Present'
                          : exp.endDate
                          ? new Date(exp.endDate).getFullYear()
                          : ''}
                      </span>
                    )}
                  </div>
                  {exp.responsibilities && (
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 print:text-gray-800 whitespace-pre-line">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 print:text-gray-500 flex items-center gap-1.5">
              <FolderGit2 size={14} className="text-indigo-500 print:hidden" />
              Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj: any, idx: number) => (
                <div key={proj.id || idx} className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 print:text-black">
                        {proj.name}
                      </h3>
                      {(proj.startDate || proj.endDate) && (
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 print:text-gray-600">
                          ({formatDateRange(proj.startDate, proj.endDate)})
                        </span>
                      )}
                    </div>
                    {proj.techStack && (
                      <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 print:text-gray-700">
                        {Array.isArray(proj.techStack)
                          ? proj.techStack.join(', ')
                          : proj.techStack}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 print:text-gray-800">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 print:text-gray-500">
              Technical Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill: any, idx: number) => (
                <span
                  key={skill.id || idx}
                  className="rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 print:bg-none print:border-gray-300 print:text-black"
                >
                  {skill.name || skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {educations.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 print:text-gray-500 flex items-center gap-1.5">
              <GraduationCap size={14} className="text-indigo-500 print:hidden" />
              Education
            </h2>
            <div className="space-y-2">
              {educations.map((edu: any, idx: number) => (
                <div key={edu.id || idx} className="flex items-baseline justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 print:text-black">
                      {edu.degree || 'Degree'} {edu.branch ? `in ${edu.branch}` : ''}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 print:text-gray-700">
                      {edu.institution}
                    </p>
                  </div>
                  {edu.cgpa && (
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      CGPA: {edu.cgpa}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 print:text-gray-500 flex items-center gap-1.5">
              <Award size={14} className="text-indigo-500 print:hidden" />
              Certifications
            </h2>
            <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1">
              {certifications.map((cert: any, idx: number) => (
                <li key={cert.id || idx}>
                  <strong className="text-slate-900 dark:text-slate-100 print:text-black">
                    {cert.name}
                  </strong>{' '}
                  — {cert.issuer}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <footer className="max-w-4xl mx-auto mt-8 text-center text-xs text-muted-foreground print:hidden">
        Powered by{' '}
        <Link href="/" className="font-semibold text-primary hover:underline">
          ResumeAI
        </Link>{' '}
        · Build ATS-Optimized Resumes in Seconds
      </footer>
    </div>
  )
}
