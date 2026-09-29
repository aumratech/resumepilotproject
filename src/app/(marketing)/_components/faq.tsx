'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: 'Do I need to create an account to use ResumeAI?',
    a: 'Yes, a free account is required to access the AI features and save your profile. Sign up takes less than 30 seconds with Google or GitHub.',
  },
  {
    q: 'How does the AI generate my resume?',
    a: 'You build a detailed profile once. Then paste any job description into the AI chat. The AI analyzes the JD, compares your profile, identifies the best matching content, and generates a tailored resume with optimized bullets and keywords.',
  },
  {
    q: 'Is my data private and secure?',
    a: 'Absolutely. Your profile data is encrypted, never sold or shared. We only use your data to generate your resumes. You can delete your account and all data at any time.',
  },
  {
    q: 'What is ATS and why does it matter?',
    a: 'ATS (Applicant Tracking System) is software that 90% of large companies use to automatically filter resumes before humans see them. Our AI optimizes your resume to score high on ATS systems, increasing your chance of getting interviews.',
  },
  {
    q: 'Can I customize the AI-generated resume?',
    a: 'Yes! After generation, you can edit any section, rewrite individual bullets with AI assistance, change templates, adjust colors and fonts, and preview in real-time before downloading.',
  },
  {
    q: 'How many resumes can I create?',
    a: 'Free users can create 3 AI-generated resumes. Pro users get unlimited resumes with full version history. Every resume is tailored to a specific job description.',
  },
  {
    q: 'What formats can I download?',
    a: 'You can download your resume as a high-quality PDF. DOCX export is available for Pro users. Both formats are perfectly formatted.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 surface-1">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="heading-display text-4xl md:text-5xl text-foreground mb-4"
          >
            Frequently asked questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Everything you need to know about ResumeAI.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-3"
        >
          {faqs.map((faq, i) => (
            <div key={i} className="premium-card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
                id={`faq-${i}`}
                aria-expanded={openIndex === i}
              >
                <span className="font-medium text-foreground">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={cn(
                    'shrink-0 text-muted-foreground transition-transform duration-200',
                    openIndex === i && 'rotate-180'
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
