'use client'

import { useState } from 'react'
import {
  Users,
  Search,
  Sliders,
  Shield,
  CreditCard,
  FileText,
  Sparkles,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import {
  getUsersAction,
  getUserDetailsAction,
  updateUserPlanAction,
  grantCustomLimitsAction,
  deleteUserAction,
} from '@/server/actions/user.actions'
import { formatDistanceToNow, format } from 'date-fns'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export function UsersClient({
  initialUsers,
  totalUsers,
  availablePlans,
}: {
  initialUsers: any[]
  totalUsers: number
  availablePlans: any[]
}) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [total, setTotal] = useState(totalUsers)
  const [search, setSearch] = useState('')
  const [selectedPlanSlug, setSelectedPlanSlug] = useState('all')
  const [loading, setLoading] = useState(false)

  // Drawer / Inspector
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [drawerLoading, setDrawerLoading] = useState(false)

  // Plan Override Modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [targetUser, setTargetUser] = useState<any | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState(availablePlans[0]?.id || '')
  const [planLoading, setPlanLoading] = useState(false)

  // Custom Limits Modal
  const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false)
  const [customResumes, setCustomResumes] = useState(10)
  const [customAiGenerations, setCustomAiGenerations] = useState(100)
  const [limitsLoading, setLimitsLoading] = useState(false)

  const handleFilter = async (s = search, slug = selectedPlanSlug) => {
    setLoading(true)
    try {
      const res = await getUsersAction({
        search: s || undefined,
        planSlug: slug !== 'all' ? slug : undefined,
      })
      if (res.success && res.data) {
        setUsers(res.data)
        setTotal(res.pagination?.total ?? 0)
      }
    } catch {
      toast.error('Failed to filter users')
    } finally {
      setLoading(false)
    }
  }

  const openUserDetails = async (userId: string) => {
    setDrawerLoading(true)
    try {
      const res = await getUserDetailsAction(userId)
      if (res.success) {
        setSelectedUser(res.data)
      } else {
        toast.error('Failed to load user details')
      }
    } catch {
      toast.error('Error fetching user profile')
    } finally {
      setDrawerLoading(false)
    }
  }

  const openPlanOverride = (u: any) => {
    setTargetUser(u)
    const currentPlanId = u.subscriptions?.[0]?.planPackageId || availablePlans[0]?.id
    setSelectedPlanId(currentPlanId)
    setIsPlanModalOpen(true)
  }

  const openGrantLimits = (u: any) => {
    setTargetUser(u)
    const currentSub = u.subscriptions?.[0]
    setCustomResumes(currentSub?.customMaxResumes || 20)
    setCustomAiGenerations(currentSub?.customMaxAiGenerations || 200)
    setIsLimitsModalOpen(true)
  }

  const handleSavePlanOverride = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetUser) return
    setPlanLoading(true)

    try {
      const res = await updateUserPlanAction({
        userId: targetUser.id,
        planPackageId: selectedPlanId,
      })
      if (res.success) {
        toast.success(`User plan upgraded successfully`)
        setIsPlanModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to update user plan')
      }
    } catch {
      toast.error('Error updating plan')
    } finally {
      setPlanLoading(false)
    }
  }

  const handleSaveCustomLimits = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetUser) return
    setLimitsLoading(true)

    try {
      const res = await grantCustomLimitsAction({
        userId: targetUser.id,
        customMaxResumes: customResumes,
        customMaxAiGenerations: customAiGenerations,
      })
      if (res.success) {
        toast.success(`Custom limits granted to ${targetUser.name || targetUser.email}`)
        setIsLimitsModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to grant limits')
      }
    } catch {
      toast.error('Error granting limits')
    } finally {
      setLimitsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user account "${email}"? This will delete all resumes, chats, and profiles associated with this account.`)) return

    try {
      const res = await deleteUserAction(userId)
      if (res.success) {
        toast.success(`User account "${email}" deleted`)
        setUsers(users.filter((u) => u.id !== userId))
        setTotal((prev) => prev - 1)
      } else {
        toast.error(res.error || 'Failed to delete user')
      }
    } catch {
      toast.error('Failed to delete user')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl premium-card">
        <div>
          <h1 className="text-base font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> User Directory ({total} Registered Accounts)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Oversee candidate profiles, assign custom plans, grant AI generation credits, and manage billing
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl premium-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by candidate name or email address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              handleFilter(e.target.value, selectedPlanSlug)
            }}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
          />
        </div>

        <select
          value={selectedPlanSlug}
          onChange={(e) => {
            setSelectedPlanSlug(e.target.value)
            handleFilter(search, e.target.value)
          }}
          className="px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary w-full sm:w-auto"
        >
          <option value="all">All Plans</option>
          {availablePlans.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Candidate User</th>
                <th className="px-5 py-3.5">Current Plan</th>
                <th className="px-5 py-3.5">Resumes Built</th>
                <th className="px-5 py-3.5">AI Chats</th>
                <th className="px-5 py-3.5">Joined Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    No users match your criteria
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const activePlan = u.subscriptions?.[0]?.planPackage

                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-brand-sm">
                            {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground text-sm block">
                              {u.name || 'Candidate User'}
                            </span>
                            <span className="text-[11px] text-muted-foreground">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Badge variant={activePlan ? 'default' : 'secondary'}>
                          {activePlan?.name || 'Free Tier'}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 font-semibold text-foreground">
                        {u._count?.resumes || 0}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {u._count?.chats || 0}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground text-[11px]">
                        {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openUserDetails(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border text-[11px] font-semibold cursor-pointer transition-colors"
                          >
                            Details
                          </button>

                          <button
                            type="button"
                            onClick={() => openPlanOverride(u)}
                            className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[11px] font-semibold cursor-pointer transition-colors"
                          >
                            Set Plan
                          </button>

                          <button
                            type="button"
                            onClick={() => openGrantLimits(u)}
                            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-amber-500 border border-border text-xs cursor-pointer transition-colors"
                            title="Grant Custom Quota"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 text-xs cursor-pointer transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER DETAILS DRAWER / MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-6 my-8 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center font-bold text-white shadow-brand-sm">
                  {selectedUser.name ? selectedUser.name.charAt(0) : 'U'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {selectedUser.name || 'Candidate User'}
                  </h3>
                  <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-muted-foreground block mb-1">Profile Completion</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedUser.profile?.completionScore || 0}% Completed
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-muted-foreground block mb-1">Active Plan</span>
                <span className="text-sm font-bold text-primary">
                  {selectedUser.subscriptions?.[0]?.planPackage?.name || 'Free Tier'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-muted-foreground block mb-1">Total Resumes</span>
                <span className="text-sm font-bold text-foreground">
                  {selectedUser.resumes?.length || 0} Versions
                </span>
              </div>
            </div>

            {/* Resumes List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Candidate Resumes ({selectedUser.resumes?.length || 0})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedUser.resumes?.map((res: any) => (
                  <div
                    key={res.id}
                    className="p-3 rounded-xl bg-muted/30 border border-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground">{res.title || 'Untitled'}</span>
                      <Badge variant="secondary" className="ml-2 font-mono text-[10px]">
                        {res.template}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">
                      Score: {res.atsScore ? `${res.atsScore}/100` : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Billing & Transaction History
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {selectedUser.payments?.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No billing transactions recorded</p>
                ) : (
                  selectedUser.payments?.map((txn: any) => (
                    <div
                      key={txn.id}
                      className="p-2.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-foreground">{txn.transactionId}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">${txn.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERRIDE PLAN MODAL */}
      {isPlanModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 my-8 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Assign Plan to {targetUser.name || targetUser.email}
              </h3>
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlanOverride} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1.5">
                  Select Subscription Plan Tier
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                >
                  {availablePlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.priceMonthly}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={planLoading}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2 shadow-brand-sm hover:opacity-90 cursor-pointer disabled:opacity-60 transition-all"
                >
                  {planLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Assign Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRANT CUSTOM LIMITS MODAL */}
      {isLimitsModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 my-8 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Grant Custom Quota to {targetUser.name || targetUser.email}
              </h3>
              <button
                type="button"
                onClick={() => setIsLimitsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomLimits} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Custom Max Resumes (-1 for unlimited)
                </label>
                <input
                  type="number"
                  required
                  value={customResumes}
                  onChange={(e) => setCustomResumes(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Custom AI Generations Quota / mo (-1 for unlimited)
                </label>
                <input
                  type="number"
                  required
                  value={customAiGenerations}
                  onChange={(e) => setCustomAiGenerations(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLimitsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={limitsLoading}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2 shadow-brand-sm hover:opacity-90 cursor-pointer disabled:opacity-60 transition-all"
                >
                  {limitsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Quotas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
