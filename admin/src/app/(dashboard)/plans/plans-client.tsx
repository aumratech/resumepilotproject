'use client'

import { useState } from 'react'
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Loader2,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Sliders,
  Check,
  X,
} from 'lucide-react'
import {
  createPlanAction,
  updatePlanAction,
  deletePlanAction,
  CustomFeatureItem,
} from '@/server/actions/plan.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export function PlansClient({ initialPlans }: { initialPlans: any[] }) {
  const router = useRouter()
  const [plans, setPlans] = useState(initialPlans)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'USD',
    badge: '',
    isPopular: false,
    isActive: true,
    isDefault: false,
    maxResumes: 1,
    maxAiGenerations: 10,
    maxPdfDownloads: 3,
    customFeatures: [
      { key: 'ats_scoring', label: 'ATS Resume Scoring', included: true },
      { key: 'ai_editor', label: 'AI Resume Assistant', included: true },
      { key: 'executive_templates', label: 'Executive Templates', included: false },
      { key: 'cover_letter', label: 'AI Cover Letter Generator', included: false },
      { key: 'priority_support', label: 'Priority Support', included: false },
    ] as CustomFeatureItem[],
  })

  const openCreateModal = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      priceMonthly: 9.99,
      priceYearly: 99.0,
      currency: 'USD',
      badge: '',
      isPopular: false,
      isActive: true,
      isDefault: false,
      maxResumes: 5,
      maxAiGenerations: 50,
      maxPdfDownloads: 15,
      customFeatures: [
        { key: 'ats_scoring', label: 'ATS Resume Scoring', included: true },
        { key: 'ai_editor', label: 'AI Resume Assistant', included: true },
        { key: 'executive_templates', label: 'Executive Templates', included: false },
        { key: 'cover_letter', label: 'AI Cover Letter Generator', included: false },
        { key: 'priority_support', label: 'Priority Support', included: false },
      ],
    })
    setIsModalOpen(true)
  }

  const openEditModal = (plan: any) => {
    setEditingPlan(plan)
    const rawFeatures = Array.isArray(plan.customFeatures) ? plan.customFeatures : []
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      currency: plan.currency || 'USD',
      badge: plan.badge || '',
      isPopular: !!plan.isPopular,
      isActive: !!plan.isActive,
      isDefault: !!plan.isDefault,
      maxResumes: plan.maxResumes,
      maxAiGenerations: plan.maxAiGenerations,
      maxPdfDownloads: plan.maxPdfDownloads,
      customFeatures:
        rawFeatures.length > 0
          ? rawFeatures
          : [
              { key: 'ats_scoring', label: 'ATS Resume Scoring', included: true },
              { key: 'ai_editor', label: 'AI Resume Assistant', included: true },
            ],
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingPlan) {
        const res = await updatePlanAction(editingPlan.id, formData)
        if (res.success) {
          toast.success('Plan package updated successfully!')
          setPlans(plans.map((p) => (p.id === editingPlan.id ? res.data : p)))
          setIsModalOpen(false)
          router.refresh()
        } else {
          toast.error(res.error || 'Failed to update plan')
        }
      } else {
        const res = await createPlanAction(formData)
        if (res.success) {
          toast.success('New plan package created!')
          setPlans([...plans, res.data])
          setIsModalOpen(false)
          router.refresh()
        } else {
          toast.error(res.error || 'Failed to create plan')
        }
      }
    } catch {
      toast.error('An error occurred while saving the plan')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the plan "${name}"? This cannot be undone.`)) {
      return
    }

    try {
      const res = await deletePlanAction(id)
      if (res.success) {
        toast.success(`Plan "${name}" removed.`)
        setPlans(plans.filter((p) => p.id !== id))
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to delete plan')
      }
    } catch {
      toast.error('Failed to delete plan')
    }
  }

  const addCustomFeatureRow = () => {
    setFormData({
      ...formData,
      customFeatures: [
        ...formData.customFeatures,
        {
          key: `custom_${Date.now()}`,
          label: 'New Feature Benefit',
          included: true,
        },
      ],
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl premium-card">
        <div>
          <h1 className="text-base font-bold text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> Active Pricing Tiers ({plans.length})
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure monthly/annual prices, plan quotas (-1 for unlimited), and dynamic feature matrices
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 shadow-brand-sm hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create New Plan
        </button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const features: CustomFeatureItem[] = Array.isArray(plan.customFeatures)
            ? plan.customFeatures
            : []

          return (
            <div
              key={plan.id}
              className={`premium-card p-6 flex flex-col justify-between relative transition-all ${
                plan.isPopular
                  ? 'border-primary ring-2 ring-primary/20 shadow-md'
                  : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full brand-gradient text-white font-bold text-[10px] tracking-wider uppercase shadow-sm">
                  {plan.badge}
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <Badge variant="secondary" className="font-mono text-xs">
                    /{plan.slug}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground mb-4 min-h-[32px]">{plan.description}</p>

                {/* Price Display */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold font-display text-foreground">
                      ${plan.priceMonthly.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">/month</span>
                  </div>
                  <div className="text-xs text-primary font-medium mt-1">
                    ${plan.priceYearly.toFixed(2)} billed annually
                  </div>
                </div>

                {/* Quota Limits */}
                <div className="space-y-2 mb-5 text-xs text-foreground">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border">
                    <span className="text-muted-foreground">Resume Versions:</span>
                    <span className="font-bold">
                      {plan.maxResumes === -1 ? 'Unlimited' : `${plan.maxResumes} max`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-border">
                    <span className="text-muted-foreground">AI Generations / mo:</span>
                    <span className="font-bold">
                      {plan.maxAiGenerations === -1 ? 'Unlimited' : `${plan.maxAiGenerations} runs`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-border">
                    <span className="text-muted-foreground">PDF Downloads / mo:</span>
                    <span className="font-bold">
                      {plan.maxPdfDownloads === -1 ? 'Unlimited' : `${plan.maxPdfDownloads} downloads`}
                    </span>
                  </div>
                </div>

                {/* Custom Features List */}
                <div className="space-y-2 mb-6">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Feature Privileges
                  </h4>
                  <div className="space-y-1.5">
                    {features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs">
                        {feat.included ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className={feat.included ? 'text-foreground' : 'text-muted-foreground line-through'}>
                          {feat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                <div className="text-[11px] text-muted-foreground">
                  <span className="font-bold text-foreground">{plan._count?.subscriptions || 0}</span> subscribers
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(plan)}
                    className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>

                  {!plan.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleDelete(plan.id, plan.name)}
                      className="p-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-6 my-8 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Plan Package'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Starter Pro"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Slug Identifier</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingPlan?.isDefault}
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. starter"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm font-mono focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short summary of this plan"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Monthly Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.priceMonthly}
                    onChange={(e) => setFormData({ ...formData, priceMonthly: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Yearly Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.priceYearly}
                    onChange={(e) => setFormData({ ...formData, priceYearly: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Badge / Tag (Optional)</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Popular, Best Value"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Currency</label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Quota Settings */}
              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-bold text-foreground mb-2">Usage Quotas (-1 for unlimited)</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Max Resumes</label>
                    <input
                      type="number"
                      value={formData.maxResumes}
                      onChange={(e) => setFormData({ ...formData, maxResumes: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">AI Generations</label>
                    <input
                      type="number"
                      value={formData.maxAiGenerations}
                      onChange={(e) => setFormData({ ...formData, maxAiGenerations: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">PDF Downloads</label>
                    <input
                      type="number"
                      value={formData.maxPdfDownloads}
                      onChange={(e) => setFormData({ ...formData, maxPdfDownloads: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Feature Toggles */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-foreground">Custom Feature Perks Matrix</h4>
                  <button
                    type="button"
                    onClick={addCustomFeatureRow}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Feature Perk
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.customFeatures.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border"
                    >
                      <div className="flex-1 mr-3">
                        <input
                          type="text"
                          value={feat.label}
                          onChange={(e) => {
                            const updated = [...formData.customFeatures]
                            updated[idx].label = e.target.value
                            setFormData({ ...formData, customFeatures: updated })
                          }}
                          className="w-full bg-transparent text-xs text-foreground font-medium focus:outline-none border-b border-transparent focus:border-primary"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...formData.customFeatures]
                            updated[idx].included = !updated[idx].included
                            setFormData({ ...formData, customFeatures: updated })
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            feat.included
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-muted text-muted-foreground border border-border'
                          }`}
                        >
                          {feat.included ? 'Included' : 'Locked'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.customFeatures.filter((_, i) => i !== idx)
                            setFormData({ ...formData, customFeatures: updated })
                          }}
                          className="text-destructive hover:bg-destructive/10 p-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-3 border-t border-border">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Mark as Most Popular</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Plan Active & Visible</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 shadow-brand-sm hover:opacity-90 cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingPlan ? 'Update Plan' : 'Create Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
