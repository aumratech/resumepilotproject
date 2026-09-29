import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from './_components/marketing-nav'
import { Hero } from './_components/hero'
import { Features } from './_components/features'
import { ResumeExamples } from './_components/resume-examples'
import { Testimonials } from './_components/testimonials'
import { Pricing } from './_components/pricing'
import { FAQ } from './_components/faq'
import { Footer } from './_components/footer'

import { supabaseAdmin } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'ResumeAI — AI-Powered Resume Builder',
  description:
    'Build ATS-optimized resumes with AI. Analyze job descriptions, match your profile, and generate professional resumes in seconds.',
}

export default async function LandingPage() {
  let heroConfig: any = null
  let bannerConfig: any = null

  try {
    const { data: configs } = await supabaseAdmin.from('landing_page_configs').select('*')
    heroConfig = configs?.find((c) => c.sectionKey === 'hero') ?? null
    bannerConfig = configs?.find((c) => c.sectionKey === 'banner') ?? null
  } catch (e) {
    // Graceful fallback to static defaults
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {bannerConfig && bannerConfig.isActive && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-2 px-4 text-center text-xs font-semibold text-white">
          <span className="mr-2">{bannerConfig.badge || '✨'}</span>
          <span>{bannerConfig.title}</span>
          {bannerConfig.content?.linkText && (
            <a
              href={bannerConfig.content?.linkUrl || '#pricing'}
              className="ml-3 underline hover:text-indigo-200"
            >
              {bannerConfig.content.linkText} &rarr;
            </a>
          )}
        </div>
      )}
      <MarketingNav />
      <main className="flex-1">
        <Hero config={heroConfig} />
        <Features />
        <ResumeExamples />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
