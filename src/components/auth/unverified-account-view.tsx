'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle2, Loader2, LogOut, RefreshCw, Sparkles, ShieldAlert } from 'lucide-react'
import { resendVerificationAction } from '@/server/actions/auth.actions'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function UnverifiedAccountView({ email }: { email: string }) {
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    setIsSending(true)
    try {
      await resendVerificationAction()
      setSent(true)
      toast.success(`Verification email sent to ${email}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send verification email.')
    } finally {
      setIsSending(false)
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-12 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />

      {/* Top Navbar Header */}
      <div className="absolute top-0 left-0 right-0 h-16 border-b border-border/40 px-6 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient shadow-brand-sm">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-base tracking-tight text-foreground">
            ResumeAI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Verification Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg mt-12"
      >
        <div className="relative rounded-3xl border border-amber-500/30 bg-card/60 p-8 shadow-2xl backdrop-blur-xl space-y-6 text-center">
          
          {/* Badge & Icon */}
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
            <Mail className="h-10 w-10 text-amber-500" />
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Action Required: Email Verification
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Verify your email to continue
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              We&apos;ve sent a verification link to your email address. Please verify your account to unlock full access to ResumeAI.
            </p>
          </div>

          {/* Email Box */}
          <div className="rounded-2xl border border-border/80 bg-muted/40 p-3.5 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Target Email</p>
                <p className="text-sm font-semibold text-foreground truncate">{email}</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-300">
              Unverified
            </span>
          </div>

          {/* Steps */}
          <div className="space-y-2 text-left bg-background/50 rounded-2xl p-4 border border-border/40 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground text-xs mb-1">What to do next:</p>
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary">1.</span>
              <span>Open your inbox for <strong>{email}</strong> (check Spam or Junk folder if needed).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary">2.</span>
              <span>Click the <strong>&quot;Verify Email Address&quot;</strong> button inside the email.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary">3.</span>
              <span>Click <strong>&quot;I&apos;ve Verified My Email&quot;</strong> below or refresh this page.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleResend}
              disabled={isSending || sent}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending Verification Email...</span>
                </>
              ) : sent ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>Verification Email Sent!</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>

            <button
              onClick={handleRefresh}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground hover:bg-accent transition-all"
            >
              <RefreshCw size={15} />
              <span>I&apos;ve Verified My Email — Refresh</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
