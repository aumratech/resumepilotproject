'use client'

import { motion } from 'framer-motion'
import {
  Brain,
  Target,
  Layers,
  Zap,
  Shield,
  RefreshCw,
  BarChart3,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI Profile Intelligence',
    description:
      'Your profile is analyzed by AI to extract skills, keywords, and achievements automatically from every project and experience.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Target,
    title: 'JD Matching & Gap Analysis',
    description:
      'Paste any job description and AI instantly matches your profile against requirements, identifying gaps and strengths.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Layers,
    title: '10+ Resume Templates',
    description:
      'Choose from Modern, Professional, ATS-optimized, Executive, and more — all with live preview and instant download.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: BarChart3,
    title: 'Real-time ATS Scoring',
    description:
      'See your ATS compatibility score live as your resume updates. Know exactly how well you\'ll pass automated screening.',
    color: 'from-orange-500 to-amber-600',
  },
  {
    icon: Zap,
    title: 'One-click AI Enhancement',
    description:
      'Select any bullet point and let AI rewrite it with quantified impact, stronger verbs, and relevant keywords.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: RefreshCw,
    title: 'Version Control',
    description:
      'Every resume version is saved automatically. Compare, restore, and manage all your tailored resumes effortlessly.',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description:
      'Your data is encrypted and never shared. You control what AI sees, and you can delete everything at any time.',
    color: 'from-slate-500 to-gray-600',
  },
  {
    icon: Sparkles,
    title: 'Smart Skill Extraction',
    description:
      'Skills are automatically extracted from your projects, experience, and certifications — categorized and ready to use.',
    color: 'from-yellow-500 to-orange-600',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold text-primary uppercase tracking-wider mb-3"
          >
            Why ResumeAI
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="heading-display text-4xl md:text-5xl text-foreground mb-4"
          >
            Everything you need to
            <br />
            <span className="gradient-text">land your dream job</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            From building your professional profile to generating perfectly tailored
            resumes — ResumeAI handles it all intelligently.
          </motion.p>
        </div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="premium-card p-6 group cursor-default"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-sm`}>
                <feature.icon size={22} className="text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
