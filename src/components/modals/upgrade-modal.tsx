'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Crown, Check, ArrowRight, X, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  featureBadge?: string
  requiredPlan?: string
  benefits?: string[]
}

export function UpgradeModal({
  isOpen,
  onClose,
  title = 'Unlock Premium Superpowers',
  description = 'Upgrade your plan to unlock executive resume templates, deep ATS scoring, and unlimited AI tailoring.',
  featureBadge = 'Premium Feature',
  requiredPlan = 'Professional or Executive AI',
  benefits = [
    'Unlimited AI Resume Tailoring & Assistant Chats',
    'Full access to all 7 Executive & Creative Templates',
    'Advanced ATS Recruiter Simulation & Keyword Analysis',
    'Unlimited high-res PDF and Vector Exports',
    'AI Cover Letter Generator & Interview Prep',
  ],
}: UpgradeModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-primary/30 bg-card p-6 shadow-2xl z-10 text-card-foreground"
        >
          {/* Top Gradient Banner */}
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Crown & Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-md">
              <Crown size={20} />
            </div>
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                {featureBadge}
              </span>
              <p className="text-xs text-muted-foreground font-medium">Requires {requiredPlan}</p>
            </div>
          </div>

          <h3 className="text-xl font-bold font-display text-foreground tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
            {description}
          </p>

          {/* Benefits list */}
          <div className="space-y-2 mb-6 rounded-xl bg-muted/40 border border-border p-3.5">
            <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap size={13} className="text-amber-500" /> Plan Benefits Included:
            </p>
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-foreground/90 font-medium">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Check size={11} />
                </div>
                <span>{b}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <Link
              href="/pricing"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-brand hover:opacity-95 transition-all"
            >
              <span>View Plans & Upgrade</span>
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Instant activation • Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
