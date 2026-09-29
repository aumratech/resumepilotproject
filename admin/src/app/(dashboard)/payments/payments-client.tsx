'use client'

import { useState } from 'react'
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Layers,
  Loader2,
} from 'lucide-react'
import {
  getPaymentsAction,
  createManualTransactionAction,
  updatePaymentStatusAction,
} from '@/server/actions/payment.actions'
import { PaymentStatus } from '@prisma/client'
import { formatDistanceToNow, format } from 'date-fns'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export function PaymentsClient({
  initialTransactions,
  totalCount,
  stats,
  plans,
  usersList,
}: {
  initialTransactions: any[]
  totalCount: number
  stats: any
  plans: any[]
  usersList: any[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'ledger' | 'plan_wise'>('ledger')
  const [transactions, setTransactions] = useState(initialTransactions)
  const [total, setTotal] = useState(totalCount)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  // Manual payment modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [formData, setFormData] = useState({
    userId: usersList[0]?.id || '',
    planPackageId: plans[0]?.id || '',
    amount: plans[0]?.priceMonthly || 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    status: PaymentStatus.COMPLETED,
    notes: 'Admin manual transaction record',
  })

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val)
  }

  const handleFilter = async (query = searchQuery, plan = selectedPlan, st = selectedStatus) => {
    setLoading(true)
    try {
      const res = await getPaymentsAction({
        query: query || undefined,
        planId: plan !== 'all' ? plan : undefined,
        status: st !== 'all' ? (st as PaymentStatus) : undefined,
      })
      if (res.success && res.data) {
        setTransactions(res.data)
        setTotal(res.pagination?.total ?? 0)
      }
    } catch {
      toast.error('Failed to filter transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalLoading(true)

    try {
      const res = await createManualTransactionAction(formData)
      if (res.success) {
        toast.success('Manual payment recorded successfully')
        setIsModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to record transaction')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setModalLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: PaymentStatus) => {
    try {
      const res = await updatePaymentStatusAction(id, newStatus)
      if (res.success) {
        toast.success(`Transaction status updated to ${newStatus}`)
        setTransactions(
          transactions.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        )
      } else {
        toast.error(res.error || 'Failed to update status')
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  const exportCSV = () => {
    const headers = ['Transaction ID', 'Customer Name', 'Customer Email', 'Plan', 'Amount', 'Currency', 'Status', 'Date']
    const rows = transactions.map((t) => [
      t.transactionId,
      `"${t.user?.name || t.customerName || ''}"`,
      t.user?.email || t.customerEmail || '',
      t.planPackage?.name || 'Pro',
      t.amount,
      t.currency,
      t.status,
      format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `resumeai_payments_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Payment CSV exported')
  }

  return (
    <div className="space-y-6">
      {/* Top Revenue KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="premium-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Total Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-foreground">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <span className="text-[11px] text-muted-foreground">All-time processed revenue</span>
        </div>

        <div className="premium-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Estimated MRR</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-foreground">
            {formatCurrency(stats.mrr)}
          </div>
          <span className="text-[11px] text-muted-foreground">Monthly recurring run-rate</span>
        </div>

        <div className="premium-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Transactions Count</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-foreground">
            {stats.totalTransactions.toLocaleString()}
          </div>
          <span className="text-[11px] text-muted-foreground">Logged payment events</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            User Transactions Ledger ({total})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plan_wise')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'plan_wise'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Layers className="w-4 h-4" />
            Plan-Wise Breakdown ({stats.planBreakdown.length} Plans)
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-background hover:bg-muted text-foreground border border-border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-primary" /> Export CSV
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-brand-sm hover:opacity-90 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Record Manual Payment
          </button>
        </div>
      </div>

      {/* ================= PLAN-WISE BREAKDOWN TAB ================= */}
      {activeTab === 'plan_wise' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stats.planBreakdown.map((plan: any) => (
            <div
              key={plan.id}
              className="premium-card p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-foreground">{plan.name}</span>
                <Badge variant="secondary" className="font-mono">
                  ${plan.priceMonthly}/mo
                </Badge>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total Collected:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatCurrency(plan.totalRevenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Active Subscribers:</span>
                  <span className="font-bold text-foreground">{plan.activeSubscribers}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Completed Payments:</span>
                  <span className="font-bold text-foreground">{plan.totalTransactions}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPlan(plan.id)
                  setActiveTab('ledger')
                  handleFilter(searchQuery, plan.id, selectedStatus)
                }}
                className="w-full py-2 rounded-xl bg-muted hover:bg-muted/80 text-primary text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                View Plan Transactions <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================= USER TRANSACTIONS LEDGER TAB ================= */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl premium-card flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by transaction ID, user email, customer name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleFilter(e.target.value, selectedPlan, selectedStatus)
                }}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={selectedPlan}
                onChange={(e) => {
                  setSelectedPlan(e.target.value)
                  handleFilter(searchQuery, e.target.value, selectedStatus)
                }}
                className="px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
              >
                <option value="all">All Plans</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value)
                  handleFilter(searchQuery, selectedPlan, e.target.value)
                }}
                className="px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
              >
                <option value="all">All Statuses</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Customer & User</th>
                    <th className="px-5 py-3.5">Transaction ID</th>
                    <th className="px-5 py-3.5">Plan Tier</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div>
                            <span className="font-semibold text-foreground text-sm block">
                              {txn.user?.name || txn.customerName || 'Customer'}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {txn.user?.email || txn.customerEmail}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-mono text-[11px] text-primary">
                          {txn.transactionId}
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-semibold text-foreground">
                            {txn.planPackage?.name || 'Pro Tier'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-foreground text-sm">
                            ${txn.amount.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-1 uppercase">{txn.currency}</span>
                        </td>

                        <td className="px-5 py-4">
                          <Badge
                            variant={
                              txn.status === 'COMPLETED'
                                ? 'success'
                                : txn.status === 'PENDING'
                                ? 'warning'
                                : txn.status === 'REFUNDED'
                                ? 'purple'
                                : 'destructive'
                            }
                          >
                            {txn.status}
                          </Badge>
                        </td>

                        <td className="px-5 py-4 text-muted-foreground text-[11px]">
                          {format(new Date(txn.createdAt), 'MMM d, yyyy HH:mm')}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {txn.status === 'COMPLETED' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(txn.id, PaymentStatus.REFUNDED)}
                                className="px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border text-[10px] font-semibold cursor-pointer transition-colors"
                              >
                                Mark Refunded
                              </button>
                            )}
                            {txn.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(txn.id, PaymentStatus.COMPLETED)}
                                className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold cursor-pointer transition-colors"
                              >
                                Mark Completed
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RECORD MANUAL PAYMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 my-8 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                Record Manual Payment / Offline Invoicing
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Select Candidate User</label>
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                >
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || 'User'} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Plan Package</label>
                <select
                  required
                  value={formData.planPackageId}
                  onChange={(e) => {
                    const sel = plans.find((p) => p.id === e.target.value)
                    setFormData({
                      ...formData,
                      planPackageId: e.target.value,
                      amount: sel ? sel.priceMonthly : formData.amount,
                    })
                  }}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.priceMonthly}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Billing Cycle</label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-time">One-Time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Notes / Invoice Reference</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:border-primary focus:outline-none"
                />
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
                  <span>Save Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
