'use client'

import { useState } from 'react'
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Shield,
  Loader2,
} from 'lucide-react'
import {
  getCollegesAction,
  createCollegeAction,
  updateCollegeAction,
  deleteCollegeAction,
} from '@/server/actions/college.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export function CollegesClient({
  initialColleges,
  totalColleges,
}: {
  initialColleges: any[]
  totalColleges: number
}) {
  const router = useRouter()
  const [colleges, setColleges] = useState(initialColleges)
  const [total, setTotal] = useState(totalColleges)
  const [search, setSearch] = useState('')
  const [selectedTier, setSelectedTier] = useState('all')
  const [loading, setLoading] = useState(false)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCollege, setEditingCollege] = useState<any | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: '',
    state: '',
    country: 'India',
    tier: 'Tier 1',
    website: '',
    logoUrl: '',
    isVerified: true,
  })

  const handleFilter = async (s = search, t = selectedTier) => {
    setLoading(true)
    try {
      const res = await getCollegesAction({
        search: s || undefined,
        tier: t !== 'all' ? t : undefined,
      })
      if (res.success && res.data) {
        setColleges(res.data)
        setTotal(res.pagination?.total ?? 0)
      }
    } catch {
      toast.error('Failed to filter colleges')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingCollege(null)
    setFormData({
      name: '',
      code: '',
      city: '',
      state: '',
      country: 'India',
      tier: 'Tier 1',
      website: '',
      logoUrl: '',
      isVerified: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (col: any) => {
    setEditingCollege(col)
    setFormData({
      name: col.name,
      code: col.code || '',
      city: col.city || '',
      state: col.state || '',
      country: col.country || 'India',
      tier: col.tier || 'Tier 1',
      website: col.website || '',
      logoUrl: col.logoUrl || '',
      isVerified: !!col.isVerified,
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalLoading(true)

    try {
      if (editingCollege) {
        const res = await updateCollegeAction(editingCollege.id, formData)
        if (res.success) {
          toast.success(`College "${formData.name}" updated`)
          setIsModalOpen(false)
          router.refresh()
        } else {
          toast.error(res.error || 'Failed to update college')
        }
      } else {
        const res = await createCollegeAction(formData)
        if (res.success) {
          toast.success(`College "${formData.name}" added`)
          setIsModalOpen(false)
          router.refresh()
        } else {
          toast.error(res.error || 'Failed to create college')
        }
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const res = await deleteCollegeAction(id)
      if (res.success) {
        toast.success(`College "${name}" removed`)
        setColleges(colleges.filter((c) => c.id !== id))
        setTotal((prev) => prev - 1)
      } else {
        toast.error(res.error || 'Failed to delete college')
      }
    } catch {
      toast.error('Failed to delete college')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl premium-card">
        <div>
          <h1 className="text-base font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" /> College Directory ({total} Universities)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Curate verified academic institutions used for profile autocomplete and ATS credentials matching
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 shadow-brand-sm hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add College / University
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl premium-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by college name, code, state, city..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              handleFilter(e.target.value, selectedTier)
            }}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
          />
        </div>

        <select
          value={selectedTier}
          onChange={(e) => {
            setSelectedTier(e.target.value)
            handleFilter(search, e.target.value)
          }}
          className="px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary w-full sm:w-auto"
        >
          <option value="all">All Tiers</option>
          <option value="Tier 1">Tier 1</option>
          <option value="Tier 2">Tier 2</option>
          <option value="Tier 3">Tier 3</option>
          <option value="Ivy League / Elite">Ivy League / Elite</option>
        </select>
      </div>

      {/* Colleges Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Institution Name</th>
                <th className="px-5 py-3.5">Code</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Tier Ranking</th>
                <th className="px-5 py-3.5">Website</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {colleges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    No colleges match your search
                  </td>
                </tr>
              ) : (
                colleges.map((col) => (
                  <tr key={col.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {col.code ? col.code.substring(0, 3) : 'COL'}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground text-sm block">
                            {col.name}
                          </span>
                          {col.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Verified Institution
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono font-semibold text-primary">
                      {col.code || '—'}
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {[col.city, col.state, col.country].filter(Boolean).join(', ')}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          col.tier?.includes('Tier 1') || col.tier?.includes('Ivy')
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {col.tier || 'Tier 2'}
                      </Badge>
                    </td>

                    <td className="px-5 py-4">
                      {col.website ? (
                        <a
                          href={col.website.startsWith('http') ? col.website : `https://${col.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
                        >
                          Visit Site <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(col)}
                          className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer transition-colors"
                          title="Edit College"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(col.id, col.name)}
                          className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 cursor-pointer transition-colors"
                          title="Delete College"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 my-8 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                {editingCollege ? `Edit: ${editingCollege.name}` : 'Add New College / University'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Institution Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Indian Institute of Technology Bombay"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Acronym / Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. IITB"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Tier / Ranking Level</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                  >
                    <option value="Tier 1">Tier 1</option>
                    <option value="Tier 2">Tier 2</option>
                    <option value="Tier 3">Tier 3</option>
                    <option value="Ivy League / Elite">Ivy League / Elite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="India"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Official Website</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.iitb.ac.in"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Mark as Verified Academic Entity</span>
                </label>
              </div>

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
                  disabled={modalLoading}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 shadow-brand-sm hover:opacity-90 cursor-pointer disabled:opacity-50"
                >
                  {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCollege ? 'Update College' : 'Add College'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
