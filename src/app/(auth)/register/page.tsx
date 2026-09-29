'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const handleOAuth = async (provider: 'google' | 'github') => {
    setIsLoading(provider)
    try {
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch {
      toast.error('Authentication failed')
      setIsLoading(null)
    }
  }

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
        })
        if (!res.ok) {
          const err = await res.json()
          toast.error(err.message ?? 'Registration failed')
          return
        }
        await signIn('credentials', {
          email: data.email,
          password: data.password,
          callbackUrl: '/dashboard',
        })
      } catch {
        toast.error('Something went wrong. Please try again.')
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm"
    >
      <div className="mb-8">
        <h1 className="heading-display text-3xl text-foreground mb-2">Create your account</h1>
        <p className="text-muted-foreground text-sm">
          Join ResumeAI and build smarter resumes with AI
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <button
          id="register-google"
          onClick={() => handleOAuth('google')}
          disabled={!!isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-60"
        >
          {isLoading === 'google' ? <Loader2 size={18} className="animate-spin" /> : (
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Sign up with Google
        </button>

        <button
          id="register-github"
          onClick={() => handleOAuth('github')}
          disabled={!!isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-60"
        >
          {isLoading === 'github' ? <Loader2 size={18} className="animate-spin" /> : (
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          )}
          Sign up with GitHub
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted-foreground">or sign up with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {[
          { key: 'name' as const, label: 'Full Name', placeholder: 'John Doe', type: 'text' },
          { key: 'email' as const, label: 'Email', placeholder: 'john@example.com', type: 'email' },
          { key: 'password' as const, label: 'Password', placeholder: '••••••••', type: 'password' },
          { key: 'confirmPassword' as const, label: 'Confirm Password', placeholder: '••••••••', type: 'password' },
        ].map((field) => (
          <div key={field.key}>
            <label htmlFor={field.key} className="block text-sm font-medium text-foreground mb-1.5">
              {field.label}
            </label>
            <div className="relative">
              <input
                id={field.key}
                type={field.type === 'password' ? (showPassword ? 'text' : 'password') : field.type}
                placeholder={field.placeholder}
                {...register(field.key)}
                className={cn(
                  'w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring transition-all',
                  field.type === 'password' && 'pr-10',
                  errors[field.key] ? 'border-destructive' : 'border-border'
                )}
              />
              {field.type === 'password' && field.key === 'password' && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
            {errors[field.key] && (
              <p className="mt-1 text-xs text-destructive">{errors[field.key]?.message as string}</p>
            )}
          </div>
        ))}

        <button
          id="register-submit"
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-brand-sm hover:bg-primary/90 transition-all disabled:opacity-60 active:scale-[0.98]"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          {isPending ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        By signing up, you agree to our{' '}
        <a href="#" className="underline hover:text-foreground">Terms</a> and{' '}
        <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
      </p>
    </motion.div>
  )
}
