'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Layers,
  Lock,
  Unlock,
  Check,
  Crown,
  Sparkles,
  ArrowRight,
  Eye,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { UserPlanData } from '@/server/actions/subscription.actions'
import { usePlan } from '@/components/providers/plan-provider'
import { UpgradeModal } from '@/components/modals/upgrade-modal'

interface TemplateLockItem {
  id: string
  template: string
  isLocked: boolean
  requiredPlanSlug: string
  lockReason?: string | null
  planPackage?: {
    name: string
    slug: string
  } | null
}

const TEMPLATE_METADATA = [
  {
    id: 'MODERN',
    name: 'Modern Clean',
    category: 'Popular',
    description: 'Sleek two-tone sidebar with prominent skill pills and crisp typography.',
    tags: ['Tech', 'Design', 'General'],
    color: 'from-blue-600 to-indigo-600',
    accent: '#3b82f6',
  },
  {
    id: 'ATS',
    name: 'ATS Optimized',
    category: 'Essential',
    description: 'High-speed algorithmic parsing standard. Maximum readability by all ATS parsers.',
    tags: ['Engineering', 'Finance', 'All ATS'],
    color: 'from-emerald-600 to-teal-600',
    accent: '#10b981',
  },
  {
    id: 'MINIMAL',
    name: 'Minimalist Tech',
    category: 'Clean',
    description: 'Refined monochrome format that lets achievements and projects speak directly.',
    tags: ['Developers', 'Data Science'],
    color: 'from-slate-700 to-zinc-900',
    accent: '#475569',
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional Classic',
    category: 'Corporate',
    description: 'Traditional executive corporate layout tailored for consulting and management.',
    tags: ['Consulting', 'Operations', 'Finance'],
    color: 'from-violet-600 to-purple-800',
    accent: '#7c3aed',
  },
  {
    id: 'ACADEMIC',
    name: 'Academic & Research',
    category: 'Scholarly',
    description: 'Comprehensive format with dedicated sections for publications and research.',
    tags: ['Research', 'PhD', 'Academia'],
    color: 'from-cyan-600 to-blue-700',
    accent: '#0284c7',
  },
  {
    id: 'EXECUTIVE',
    name: 'Executive Suite',
    category: 'Leadership',
    description: 'High-impact layout with bold headline metrics and strategic impact sections.',
    tags: ['Director', 'VP', 'C-Suite'],
    color: 'from-amber-600 to-yellow-600',
    accent: '#d97706',
  },
  {
    id: 'CREATIVE',
    name: 'Creative Portfolio',
    category: 'Design',
    description: 'Dynamic visual balance with modern portfolio highlights and skill diagrams.',
    tags: ['UI/UX', 'Product', 'Marketing'],
    color: 'from-rose-600 to-pink-600',
    accent: '#e11d48',
  },
]

