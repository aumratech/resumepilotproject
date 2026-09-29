'use client'

import { useState } from 'react'
import { Mail, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react'
import { resendVerificationAction } from '@/server/actions/auth.actions'
import { toast } from 'sonner'

export function EmailVerificationBanner({
  email,
  isVerified,
}: {
  email?: string | null
  isVerified: boolean
}) {
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  if (isVerified) return null

  const handleResend = async () => {
    setIsSending(true)
    try {
      await resendVerificationAction()
      setSent(true)
      toast.success('Verification email sent! Please check your inbox.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend verification email.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200 mb-6 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Pending Email Verification</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Please verify your email address ({email || 'your account'}) to unlock full access to create and edit resumes.
            </p>
          </div>
        </div>

        <button
          onClick={handleResend}
          disabled={isSending || sent}
          className="shrink-0 flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-500 px-4 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
        >
          {isSending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : sent ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Link Sent!</span>
            </>
          ) : (
            <>
              <Mail className="h-3.5 w-3.5" />
              <span>Resend Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
