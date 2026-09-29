import type { Metadata } from 'next'
import './globals.css'
import { AdminProviders } from '@/components/providers'

export const metadata: Metadata = {
  title: 'ResumeAI — Master Admin Control Center',
  description: 'Enterprise Administrative Dashboard for Landing Page CMS, Plans, Resumes, Payments, Colleges, Degrees, and Users',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased min-h-screen">
        <AdminProviders>{children}</AdminProviders>
      </body>
    </html>
  )
}
