'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  Zap,
  BarChart3,
  FileText,
} from 'lucide-react'

export function Hero({ config }: { config?: any }) {
  const badgeText = config?.badge || 'AI-Powered Resume Intelligence'
  const headline = config?.title || 'Your AI Resume Operating System'
  const subtitle = config?.subtitle || 'Paste any job description. Let AI analyze it, match your profile, and generate a perfectly tailored, ATS-optimized resume in seconds.'
  const primaryCtaText = config?.content?.primaryCtaText || 'Build My Resume'
  const primaryCtaUrl = config?.content?.primaryCtaUrl || '/register'
  const secondaryCtaText = config?.content?.secondaryCtaText || 'See Examples'
  const secondaryCtaUrl = config?.content?.secondaryCtaUrl || '#examples'

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-gradient-radial from-primary/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-8"
        >
          <Sparkles size={14} className="text-primary" />
          <span className="text-sm font-medium text-primary">
            {badgeText}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="heading-display text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight mb-6"
        >
          {headline}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed mb-10"
        >
          {subtitle}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href={primaryCtaUrl}
            id="hero-cta-primary"
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-brand hover:bg-primary/90 hover:shadow-brand-lg transition-all active:scale-95"
          >
            {primaryCtaText}
            <ArrowRight size={18} />
          </Link>
          <Link
            href={secondaryCtaUrl}
            id="hero-cta-secondary"
            className="flex items-center gap-2 rounded-xl border border-border bg-background px-8 py-4 text-base font-semibold text-foreground hover:bg-accent transition-all"
          >
            {secondaryCtaText}
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
        >
          {[
            { icon: Zap, label: 'AI-powered matching' },
            { icon: BarChart3, label: 'Real-time ATS scoring' },
            { icon: FileText, label: '10+ resume templates' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon size={16} className="text-primary" />
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Hero visual — resume preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="mt-20 mx-auto max-w-4xl"
        >
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/50">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <div className="flex-1 mx-4 h-6 rounded-md bg-background border border-border flex items-center px-3">
                <span className="text-[11px] text-muted-foreground">app.resumeai.io/chat</span>
              </div>
            </div>

            {/* App UI mockup */}
            <div className="flex h-[360px] md:h-[480px]">
              {/* Sidebar */}
              <div className="w-48 hidden md:flex flex-col border-r border-border bg-sidebar p-3 gap-2">
                <div className="h-8 rounded-lg brand-gradient opacity-90" />
                {[85, 70, 60, 75, 55].map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-muted shrink-0" />
                    <div className="h-3 rounded-full bg-muted" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>

              {/* Chat area */}
              <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full brand-gradient shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="inline-block rounded-2xl rounded-tl-none bg-muted px-4 py-3 max-w-xs">
                      <div className="space-y-1.5">
                        <div className="h-2.5 rounded-full bg-muted-foreground/20 w-full" />
                        <div className="h-2.5 rounded-full bg-muted-foreground/20 w-4/5" />
                        <div className="h-2.5 rounded-full bg-muted-foreground/20 w-3/5" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <div className="inline-block rounded-2xl rounded-tr-none bg-primary/10 border border-primary/20 px-4 py-3 max-w-sm">
                    <div className="space-y-1.5">
                      <div className="h-2.5 rounded-full bg-primary/20 w-full" />
                      <div className="h-2.5 rounded-full bg-primary/20 w-5/6" />
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                </div>

                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full brand-gradient shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="inline-block rounded-2xl rounded-tl-none bg-muted px-4 py-3 max-w-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        <div className="h-2.5 rounded-full bg-muted-foreground/20 w-32" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2.5 rounded-full bg-muted-foreground/20 w-full" />
                        <div className="h-2.5 rounded-full bg-muted-foreground/20 w-5/6" />
                        <div className="h-2.5 rounded-full bg-muted-foreground/20 w-4/5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input bar */}
                <div className="mt-auto flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3">
                  <div className="flex-1 h-4 rounded-full bg-muted" />
                  <div className="h-8 w-8 rounded-lg brand-gradient" />
                </div>
              </div>

              {/* Right panel — Resume preview */}
              <div className="w-56 hidden lg:flex flex-col border-l border-border p-4 gap-3">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Live Preview
                </div>
                <div className="flex-1 rounded-lg border border-border bg-white dark:bg-background overflow-hidden">
                  <div className="h-12 brand-gradient" />
                  <div className="p-3 space-y-2">
                    {[100, 75, 80, 60, 70, 55, 65].map((w, i) => (
                      <div
                        key={i}
                        className="h-1.5 rounded-full bg-muted"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">92% ATS Score</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
