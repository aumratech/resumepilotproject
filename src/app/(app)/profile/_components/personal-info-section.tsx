'use client'

import { useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Save, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { upsertPersonalInfo } from '@/server/actions/profile.actions'
import { cn } from '@/lib/utils'

const schema = z.object({
  fullName: z.string().optional(),
  headline: z.string().optional(),
  currentRole: z.string().optional(),
  email: z.string().optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().optional().or(z.literal('')),
  githubUrl: z.string().optional().or(z.literal('')),
  portfolioUrl: z.string().optional().or(z.literal('')),
  websiteUrl: z.string().optional().or(z.literal('')),
  nationality: z.string().optional(),
  workAuthorization: z.string().optional(),
  summary: z.string().optional(),
  careerObjective: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface PersonalInfoSectionProps {
  data?: Record<string, unknown>
}

const fields: Array<{
  key: keyof FormData
  label: string
  placeholder: string
  type?: string
  multiline?: boolean
  required?: boolean
}> = [
  { key: 'fullName', label: 'Full Name', placeholder: 'John Doe', required: true },
  { key: 'headline', label: 'Professional Headline', placeholder: 'Full Stack Engineer | React • Node.js • AWS' },
  { key: 'currentRole', label: 'Current Role', placeholder: 'Senior Software Engineer' },
  { key: 'email', label: 'Email', placeholder: 'john@example.com', type: 'email' },
  { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210', type: 'tel' },
  { key: 'location', label: 'Location', placeholder: 'Bangalore, India' },
  { key: 'linkedinUrl', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/johndoe', type: 'url' },
  { key: 'githubUrl', label: 'GitHub URL', placeholder: 'https://github.com/johndoe', type: 'url' },
  { key: 'portfolioUrl', label: 'Portfolio URL', placeholder: 'https://johndoe.dev', type: 'url' },
  { key: 'nationality', label: 'Nationality', placeholder: 'Indian' },
  { key: 'workAuthorization', label: 'Work Authorization', placeholder: 'Open to work in India and US' },
  { key: 'summary', label: 'Professional Summary', placeholder: 'Experienced engineer with 5+ years...', multiline: true },
  { key: 'careerObjective', label: 'Career Objective', placeholder: 'Seeking a challenging role...', multiline: true },
]

export function PersonalInfoSection({ data }: PersonalInfoSectionProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: (data?.fullName as string) ?? '',
      headline: (data?.headline as string) ?? '',
      currentRole: (data?.currentRole as string) ?? '',
      email: (data?.email as string) ?? '',
      phone: (data?.phone as string) ?? '',
      location: (data?.location as string) ?? '',
      linkedinUrl: (data?.linkedinUrl as string) ?? '',
      githubUrl: (data?.githubUrl as string) ?? '',
      portfolioUrl: (data?.portfolioUrl as string) ?? '',
      websiteUrl: (data?.websiteUrl as string) ?? '',
      nationality: (data?.nationality as string) ?? '',
      workAuthorization: (data?.workAuthorization as string) ?? '',
      summary: (data?.summary as string) ?? '',
      careerObjective: (data?.careerObjective as string) ?? '',
    },
  })

  useEffect(() => {
    if (data) {
      reset({
        fullName: (data.fullName as string) ?? '',
        headline: (data.headline as string) ?? '',
        currentRole: (data.currentRole as string) ?? '',
        email: (data.email as string) ?? '',
        phone: (data.phone as string) ?? '',
        location: (data.location as string) ?? '',
        linkedinUrl: (data.linkedinUrl as string) ?? '',
        githubUrl: (data.githubUrl as string) ?? '',
        portfolioUrl: (data.portfolioUrl as string) ?? '',
        websiteUrl: (data.websiteUrl as string) ?? '',
        nationality: (data.nationality as string) ?? '',
        workAuthorization: (data.workAuthorization as string) ?? '',
        summary: (data.summary as string) ?? '',
        careerObjective: (data.careerObjective as string) ?? '',
      })
    }
  }, [data, reset])

  const router = useRouter()
  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await upsertPersonalInfo(formData)
        toast.success('Personal info saved!')
        reset(formData)
        router.refresh()
      } catch (err) {
        toast.error('Failed to save. Please try again.')
      }
    })
  }

  const onInvalid = (errors: Record<string, any>) => {
    const firstKey = Object.keys(errors)[0]
    if (firstKey) {
      const err = errors[firstKey]
      toast.error(err?.message ? String(err.message) : `Please check ${firstKey}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
          <User size={20} className="text-blue-500" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground text-lg">Personal Information</h2>
          <p className="text-sm text-muted-foreground">
            Your basic information for the resume header
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {fields.map((field) => (
            <div
              key={field.key}
              className={cn(field.multiline && 'sm:col-span-2')}
            >
              <label
                htmlFor={field.key}
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              {field.multiline ? (
                <textarea
                  id={field.key}
                  rows={4}
                  placeholder={field.placeholder}
                  {...register(field.key)}
                  className={cn(
                    'w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring transition-all',
                    errors[field.key] ? 'border-destructive' : 'border-border'
                  )}
                />
              ) : (
                <input
                  id={field.key}
                  type={field.type ?? 'text'}
                  placeholder={field.placeholder}
                  {...register(field.key)}
                  className={cn(
                    'w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring transition-all',
                    errors[field.key] ? 'border-destructive' : 'border-border'
                  )}
                />
              )}
              {errors[field.key] && (
                <p className="mt-1 text-xs text-destructive">
                  {errors[field.key]?.message as string}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending || !isDirty}
            className={cn(
              'flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all',
              'bg-primary text-primary-foreground shadow-brand-sm hover:bg-primary/90 active:scale-95',
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100'
            )}
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
