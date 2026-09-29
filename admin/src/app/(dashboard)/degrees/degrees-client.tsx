'use client'

import { useState } from 'react'
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  GitBranch,
  Layers,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import {
  createDegreeAction,
  deleteDegreeAction,
  createBranchAction,
  deleteBranchAction,
} from '@/server/actions/degree.actions'
import { DegreeType } from '@prisma/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export function DegreesClient({ initialDegrees }: { initialDegrees: any[] }) {
  const router = useRouter()
  const [degrees, setDegrees] = useState(initialDegrees)
  const [expandedDegreeId, setExpandedDegreeId] = useState<string | null>(
    initialDegrees[0]?.id || null
  )

  // Degree Creation Modal
  const [isDegreeModalOpen, setIsDegreeModalOpen] = useState(false)
  const [degreeLoading, setDegreeLoading] = useState(false)
  const [degreeForm, setDegreeForm] = useState({
    name: '',
    code: '',
    type: DegreeType.BACHELORS,
    durationYears: 4,
    branches: [{ name: '', code: '' }],
  })

  // Branch Modal
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false)
  const [targetDegree, setTargetDegree] = useState<any | null>(null)
  const [branchLoading, setBranchLoading] = useState(false)
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
  })

  const openAddDegree = () => {
    setDegreeForm({
      name: '',
      code: '',
      type: DegreeType.BACHELORS,
      durationYears: 4,
      branches: [{ name: '', code: '' }],
    })
    setIsDegreeModalOpen(true)
  }

  const openAddBranch = (deg: any) => {
    setTargetDegree(deg)
    setBranchForm({ name: '', code: '' })
    setIsBranchModalOpen(true)
  }

  const handleSaveDegree = async (e: React.FormEvent) => {
    e.preventDefault()
    setDegreeLoading(true)

    try {
      const validBranches = degreeForm.branches.filter((b) => b.name.trim().length > 0)
      const res = await createDegreeAction({
        name: degreeForm.name,
        code: degreeForm.code,
        type: degreeForm.type,
        durationYears: degreeForm.durationYears,
        branches: validBranches,
      })

      if (res.success) {
        toast.success(`Degree "${degreeForm.name}" created`)
        setIsDegreeModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to create degree')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setDegreeLoading(false)
    }
  }

  const handleDeleteDegree = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete degree "${name}" and all its branches?`)) return

    try {
      const res = await deleteDegreeAction(id)
      if (res.success) {
        toast.success(`Degree "${name}" deleted`)
        setDegrees(degrees.filter((d) => d.id !== id))
      } else {
        toast.error(res.error || 'Failed to delete degree')
      }
    } catch {
      toast.error('Failed to delete degree')
    }
  }

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetDegree) return
    setBranchLoading(true)

    try {
      const res = await createBranchAction(targetDegree.id, branchForm)
      if (res.success) {
        toast.success(`Branch "${branchForm.name}" added to ${targetDegree.name}`)
        setIsBranchModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to add branch')
      }
    } catch {
      toast.error('Failed to add branch')
    } finally {
      setBranchLoading(false)
    }
  }

  const handleDeleteBranch = async (branchId: string, branchName: string, degreeId: string) => {
    if (!confirm(`Delete branch specialization "${branchName}"?`)) return

    try {
      const res = await deleteBranchAction(branchId)
      if (res.success) {
        toast.success(`Branch "${branchName}" removed`)
        setDegrees(
          degrees.map((d) =>
            d.id === degreeId
              ? { ...d, branches: d.branches.filter((b: any) => b.id !== branchId) }
              : d
          )
        )
      } else {
        toast.error(res.error || 'Failed to delete branch')
      }
    } catch {
      toast.error('Failed to delete branch')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl premium-card">
        <div>
          <h1 className="text-base font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Degrees & Specialization Majors ({degrees.length})
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure standard degree qualifications and nested specialization tracks for candidate profile builders
          </p>
        </div>

        <button
          type="button"
          onClick={openAddDegree}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 shadow-brand-sm hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Degree Program
        </button>
      </div>

      {/* Degrees Accordion / List */}
      <div className="space-y-4">
        {degrees.map((deg) => {
          const isExpanded = expandedDegreeId === deg.id

          return (
            <div
              key={deg.id}
              className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
            >
              {/* Degree Header Row */}
              <div
                onClick={() => setExpandedDegreeId(isExpanded ? null : deg.id)}
                className="p-5 flex items-center justify-between bg-card hover:bg-muted/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                    {deg.code}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{deg.name}</span>
                      <Badge variant="secondary">
                        {deg.type} • {deg.durationYears} Years
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {deg.branches.length} Specialization Branches
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      openAddBranch(deg)
                    }}
                    className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-primary border border-border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Branch
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteDegree(deg.id, deg.name)
                    }}
                    className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 text-xs cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Nested Branches List */}
              {isExpanded && (
                <div className="p-5 border-t border-border bg-muted/20">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Specializations & Branches
                    </span>
                  </div>

                  {deg.branches.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      No branches listed for this degree yet. Click &quot;Add Branch&quot; above.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {deg.branches.map((branch: any) => (
                        <div
                          key={branch.id}
                          className="p-3 rounded-xl bg-card border border-border flex items-center justify-between hover:border-primary/40 transition-colors shadow-sm"
                        >
                          <div className="min-w-0 flex items-center gap-2">
                            <GitBranch className="w-3.5 h-3.5 text-primary shrink-0" />
                            <div className="truncate">
                              <span className="text-xs font-semibold text-foreground block truncate">
                                {branch.name}
                              </span>
                              {branch.code && (
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  {branch.code}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteBranch(branch.id, branch.name, deg.id)}
                            className="text-muted-foreground hover:text-destructive p-1 text-xs transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* CREATE DEGREE MODAL */}
      {isDegreeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 my-8 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Add New Degree Program
              </h3>
              <button
                type="button"
                onClick={() => setIsDegreeModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDegree} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Full Degree Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bachelor of Technology (B.Tech)"
                  value={degreeForm.name}
                  onChange={(e) => setDegreeForm({ ...degreeForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-semibold focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Short Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Tech"
                    value={degreeForm.code}
                    onChange={(e) => setDegreeForm({ ...degreeForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Level / Type</label>
                  <select
                    value={degreeForm.type}
                    onChange={(e) => setDegreeForm({ ...degreeForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                  >
                    <option value="BACHELORS">BACHELORS</option>
                    <option value="MASTERS">MASTERS</option>
                    <option value="DOCTORATE">DOCTORATE</option>
                    <option value="DIPLOMA">DIPLOMA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Duration (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={degreeForm.durationYears}
                    onChange={(e) => setDegreeForm({ ...degreeForm, durationYears: parseFloat(e.target.value) || 4 })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-bold focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDegreeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={degreeLoading}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2 shadow-brand-sm hover:opacity-90 cursor-pointer disabled:opacity-60 transition-all"
                >
                  {degreeLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Degree
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD BRANCH MODAL */}
      {isBranchModalOpen && targetDegree && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 my-8 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-primary" />
                Add Branch to {targetDegree.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Branch / Major Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-semibold focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Branch Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. AI-DS"
                  value={branchForm.code}
                  onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={branchLoading}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2 shadow-brand-sm hover:opacity-90 cursor-pointer disabled:opacity-60 transition-all"
                >
                  {branchLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Add Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
