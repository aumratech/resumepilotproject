'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  X,
  Sparkles,
  Crown,
  ShieldCheck,
  Zap,
  ArrowRight,
  CreditCard,
  Lock,
  Loader2,
  HelpCircle,
  Clock,
  Flame,
  Star,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  purchasePlanAction,
  UserPlanData,
} from '@/server/actions/subscription.actions'
import { usePlan } from '@/components/providers/plan-provider'

interface PlanPackage {
  id: string
  name: string
  slug: string
  description?: string | null
  priceMonthly: number
  priceYearly: number
  currency: string
  badge?: string | null
  isPopular: boolean
  isActive: boolean
  isDefault: boolean
  maxResumes: number
  maxAiGenerations: number
  maxPdfDownloads: number
  customFeatures: any
  sortOrder: number
}

export function PricingClient({
  initialPlans,
  initialUserPlan,
}: {
  initialPlans: PlanPackage[]
  initialUserPlan: UserPlanData | null
}) {
  const router = useRouter()
  const { plan: userPlan, refreshPlan } = usePlan()
  const activePlan = userPlan || initialUserPlan

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanPackage | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'upi'>('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [celebrationPlan, setCelebrationPlan] = useState<PlanPackage | null>(null)

  // Payment Form Mock State
  const [cardData, setCardData] = useState({
    cardName: 'Alex Morgan',
    cardNumber: '4242 •••• •••• 4242',
    expiry: '12/28',
    cvv: '984',
  })

  const currentPlanSlug = activePlan?.planSlug || 'free'

  const handleOpenCheckout = (plan: PlanPackage) => {
    if (plan.slug === currentPlanSlug) {
      toast.info('This is already your active plan.')
      return
    }
    setSelectedPlanForCheckout(plan)
  }

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlanForCheckout) return

    setIsProcessing(true)
    try {
      const res = await purchasePlanAction({
        planPackageId: selectedPlanForCheckout.id,
        billingCycle,
        paymentMethod:
          paymentMethod === 'card'
            ? 'Credit Card'
            : paymentMethod === 'paypal'
            ? 'PayPal'
            : 'UPI Payment',
      })

      if (res.success) {
        await refreshPlan()
        const boughtPlan = selectedPlanForCheckout
        setSelectedPlanForCheckout(null)
        setCelebrationPlan(boughtPlan)
        toast.success(`Congratulations! You are now subscribed to ${boughtPlan.name}.`)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to complete transaction')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during payment processing')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary shadow-sm">
          <Crown size={14} className="animate-bounce" />
          <span>Flexible Plans for Every Career Ambition</span>
        </div>

        <h1 className="heading-display text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
          Supercharge Your Job Search with{' '}
          <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            AI-Driven Resumes
          </span>
        </h1>

        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Unlock all executive templates, deep ATS recruiter simulations, and unlimited AI tailoring.
          Switch or cancel anytime.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-3 flex items-center justify-center">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted border border-border">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-black">
                SAVE 17%+
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {initialPlans.map((plan) => {
          const isCurrent = plan.slug === currentPlanSlug
          const isPro = plan.slug === 'pro' || plan.priceMonthly > 15
          const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly
          const monthlyEquivalent =
            billingCycle === 'yearly' ? (plan.priceYearly / 12).toFixed(2) : plan.priceMonthly.toFixed(2)

          const featuresList: { key: string; label: string; included: boolean }[] = Array.isArray(
            plan.customFeatures
          )
            ? plan.customFeatures
            : []

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className={`relative rounded-3xl border flex flex-col justify-between p-7 bg-card text-card-foreground shadow-sm transition-all ${
                plan.isPopular || isPro
                  ? 'border-primary shadow-xl ring-2 ring-primary/20 bg-gradient-to-b from-card via-card to-primary/[0.03]'
                  : 'border-border'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[11px] uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Star size={12} className="fill-white" />
                  <span>{plan.badge}</span>
                </div>
              )}

              <div>
                {/* Plan Title & Slug */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold font-display text-foreground">{plan.name}</h3>
                  {isCurrent && (
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      Current Plan
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mb-6 min-h-[36px]">
                  {plan.description || 'Full suite of resume building tools.'}
                </p>

                {/* Price Display */}
                <div className="mb-6 p-4 rounded-2xl bg-muted/40 border border-border">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-black font-display text-foreground">
                      ${monthlyEquivalent}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      / month
                    </span>
                  </div>
                  {billingCycle === 'yearly' && plan.priceYearly > 0 && (
                    <p className="text-[11px] text-primary font-semibold mt-1">
                      ${plan.priceYearly.toFixed(2)} billed once annually
                    </p>
                  )}
                  {plan.priceMonthly === 0 && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      Free forever • No credit card required
                    </p>
                  )}
                </div>

                {/* Quota Highlights */}
                <div className="space-y-2 mb-6 pb-6 border-b border-border text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Resume Versions:</span>
                    <span className="font-bold text-foreground">
                      {plan.maxResumes === -1 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">Unlimited</span>
                      ) : (
                        `${plan.maxResumes} active resumes`
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">AI Generations:</span>
                    <span className="font-bold text-foreground">
                      {plan.maxAiGenerations === -1 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">Unlimited runs</span>
                      ) : (
                        `${plan.maxAiGenerations} prompts / mo`
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">PDF Downloads:</span>
                    <span className="font-bold text-foreground">
                      {plan.maxPdfDownloads === -1 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">Unlimited exports</span>
                      ) : (
                        `${plan.maxPdfDownloads} downloads / mo`
                      )}
                    </span>
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="space-y-2.5 mb-8">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Included Capabilities
                  </p>
                  <div className="space-y-2">
                    {featuresList.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        {feat.included ? (
                          <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={12} />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-muted text-muted-foreground/50 flex items-center justify-center shrink-0 mt-0.5">
                            <X size={11} />
                          </div>
                        )}
                        <span
                          className={
                            feat.included
                              ? 'text-foreground font-medium'
                              : 'text-muted-foreground/60 line-through'
                          }
                        >
                          {feat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 cursor-default"
                  >
                    <CheckCircle2 size={16} />
                    <span>Active Current Plan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenCheckout(plan)}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                      plan.isPopular || isPro
                        ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-brand hover:opacity-95'
                        : 'bg-foreground text-background hover:opacity-90'
                    }`}
                  >
                    <span>
                      {plan.priceMonthly === 0
                        ? 'Switch to Free Tier'
                        : `Upgrade to ${plan.name}`}
                    </span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* CHECKOUT MODAL */}
      <AnimatePresence>
        {selectedPlanForCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlanForCheckout(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-7 shadow-2xl z-10 text-card-foreground my-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Crown size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Confirm Plan Upgrade</h3>
                    <p className="text-xs text-muted-foreground">Instant activation to your account</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPlanForCheckout(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Order Summary */}
              <div className="my-5 p-4 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-muted-foreground">Selected Tier:</span>
                  <span className="font-bold text-foreground">{selectedPlanForCheckout.name}</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-muted-foreground">Billing Frequency:</span>
                  <span className="capitalize font-semibold text-foreground">{billingCycle}</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-muted-foreground">Unlimited Quotas:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {selectedPlanForCheckout.maxResumes === -1 ? 'Yes (Unlimited)' : `${selectedPlanForCheckout.maxResumes} max`}
                  </span>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between text-sm">
                  <span className="font-bold text-foreground">Total Due Today:</span>
                  <span className="text-lg font-black font-display text-primary">
                    $
                    {(
                      billingCycle === 'yearly'
                        ? selectedPlanForCheckout.priceYearly
                        : selectedPlanForCheckout.priceMonthly
                    ).toFixed(2)}{' '}
                    {selectedPlanForCheckout.currency || 'USD'}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 mb-5">
                <label className="text-xs font-bold text-foreground block">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'paypal'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>PayPal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>UPI / Net</span>
                  </button>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleConfirmPurchase} className="space-y-3">
                {paymentMethod === 'card' && (
                  <>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        required
                        value={cardData.cardName}
                        onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        value={cardData.cardNumber}
                        onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs font-mono focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          required
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs focus:border-primary focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs focus:border-primary focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="p-4 rounded-xl bg-muted/40 text-center text-xs text-muted-foreground">
                    You will be securely redirected to PayPal sandbox checkout upon clicking confirm.
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      UPI Virtual Payment Address
                    </label>
                    <input
                      type="text"
                      placeholder="user@okhdfcbank"
                      defaultValue="user@okaxis"
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs font-mono focus:border-primary focus:outline-none"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-brand flex items-center justify-center gap-2 hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Authorizing & Activating...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={14} />
                        <span>
                          Pay $
                          {(
                            billingCycle === 'yearly'
                              ? selectedPlanForCheckout.priceYearly
                              : selectedPlanForCheckout.priceMonthly
                          ).toFixed(2)}{' '}
                          & Activate Now
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground pt-1">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span>256-Bit SSL Encrypted • Direct Admin Ledger Entry • Instant Access</span>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CELEBRATION MODAL AFTER UPGRADE */}
      <AnimatePresence>
        {celebrationPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCelebrationPlan(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl border border-amber-500/40 bg-card p-7 shadow-2xl z-10 text-card-foreground text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-lg mb-4">
                <Crown size={32} className="fill-slate-950" />
              </div>

              <span className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-3 py-1 text-xs font-black uppercase tracking-wider">
                Premium Unlocked
              </span>

              <h3 className="text-2xl font-black font-display text-foreground mt-3 mb-2">
                Welcome to {celebrationPlan.name}!
              </h3>

              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                Your subscription is active immediately. The golden Premium Crown has been applied
                to your profile and header logo. All executive templates and advanced features are unlocked!
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setCelebrationPlan(null)
                    router.push('/templates')
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold text-xs shadow-brand hover:opacity-95 transition-all cursor-pointer"
                >
                  Explore Unlocked Templates
                </button>
                <button
                  onClick={() => setCelebrationPlan(null)}
                  className="w-full py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Continue to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feature Comparison Matrix */}
      <div className="mt-16 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold font-display text-foreground mb-2 flex items-center gap-2">
          <Zap className="text-primary w-5 h-5" /> Detailed Feature & Quota Comparison
        </h2>
        <p className="text-xs text-muted-foreground mb-6">
          Compare quotas and privileges across all packages configured by the admin
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 text-foreground font-bold">Feature Benefit</th>
                {initialPlans.map((p) => (
                  <th key={p.id} className="py-3 px-4 text-foreground font-bold">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="py-3 px-4 text-muted-foreground font-medium">Monthly Price</td>
                {initialPlans.map((p) => (
                  <td key={p.id} className="py-3 px-4 font-bold text-foreground">
                    ${p.priceMonthly.toFixed(2)}/mo
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-muted-foreground font-medium">Resume Storage Quota</td>
                {initialPlans.map((p) => (
                  <td key={p.id} className="py-3 px-4 font-semibold text-foreground">
                    {p.maxResumes === -1 ? 'Unlimited' : `${p.maxResumes} Resumes`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-muted-foreground font-medium">AI Generation Prompts</td>
                {initialPlans.map((p) => (
                  <td key={p.id} className="py-3 px-4 font-semibold text-foreground">
                    {p.maxAiGenerations === -1 ? 'Unlimited' : `${p.maxAiGenerations} Prompts/mo`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-muted-foreground font-medium">PDF Downloads</td>
                {initialPlans.map((p) => (
                  <td key={p.id} className="py-3 px-4 font-semibold text-foreground">
                    {p.maxPdfDownloads === -1 ? 'Unlimited' : `${p.maxPdfDownloads} Exports/mo`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-muted-foreground font-medium">Executive Templates</td>
                {initialPlans.map((p) => (
                  <td key={p.id} className="py-3 px-4">
                    {p.slug === 'free' ? (
                      <X size={15} className="text-muted-foreground/40" />
                    ) : (
                      <Check size={15} className="text-emerald-500 font-bold" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-muted-foreground font-medium">Priority ATS Scanning</td>
                {initialPlans.map((p) => (
                  <td key={p.id} className="py-3 px-4">
                    <Check size={15} className="text-emerald-500 font-bold" />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
