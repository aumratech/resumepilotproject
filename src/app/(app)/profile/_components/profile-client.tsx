'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  GraduationCap,
  Briefcase,
  Code2,
  Zap,
  Award,
  BookOpen,
  Heart,
  Trophy,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearchParams, useRouter } from 'next/navigation'
import { PersonalInfoSection } from './personal-info-section'
import { EducationSection } from './education-section'
import { ExperienceSection } from './experience-section'
import { ProjectsSection } from './projects-section'
import { SkillsSection } from './skills-section'

const sections = [
  { id: 'personal', label: 'Personal Info', icon: User, color: 'text-blue-500' },
  { id: 'education', label: 'Education', icon: GraduationCap, color: 'text-purple-500' },
  { id: 'experience', label: 'Experience', icon: Briefcase, color: 'text-green-500' },
  { id: 'projects', label: 'Projects', icon: Code2, color: 'text-orange-500' },
  { id: 'skills', label: 'Skills', icon: Zap, color: 'text-yellow-500' },
  { id: 'certifications', label: 'Certifications', icon: Award, color: 'text-pink-500' },
  { id: 'achievements', label: 'Achievements', icon: Trophy, color: 'text-amber-500' },
  { id: 'publications', label: 'Publications', icon: BookOpen, color: 'text-teal-500' },
  { id: 'volunteer', label: 'Volunteer', icon: Heart, color: 'text-red-500' },
  { id: 'preferences', label: 'Preferences', icon: FileText, color: 'text-slate-500' },
]

interface ProfileClientProps {
  profile: Record<string, unknown> | null
  userId: string
}

export function ProfileClient({ profile, userId }: ProfileClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeSection = searchParams.get('tab') || 'personal'

  const handleTabChange = (sectionId: string) => {
    router.replace(`/profile?tab=${sectionId}`, { scroll: false })
  }

  const completionScore = profile
    ? (() => {
        const p = profile as Record<string, unknown>
        const checks = [
          !!p.personalInfo,
          ((p.educations as unknown[]) ?? []).length > 0,
          ((p.experiences as unknown[]) ?? []).length > 0,
          ((p.projects as unknown[]) ?? []).length > 0,
          ((p.skills as unknown[]) ?? []).length > 0,
          ((p.certifications as unknown[]) ?? []).length > 0,
        ]
        return Math.round((checks.filter(Boolean).length / checks.length) * 100)
      })()
    : 0

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      {/* Profile sidebar (2nd div) */}
      <div className="hidden md:flex flex-col w-60 shrink-0 border-r border-border bg-surface-1 py-6 overflow-y-auto h-full">
        {/* Completion */}
        <div className="px-4 mb-6">
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Profile</span>
              <span className="text-xs font-bold text-foreground">{completionScore}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionScore}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full brand-gradient"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {completionScore < 100 ? 'Complete all sections for best AI results' : '🎉 Profile complete!'}
            </p>
          </div>
        </div>

        {/* Section nav */}
        <nav className="flex-1 px-2 space-y-0.5">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleTabChange(section.id)}
              className={cn(
                'group w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-left',
                activeSection === section.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <section.icon
                size={16}
                className={cn(
                  'shrink-0',
                  activeSection === section.id ? section.color : 'text-muted-foreground'
                )}
              />
              <span className="flex-1 truncate">{section.label}</span>
              {activeSection === section.id && (
                <ChevronRight size={14} className="shrink-0 text-muted-foreground" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content (3rd div) */}
      <div className="flex-1 overflow-y-auto h-full p-4 md:p-8 pb-24 md:pb-8">
        {/* Mobile section tabs */}
        <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-3 border-b border-border bg-surface-1 scrollbar-none mb-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleTabChange(section.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <section.icon size={13} />
              {section.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="max-w-3xl"
          >
            {activeSection === 'personal' && (
              <PersonalInfoSection
                data={(profile as Record<string, unknown> | null)?.personalInfo as Record<string, unknown> | undefined}
              />
            )}
            {activeSection === 'education' && (
              <EducationSection
                data={((profile as Record<string, unknown> | null)?.educations as Record<string, unknown>[]) ?? []}
              />
            )}
            {activeSection === 'experience' && (
              <ExperienceSection
                data={((profile as Record<string, unknown> | null)?.experiences as Record<string, unknown>[]) ?? []}
              />
            )}
            {activeSection === 'projects' && (
              <ProjectsSection
                data={((profile as Record<string, unknown> | null)?.projects as Record<string, unknown>[]) ?? []}
              />
            )}
            {activeSection === 'skills' && (
              <SkillsSection
                data={((profile as Record<string, unknown> | null)?.skills as Record<string, unknown>[]) ?? []}
              />
            )}
            {!['personal', 'education', 'experience', 'projects', 'skills'].includes(activeSection) && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  {(() => {
                    const section = sections.find((s) => s.id === activeSection)
                    const Icon = section?.icon ?? FileText
                    return <Icon size={28} className="text-muted-foreground" />
                  })()}
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {sections.find((s) => s.id === activeSection)?.label} section
                </h3>
                <p className="text-sm text-muted-foreground">Coming soon in the next update.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
