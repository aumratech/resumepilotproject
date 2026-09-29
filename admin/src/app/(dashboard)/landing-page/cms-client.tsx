'use client'

import { useState } from 'react'
import {
  Globe,
  Sparkles,
  Layout,
  MessageSquare,
  HelpCircle,
  Megaphone,
  Save,
  Loader2,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import {
  updateLandingPageConfigAction,
  toggleLandingPageSectionAction,
} from '@/server/actions/cms.actions'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export function CmsClient({ initialConfigs }: { initialConfigs: any[] }) {
  const [activeTab, setActiveTab] = useState<'hero' | 'features' | 'testimonials' | 'faqs' | 'banner'>('hero')
  const [saving, setSaving] = useState(false)

  // Find configs by sectionKey
  const getSection = (key: string) => {
    return initialConfigs.find((c) => c.sectionKey === key) || {
      sectionKey: key,
      title: '',
      subtitle: '',
      badge: '',
      content: {},
      isActive: true,
    }
  }

  // Local editable state for each section
  const [heroData, setHeroData] = useState(() => {
    const s = getSection('hero')
    return {
      title: s.title || '',
      subtitle: s.subtitle || '',
      badge: s.badge || '',
      primaryCtaText: s.content?.primaryCtaText || 'Build Free Resume',
      primaryCtaUrl: s.content?.primaryCtaUrl || '/register',
      secondaryCtaText: s.content?.secondaryCtaText || 'Explore Templates',
      secondaryCtaUrl: s.content?.secondaryCtaUrl || '#templates',
      statsBadgeText: s.content?.statsBadgeText || 'Over 45,000+ candidates hired',
      metric1Value: s.content?.highlightMetric1?.value || '94%',
      metric1Label: s.content?.highlightMetric1?.label || 'ATS Pass Rate',
      metric2Value: s.content?.highlightMetric2?.value || '3.8x',
      metric2Label: s.content?.highlightMetric2?.label || 'More Interview Calls',
      metric3Value: s.content?.highlightMetric3?.value || '< 2 min',
      metric3Label: s.content?.highlightMetric3?.label || 'Generation Time',
      isActive: s.isActive ?? true,
    }
  })

  const [featuresData, setFeaturesData] = useState(() => {
    const s = getSection('features')
    return {
      title: s.title || 'Engineered for Candidate Success',
      subtitle: s.subtitle || 'Every tool you need to craft high-impact resumes.',
      badge: s.badge || '✨ Core Capabilities',
      items: (s.content?.items as any[]) || [
        {
          title: 'ATS-Optimized Templates',
          description: 'Scientifically formatted layouts that parse flawlessly through modern ATS scanners.',
          icon: 'Layout',
        },
        {
          title: 'AI Resume Tailoring',
          description: 'Match job descriptions with contextual bullet point rephrasing and metric injection.',
          icon: 'Sparkles',
        },
        {
          title: 'Instant Multi-Format Export',
          description: 'Download pixel-perfect PDF, DOCX, and plain-text ATS versions in 1-click.',
          icon: 'Download',
        },
      ],
      isActive: s.isActive ?? true,
    }
  })

  const [testimonialsData, setTestimonialsData] = useState(() => {
    const s = getSection('testimonials')
    return {
      title: s.title || 'Trusted by ambitious professionals worldwide',
      subtitle: s.subtitle || 'See how job seekers accelerated their careers.',
      badge: s.badge || '💬 Success Stories',
      items: (s.content?.items as any[]) || [
        {
          name: 'Sarah Chen',
          role: 'Software Engineer at Stripe',
          quote: 'ResumeAI revamped my entire experience section in 5 minutes. Landed 4 interviews in week one!',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          rating: 5,
        },
        {
          name: 'Michael Rodriguez',
          role: 'Product Lead at Figma',
          quote: 'The ATS keyword matching is uncanny. It highlighted gaps I never would have spotted myself.',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          rating: 5,
        },
      ],
      isActive: s.isActive ?? true,
    }
  })

  const [faqsData, setFaqsData] = useState(() => {
    const s = getSection('faqs')
    return {
      title: s.title || 'Frequently Asked Questions',
      subtitle: s.subtitle || 'Everything you need to know about ResumeAI.',
      badge: s.badge || '❓ Support & Clarity',
      items: (s.content?.items as any[]) || [
        {
          question: 'Is ResumeAI really ATS friendly?',
          answer: 'Yes! All templates follow strict single-column and multi-column clean hierarchy parsing standards.',
        },
        {
          question: 'Can I cancel my subscription anytime?',
          answer: 'Absolutely. You can cancel or switch tiers from your account settings with zero penalties.',
        },
      ],
      isActive: s.isActive ?? true,
    }
  })

  const [bannerData, setBannerData] = useState(() => {
    const s = getSection('banner')
    return {
      title: s.title || '🎉 Summer Launch: Get 30% off Pro Annual plans with code RESUME30!',
      badge: s.badge || 'Special Offer',
      linkText: s.content?.linkText || 'Claim Discount',
      linkUrl: s.content?.linkUrl || '/pricing',
      isActive: s.isActive ?? false,
    }
  })

  const handleToggleActive = async (sectionKey: string, currentVal: boolean) => {
    const newVal = !currentVal
    if (sectionKey === 'hero') setHeroData({ ...heroData, isActive: newVal })
    if (sectionKey === 'features') setFeaturesData({ ...featuresData, isActive: newVal })
    if (sectionKey === 'testimonials') setTestimonialsData({ ...testimonialsData, isActive: newVal })
    if (sectionKey === 'faqs') setFaqsData({ ...faqsData, isActive: newVal })
    if (sectionKey === 'banner') setBannerData({ ...bannerData, isActive: newVal })

    try {
      await toggleLandingPageSectionAction(sectionKey, newVal)
      toast.success(`${sectionKey.toUpperCase()} section visibility updated!`)
    } catch {
      toast.error('Failed to update visibility')
    }
  }

  const handleSaveHero = async () => {
    setSaving(true)
    try {
      const res = await updateLandingPageConfigAction({
        sectionKey: 'hero',
        title: heroData.title,
        subtitle: heroData.subtitle,
        badge: heroData.badge,
        isActive: heroData.isActive,
        content: {
          primaryCtaText: heroData.primaryCtaText,
          primaryCtaUrl: heroData.primaryCtaUrl,
          secondaryCtaText: heroData.secondaryCtaText,
          secondaryCtaUrl: heroData.secondaryCtaUrl,
          statsBadgeText: heroData.statsBadgeText,
          highlightMetric1: { value: heroData.metric1Value, label: heroData.metric1Label },
          highlightMetric2: { value: heroData.metric2Value, label: heroData.metric2Label },
          highlightMetric3: { value: heroData.metric3Value, label: heroData.metric3Label },
        },
      })
      if (res.success) {
        toast.success('Hero section configuration saved live!')
      } else {
        toast.error(res.error || 'Failed to save Hero section')
      }
    } catch {
      toast.error('Error saving Hero')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveFeatures = async () => {
    setSaving(true)
    try {
      const res = await updateLandingPageConfigAction({
        sectionKey: 'features',
        title: featuresData.title,
        subtitle: featuresData.subtitle,
        badge: featuresData.badge,
        isActive: featuresData.isActive,
        content: { items: featuresData.items },
      })
      if (res.success) {
        toast.success('Features section saved live!')
      } else {
        toast.error(res.error || 'Failed to save Features')
      }
    } catch {
      toast.error('Error saving Features')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTestimonials = async () => {
    setSaving(true)
    try {
      const res = await updateLandingPageConfigAction({
        sectionKey: 'testimonials',
        title: testimonialsData.title,
        subtitle: testimonialsData.subtitle,
        badge: testimonialsData.badge,
        isActive: testimonialsData.isActive,
        content: { items: testimonialsData.items },
      })
      if (res.success) {
        toast.success('Testimonials section saved live!')
      } else {
        toast.error(res.error || 'Failed to save Testimonials')
      }
    } catch {
      toast.error('Error saving Testimonials')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveFaqs = async () => {
    setSaving(true)
    try {
      const res = await updateLandingPageConfigAction({
        sectionKey: 'faqs',
        title: faqsData.title,
        subtitle: faqsData.subtitle,
        badge: faqsData.badge,
        isActive: faqsData.isActive,
        content: { items: faqsData.items },
      })
      if (res.success) {
        toast.success('FAQ section saved live!')
      } else {
        toast.error(res.error || 'Failed to save FAQ')
      }
    } catch {
      toast.error('Error saving FAQ')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBanner = async () => {
    setSaving(true)
    try {
      const res = await updateLandingPageConfigAction({
        sectionKey: 'banner',
        title: bannerData.title,
        badge: bannerData.badge,
        isActive: bannerData.isActive,
        content: {
          linkText: bannerData.linkText,
          linkUrl: bannerData.linkUrl,
        },
      })
      if (res.success) {
        toast.success('Announcement banner saved live!')
      } else {
        toast.error(res.error || 'Failed to save Banner')
      }
    } catch {
      toast.error('Error saving Banner')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: Sparkles },
    { id: 'features', label: 'Feature Highlights', icon: Layout },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'banner', label: 'Top Banner', icon: Megaphone },
  ] as const

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl premium-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">Dynamic Landing Page CMS</h1>
            <p className="text-xs text-muted-foreground">All edits immediately reflect on the live application (http://localhost:3000)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span>Preview Live App</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: HERO SECTION */}
      {activeTab === 'hero' && (
        <div className="premium-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Hero Section Settings
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Control the high-converting main headline, badges, and CTAs</p>
            </div>
            <button
              onClick={() => handleToggleActive('hero', heroData.isActive)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {heroData.isActive ? (
                <>
                  <ToggleRight className="w-6 h-6 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Section Enabled</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                  <span>Section Hidden</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Hero Tag / Pill Badge</label>
              <input
                type="text"
                value={heroData.badge}
                onChange={(e) => setHeroData({ ...heroData, badge: e.target.value })}
                placeholder="e.g. ⚡ AI Resume Architect 2.0"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Main Headline (H1)</label>
              <input
                type="text"
                value={heroData.title}
                onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                placeholder="e.g. Build Dream-Job Resumes with Next-Gen AI"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Subheading Description</label>
              <textarea
                rows={3}
                value={heroData.subtitle}
                onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                placeholder="Detailed value proposition..."
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Primary Button Text</label>
                <input
                  type="text"
                  value={heroData.primaryCtaText}
                  onChange={(e) => setHeroData({ ...heroData, primaryCtaText: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Primary Button URL</label>
                <input
                  type="text"
                  value={heroData.primaryCtaUrl}
                  onChange={(e) => setHeroData({ ...heroData, primaryCtaUrl: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Secondary Button Text</label>
                <input
                  type="text"
                  value={heroData.secondaryCtaText}
                  onChange={(e) => setHeroData({ ...heroData, secondaryCtaText: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Secondary Button URL</label>
                <input
                  type="text"
                  value={heroData.secondaryCtaUrl}
                  onChange={(e) => setHeroData({ ...heroData, secondaryCtaUrl: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Social Proof Stats Pill</label>
              <input
                type="text"
                value={heroData.statsBadgeText}
                onChange={(e) => setHeroData({ ...heroData, statsBadgeText: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-xs font-semibold text-foreground mb-2 block">Hero Highlight Metrics</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                  <span className="text-[11px] font-semibold text-muted-foreground">Metric 1</span>
                  <input
                    type="text"
                    value={heroData.metric1Value}
                    onChange={(e) => setHeroData({ ...heroData, metric1Value: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    placeholder="94%"
                  />
                  <input
                    type="text"
                    value={heroData.metric1Label}
                    onChange={(e) => setHeroData({ ...heroData, metric1Label: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    placeholder="ATS Pass Rate"
                  />
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                  <span className="text-[11px] font-semibold text-muted-foreground">Metric 2</span>
                  <input
                    type="text"
                    value={heroData.metric2Value}
                    onChange={(e) => setHeroData({ ...heroData, metric2Value: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    placeholder="3.8x"
                  />
                  <input
                    type="text"
                    value={heroData.metric2Label}
                    onChange={(e) => setHeroData({ ...heroData, metric2Label: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    placeholder="More Interviews"
                  />
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                  <span className="text-[11px] font-semibold text-muted-foreground">Metric 3</span>
                  <input
                    type="text"
                    value={heroData.metric3Value}
                    onChange={(e) => setHeroData({ ...heroData, metric3Value: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    placeholder="< 2 min"
                  />
                  <input
                    type="text"
                    value={heroData.metric3Label}
                    onChange={(e) => setHeroData({ ...heroData, metric3Label: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    placeholder="Generation Time"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={handleSaveHero}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 shadow-brand-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Hero Changes Live</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: FEATURES */}
      {activeTab === 'features' && (
        <div className="premium-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Layout className="w-4 h-4 text-primary" /> Feature Cards & Grid
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Customize core value pillars displayed to prospective subscribers</p>
            </div>
            <button
              onClick={() => handleToggleActive('features', featuresData.isActive)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {featuresData.isActive ? (
                <>
                  <ToggleRight className="w-6 h-6 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Section Enabled</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                  <span>Section Hidden</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Section Badge</label>
                <input
                  type="text"
                  value={featuresData.badge}
                  onChange={(e) => setFeaturesData({ ...featuresData, badge: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Section Title</label>
                <input
                  type="text"
                  value={featuresData.title}
                  onChange={(e) => setFeaturesData({ ...featuresData, title: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Section Subtitle</label>
              <input
                type="text"
                value={featuresData.subtitle}
                onChange={(e) => setFeaturesData({ ...featuresData, subtitle: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-foreground">Feature Item Cards ({featuresData.items.length})</label>
                <button
                  type="button"
                  onClick={() =>
                    setFeaturesData({
                      ...featuresData,
                      items: [
                        ...featuresData.items,
                        {
                          title: 'New Exciting Feature',
                          description: 'Description of the capability...',
                          icon: 'Zap',
                        },
                      ],
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Feature Card
                </button>
              </div>

              <div className="space-y-3">
                {featuresData.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-muted/40 border border-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Feature #{idx + 1}</Badge>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = featuresData.items.filter((_, i) => i !== idx)
                          setFeaturesData({ ...featuresData, items: updated })
                        }}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...featuresData.items]
                            updated[idx].title = e.target.value
                            setFeaturesData({ ...featuresData, items: updated })
                          }}
                          placeholder="Feature title..."
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={item.icon || 'Sparkles'}
                          onChange={(e) => {
                            const updated = [...featuresData.items]
                            updated[idx].icon = e.target.value
                            setFeaturesData({ ...featuresData, items: updated })
                          }}
                          placeholder="Icon (e.g. Sparkles, Zap)"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...featuresData.items]
                        updated[idx].description = e.target.value
                        setFeaturesData({ ...featuresData, items: updated })
                      }}
                      placeholder="Feature description text..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={handleSaveFeatures}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 shadow-brand-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Features Live</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: TESTIMONIALS */}
      {activeTab === 'testimonials' && (
        <div className="premium-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" /> Testimonials & Reviews
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Social proof cards from hired job seekers</p>
            </div>
            <button
              onClick={() => handleToggleActive('testimonials', testimonialsData.isActive)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {testimonialsData.isActive ? (
                <>
                  <ToggleRight className="w-6 h-6 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Section Enabled</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                  <span>Section Hidden</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Section Title</label>
                <input
                  type="text"
                  value={testimonialsData.title}
                  onChange={(e) => setTestimonialsData({ ...testimonialsData, title: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Section Subtitle</label>
                <input
                  type="text"
                  value={testimonialsData.subtitle}
                  onChange={(e) => setTestimonialsData({ ...testimonialsData, subtitle: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-foreground">User Testimonials ({testimonialsData.items.length})</label>
                <button
                  type="button"
                  onClick={() =>
                    setTestimonialsData({
                      ...testimonialsData,
                      items: [
                        ...testimonialsData.items,
                        {
                          name: 'New Candidate',
                          role: 'Role at Company',
                          quote: 'ResumeAI made my application process effortless...',
                          rating: 5,
                        },
                      ],
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Review
                </button>
              </div>

              <div className="space-y-3">
                {testimonialsData.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-muted/40 border border-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Review #{idx + 1}</Badge>
                        <span className="text-amber-500 text-xs">★★★★★</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = testimonialsData.items.filter((_, i) => i !== idx)
                          setTestimonialsData({ ...testimonialsData, items: updated })
                        }}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...testimonialsData.items]
                          updated[idx].name = e.target.value
                          setTestimonialsData({ ...testimonialsData, items: updated })
                        }}
                        placeholder="Candidate Name..."
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                      />
                      <input
                        type="text"
                        value={item.role}
                        onChange={(e) => {
                          const updated = [...testimonialsData.items]
                          updated[idx].role = e.target.value
                          setTestimonialsData({ ...testimonialsData, items: updated })
                        }}
                        placeholder="Role / Title..."
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={item.quote}
                      onChange={(e) => {
                        const updated = [...testimonialsData.items]
                        updated[idx].quote = e.target.value
                        setTestimonialsData({ ...testimonialsData, items: updated })
                      }}
                      placeholder="Testimonial quote text..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={handleSaveTestimonials}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 shadow-brand-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Testimonials Live</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: FAQS */}
      {activeTab === 'faqs' && (
        <div className="premium-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" /> Frequently Asked Questions
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Answer common buyer objections and subscription questions</p>
            </div>
            <button
              onClick={() => handleToggleActive('faqs', faqsData.isActive)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {faqsData.isActive ? (
                <>
                  <ToggleRight className="w-6 h-6 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Section Enabled</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                  <span>Section Hidden</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">FAQ Section Title</label>
                <input
                  type="text"
                  value={faqsData.title}
                  onChange={(e) => setFaqsData({ ...faqsData, title: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">FAQ Section Subtitle</label>
                <input
                  type="text"
                  value={faqsData.subtitle}
                  onChange={(e) => setFaqsData({ ...faqsData, subtitle: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-foreground">Questions List ({faqsData.items.length})</label>
                <button
                  type="button"
                  onClick={() =>
                    setFaqsData({
                      ...faqsData,
                      items: [
                        ...faqsData.items,
                        {
                          question: 'New Question title?',
                          answer: 'Answer explanation text here...',
                        },
                      ],
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </button>
              </div>

              <div className="space-y-3">
                {faqsData.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-muted/40 border border-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">FAQ #{idx + 1}</Badge>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = faqsData.items.filter((_, i) => i !== idx)
                          setFaqsData({ ...faqsData, items: updated })
                        }}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => {
                        const updated = [...faqsData.items]
                        updated[idx].question = e.target.value
                        setFaqsData({ ...faqsData, items: updated })
                      }}
                      placeholder="Question text..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                    />

                    <textarea
                      rows={2}
                      value={item.answer}
                      onChange={(e) => {
                        const updated = [...faqsData.items]
                        updated[idx].answer = e.target.value
                        setFaqsData({ ...faqsData, items: updated })
                      }}
                      placeholder="Answer text..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={handleSaveFaqs}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 shadow-brand-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save FAQs Live</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: TOP BANNER */}
      {activeTab === 'banner' && (
        <div className="premium-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary" /> Announcement Banner
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Top-bar promo alert visible across landing and marketing routes</p>
            </div>
            <button
              onClick={() => handleToggleActive('banner', bannerData.isActive)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {bannerData.isActive ? (
                <>
                  <ToggleRight className="w-6 h-6 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Banner Live</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                  <span>Banner Disabled</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Banner Tag / Badge</label>
              <input
                type="text"
                value={bannerData.badge}
                onChange={(e) => setBannerData({ ...bannerData, badge: e.target.value })}
                placeholder="e.g. 🔥 Flash Sale"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Announcement Copy</label>
              <input
                type="text"
                value={bannerData.title}
                onChange={(e) => setBannerData({ ...bannerData, title: e.target.value })}
                placeholder="e.g. Save 30% on annual Pro plans this week only!"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Link CTA Text</label>
                <input
                  type="text"
                  value={bannerData.linkText}
                  onChange={(e) => setBannerData({ ...bannerData, linkText: e.target.value })}
                  placeholder="e.g. Claim Discount"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Target Destination URL</label>
                <input
                  type="text"
                  value={bannerData.linkUrl}
                  onChange={(e) => setBannerData({ ...bannerData, linkUrl: e.target.value })}
                  placeholder="e.g. /pricing"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={handleSaveBanner}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 shadow-brand-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Announcement Banner</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