export function TemplatesClient({
  initialLocks,
  userPlan,
}: {
  initialLocks: TemplateLockItem[]
  userPlan: UserPlanData | null
}) {
  const { plan, isTemplateUnlocked } = usePlan()
  const currentPlan = plan || userPlan

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [activeLockedTemplate, setActiveLockedTemplate] = useState<{
    name: string
    requiredPlan: string
    reason?: string
  } | null>(null)

  const handleTemplateClick = (tmpl: (typeof TEMPLATE_METADATA)[0], isLocked: boolean, lockInfo?: TemplateLockItem) => {
    if (isLocked) {
      const planName =
        lockInfo?.planPackage?.name ||
        (lockInfo?.requiredPlanSlug === 'pro'
          ? 'Executive AI'
          : lockInfo?.requiredPlanSlug === 'starter'
          ? 'Professional'
          : 'Premium')

      setActiveLockedTemplate({
        name: tmpl.name,
        requiredPlan: planName,
        reason: lockInfo?.lockReason || `Upgrade to ${planName} to unlock the ${tmpl.name} resume template.`,
      })
      setUpgradeModalOpen(true)
    } else {
      toast.success(`${tmpl.name} template is unlocked on your plan! Ready for resume creation.`)
    }
  }

  const categories = ['all', 'Popular', 'Essential', 'Corporate', 'Leadership', 'Design']

  const filteredTemplates = TEMPLATE_METADATA.filter((t) => {
    if (selectedCategory === 'all') return true
    return t.category.toLowerCase() === selectedCategory.toLowerCase()
  })

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl premium-card">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Layers className="w-5 h-5 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold font-display text-foreground">
              Resume Templates Gallery
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            All templates are engineered to pass major ATS systems (Workday, Greenhouse, Taleo).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            Current Tier: <span className="font-bold text-foreground">{currentPlan?.planName || 'Free'}</span>
          </div>
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-brand-sm hover:opacity-90 transition-all flex items-center gap-1.5"
          >
            <Crown size={14} />
            <span>Unlock All</span>
          </Link>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground shadow-brand-sm'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {cat === 'all' ? 'All Templates (7)' : cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tmpl) => {
          const lock = initialLocks.find((l) => l.template === tmpl.id)
          const isUnlocked = isTemplateUnlocked(tmpl.id)
          const isLocked = !isUnlocked

          const requiredPlanName =
            lock?.planPackage?.name ||
            (lock?.requiredPlanSlug === 'pro'
              ? 'Executive AI'
              : lock?.requiredPlanSlug === 'starter'
              ? 'Professional'
              : 'Premium Plan')

          return (
            <div
              key={tmpl.id}
              className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex flex-col justify-between group hover:border-primary/40 transition-all"
            >
              {/* Card Header & Miniature Preview */}
              <div>
                <div className={`h-36 bg-gradient-to-tr ${tmpl.color} p-4 relative flex flex-col justify-between overflow-hidden`}>
                  {/* Decorative Mini Resume Elements */}
                  <div className="bg-white/95 dark:bg-slate-900/90 rounded-lg p-2.5 shadow-md w-3/4 space-y-1.5 transform group-hover:scale-105 transition-transform duration-300">
                    <div className="h-2 w-1/3 rounded-sm bg-primary/70" />
                    <div className="h-1.5 w-1/2 rounded-sm bg-muted-foreground/30" />
                    <div className="flex gap-1 pt-1">
                      <div className="h-1 w-1/4 rounded-sm bg-muted-foreground/20" />
                      <div className="h-1 w-1/4 rounded-sm bg-muted-foreground/20" />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center justify-between z-10">
                    <span className="rounded-full bg-black/40 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      {tmpl.category}
                    </span>

                    {isLocked ? (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/90 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase shadow-sm">
                        <Lock size={10} />
                        Requires {requiredPlanName}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 text-white px-2 py-0.5 text-[10px] font-bold shadow-sm">
                        <Check size={10} />
                        Unlocked
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-foreground mb-1">{tmpl.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {tmpl.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {tmpl.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                {isLocked ? (
                  <button
                    onClick={() => handleTemplateClick(tmpl, true, lock)}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Crown size={14} className="fill-amber-500" />
                    <span>Unlock with {requiredPlanName}</span>
                  </button>
                ) : (
                  <Link
                    href="/chat"
                    className="w-full py-2.5 px-4 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Use in AI Resume Chat</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>

              {/* Locked Glass Overlay for Visual Polish */}
              {isLocked && (
                <div
                  onClick={() => handleTemplateClick(tmpl, true, lock)}
                  className="absolute inset-0 bg-background/30 backdrop-blur-[1px] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 text-center"
                >
                  <div className="p-3 rounded-2xl bg-card border border-amber-500/40 shadow-xl space-y-1">
                    <Lock size={20} className="text-amber-500 mx-auto mb-1" />
                    <p className="text-xs font-bold text-foreground">Template Locked</p>
                    <p className="text-[10px] text-muted-foreground">Click to upgrade your plan</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title={`Unlock ${activeLockedTemplate?.name || 'Executive'} Template`}
        description={activeLockedTemplate?.reason || 'Upgrade to unlock all premium layouts.'}
        requiredPlan={activeLockedTemplate?.requiredPlan || 'Professional or Executive AI'}
        featureBadge="Template Privilege"
      />
    </div>
  )
}
