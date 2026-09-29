'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Mail } from 'lucide-react'
import { verifyEmailAction, resendVerificationAction } from '@/server/actions/auth.actions'
import { toast } from 'sonner'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const hasExecutedRef = useRef(false)

  useEffect(() => {
    if (hasExecutedRef.current) return
    hasExecutedRef.current = true

    if (!token || !email) {
      setStatus('error')
      setErrorMessage('Verification link is invalid or missing required parameters.')
      return
    }

    async function handleVerify() {
      try {
        await verifyEmailAction({ email: email!, token: token! })
        setStatus('success')
        toast.success('Email verified successfully!')
      } catch (err) {
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Verification failed.')
      }
    }

    handleVerify()
  }, [token, email])

  const handleResend = async () => {
    setIsResending(true)
    try {
      await resendVerificationAction()
      toast.success('A new verification link has been sent to your email!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend link.')
    } finally {
      setIsResending(false)
    }
  }

  if (status === 'verifying') {
    return (
      <div className="text-center space-y-4 py-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Verifying your email...</h2>
        <p className="text-sm text-muted-foreground">Please wait a moment while we confirm your email address.</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Email Verified! 🎉</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Your email address has been verified. You now have full access to create, edit, and export AI resumes.
        </p>
        <div className="pt-4 flex flex-col gap-2">
          <button
            onClick={() => router.push('/resumes')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
          >
            <span>Create Your First Resume</span>
            <ArrowRight size={16} />
          </button>
          <Link
            href="/dashboard"
            className="w-full text-center py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center space-y-4 py-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Verification Failed</h2>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {errorMessage || 'The verification link may be expired or invalid.'}
      </p>

      <div className="pt-4 space-y-3">
        <button
          onClick={handleResend}
          disabled={isResending}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {isResending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Resending...</span>
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              <span>Resend Verification Email</span>
            </>
          )}
        </button>

        <Link
          href="/dashboard"
          className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="relative rounded-2xl border border-border/50 bg-card/50 p-8 shadow-2xl backdrop-blur-xl">
          <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <VerifyContent />
          </Suspense>
        </div>
      </motion.div>
    </div>
  )
}
