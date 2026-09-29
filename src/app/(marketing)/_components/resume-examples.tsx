'use client'

import { motion } from 'framer-motion'

const templates = [
  { name: 'Modern', color: 'from-violet-500 to-purple-600', accent: '#6366f1' },
  { name: 'Professional', color: 'from-blue-500 to-cyan-600', accent: '#0ea5e9' },
  { name: 'Minimal', color: 'from-slate-500 to-gray-600', accent: '#64748b' },
  { name: 'ATS Optimized', color: 'from-emerald-500 to-teal-600', accent: '#10b981' },
]

function ResumeCard({
  template,
  index,
}: {
  template: (typeof templates)[0]
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: index % 2 === 0 ? -1 : 1 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative bg-white dark:bg-card rounded-xl border border-border shadow-card overflow-hidden cursor-pointer group"
    >
      {/* Header bar */}
      <div className={`h-16 bg-gradient-to-r ${template.color} relative`}>
        <div className="absolute inset-0 flex items-center px-5 gap-3">
          <div className="h-8 w-8 rounded-full bg-white/20" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 rounded-full bg-white/30 w-24" />
            <div className="h-1.5 rounded-full bg-white/20 w-16" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Section */}
        <div>
          <div className="h-1.5 rounded-full mb-2" style={{ backgroundColor: template.accent + '33', width: '40%' }} />
          <div className="space-y-1.5">
            {[100, 85, 90].map((w, i) => (
              <div key={i} className="h-1.5 rounded-full bg-muted" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        <div className="border-t border-border pt-3">
          <div className="h-1.5 rounded-full mb-2" style={{ backgroundColor: template.accent + '33', width: '35%' }} />
          <div className="space-y-1.5">
            {[95, 80, 75].map((w, i) => (
              <div key={i} className="h-1.5 rounded-full bg-muted" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        <div className="border-t border-border pt-3">
          <div className="h-1.5 rounded-full mb-2" style={{ backgroundColor: template.accent + '33', width: '30%' }} />
          <div className="flex flex-wrap gap-1.5">
            {[50, 45, 55, 40].map((w, i) => (
              <div
                key={i}
                className="h-4 rounded-full bg-muted"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
        <span
          className="text-sm font-semibold text-white rounded-lg px-3 py-1.5"
          style={{ backgroundColor: template.accent }}
        >
          {template.name} Template
        </span>
      </div>
    </motion.div>
  )
}

export function ResumeExamples() {
  return (
    <section id="examples" className="py-24 px-4 sm:px-6 lg:px-8 surface-1">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="heading-display text-4xl md:text-5xl text-foreground mb-4"
          >
            Beautiful templates,
            <br />
            <span className="gradient-text">AI-optimized content</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Choose from professionally designed templates. AI fills them with your
            best content, perfectly tailored.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template, index) => (
            <ResumeCard key={template.name} template={template} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
