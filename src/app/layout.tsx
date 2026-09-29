import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ResumeAI — AI-Powered Resume Builder',
    template: '%s | ResumeAI',
  },
  description:
    'Build ATS-optimized resumes with AI. ResumeAI analyzes job descriptions, matches your profile, and generates professional resumes in seconds.',
  keywords: [
    'AI resume builder',
    'ATS resume',
    'resume generator',
    'job application',
    'career',
    'resume optimization',
  ],
  authors: [{ name: 'ResumeAI' }],
  creator: 'ResumeAI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'ResumeAI',
    title: 'ResumeAI — AI-Powered Resume Builder',
    description:
      'Build ATS-optimized resumes with AI. Analyze JDs, match skills, generate resumes in seconds.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeAI — AI-Powered Resume Builder',
    description: 'Build ATS-optimized resumes with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

import { NavigationProgress } from '@/components/layout/navigation-progress'
import { Suspense } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <Providers>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  )
}
