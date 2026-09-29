'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdminAction } from '@/server/actions/admin-auth.actions'
import { Sparkles, ArrowRight, Loader2, Mail, Lock, Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@resumeai.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.set('email', email)
      formData.set('password', password)

      const res = await loginAdminAction(formData)
      if (res.success) {
        toast.success('Admin authentication verified')
        router.push('/dashboard')
        router.refresh()
      } else {
        toast.error(res.error || 'Authentication failed')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fillDefaultCredentials = () => {
    setEmail('admin@resumeai.com')
    setPassword('admin123')
    toast.info('Default credentials applied')
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-background overflow-hidden">
      {/* Background radial effects matching main app */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-gradient-radial from-primary/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Top bar theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Card */}
        <div className="premium-card p-8 bg-card border border-border shadow-xl">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl brand-gradient shadow-brand mb-4">
              <Sparkles size={22} className="text-white" />
            </div>
            <h1 className="heading-display text-2xl text-foreground">
              ResumeAI <span className="gradient-text">Admin</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Master administration & operations console
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@resumeai.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-primary-foreground bg-primary hover:bg-primary/90 shadow-brand hover:shadow-brand-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Enter Admin Console
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Credentials shortcut */}
          <div className="mt-6 pt-5 border-t border-border">
            <div className="bg-muted/50 rounded-xl p-3 border border-border flex items-center justify-between">
              <div className="text-xs">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Shield size={12} className="text-primary" /> Default SuperAdmin
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  admin@resumeai.com / admin123
                </p>
              </div>
              <button
                type="button"
                onClick={fillDefaultCredentials}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all cursor-pointer"
              >
                Auto Fill
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          ResumeAI Admin Portal • Port 3001 Standalone Deployment
        </div>
      </div>
    </div>
  )
}
