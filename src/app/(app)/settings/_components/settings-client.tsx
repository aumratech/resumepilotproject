'use client'

import { useState } from 'react'
import {
  User,
  Palette,
  Bell,
  FileText,
  Shield,
  Trash2,
  Lock,
  Download,
  Check,
  Loader2,
  Moon,
  Sun,
  Laptop,
  LogOut,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import {
  updateAccountInfoAction,
  changePasswordAction,
  clearChatHistoryAction,
  deleteAccountAction,
  exportUserDataAction,
} from '@/server/actions/settings.actions'

interface SettingsClientProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
  }
}

export function SettingsClient({ user }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'notifications' | 'defaults' | 'privacy' | 'danger'>('account')
  const { theme, setTheme } = useTheme()

  // Account state
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email || '')
  const [isSavingAccount, setIsSavingAccount] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Notifications state
  const [notifications, setNotifications] = useState({
    aiUpdates: true,
    emailDigests: false,
    securityAlerts: true,
  })

  // Resume Defaults state
  const [defaultTemplate, setDefaultTemplate] = useState('modern')
  const [defaultColor, setDefaultColor] = useState('#3b82f6')

  // Modals / Loading
  const [isExporting, setIsExporting] = useState(false)
  const [isClearingChats, setIsClearingChats] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  async function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault()
    setIsSavingAccount(true)
    try {
      await updateAccountInfoAction({ name, email })
      toast.success('Account details updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update account')
    } finally {
      setIsSavingAccount(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setIsSavingPassword(true)
    try {
      await changePasswordAction({ currentPassword, newPassword })
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password')
    } finally {
      setIsSavingPassword(false)
    }
  }

  async function handleExportData() {
    setIsExporting(true)
    try {
      const dataStr = await exportUserDataAction()
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resumeai-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Account data exported successfully!')
    } catch (err: any) {
      toast.error('Failed to export account data')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleClearChats() {
    if (!confirm('Are you sure you want to delete all AI chat conversations?')) return
    setIsClearingChats(true)
    try {
      await clearChatHistoryAction()
      toast.success('Chat history cleared!')
    } catch (err: any) {
      toast.error('Failed to clear chat history')
    } finally {
      setIsClearingChats(false)
    }
  }

  async function handleDeleteAccount() {
    setIsDeletingAccount(true)
    try {
      await deleteAccountAction()
      toast.success('Account deleted')
      signOut({ callbackUrl: '/login' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account')
      setIsDeletingAccount(false)
    }
  }

  interface TabItem {
    id: 'account' | 'appearance' | 'notifications' | 'defaults' | 'privacy' | 'danger'
    label: string
    icon: typeof User
    danger?: boolean
  }

  const tabs: TabItem[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'defaults', label: 'Resume Defaults', icon: FileText },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: Trash2, danger: true },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-display text-3xl text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account details, preferences, and security options.
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === tab.id
                  ? tab.danger
                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                    : 'bg-primary text-primary-foreground shadow-sm'
                  : tab.danger
                  ? 'text-destructive hover:bg-destructive/10'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 premium-card p-6 border border-border bg-card rounded-2xl shadow-sm space-y-6">
          {/* TAB 1: ACCOUNT */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-foreground">Account Information</h2>
                <p className="text-xs text-muted-foreground">Update your personal profile details</p>
              </div>

              <form onSubmit={handleSaveAccount} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingAccount}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isSavingAccount ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Save Account Details</span>
                </button>
              </form>

              <hr className="border-border" />

              <div>
                <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                  <Lock size={15} /> Change Password
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Ensure your account uses a strong password</p>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="flex items-center gap-2 rounded-xl bg-secondary text-secondary-foreground border border-border px-5 py-2.5 text-xs font-semibold hover:bg-accent transition-all disabled:opacity-50"
                  >
                    {isSavingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                    <span>Update Password</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-foreground">Theme & Display</h2>
                <p className="text-xs text-muted-foreground">Customize how ResumeAI looks on your screen</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Laptop },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                      theme === t.id
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <t.icon size={22} className="mb-2" />
                    <span className="text-xs">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-foreground">Notification Preferences</h2>
                <p className="text-xs text-muted-foreground">Choose what updates and alerts you receive</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: 'aiUpdates',
                    title: 'AI Resume Optimization Tips',
                    desc: 'Receive AI recommendations to improve your ATS score',
                  },
                  {
                    key: 'emailDigests',
                    title: 'Weekly Performance Digest',
                    desc: 'Get weekly updates on resume views and job matches',
                  },
                  {
                    key: 'securityAlerts',
                    title: 'Account & Security Alerts',
                    desc: 'Important notifications about logins and account changes',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-background"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        const k = item.key as keyof typeof notifications
                        setNotifications((prev) => ({ ...prev, [k]: !prev[k] }))
                        toast.success('Notification preferences updated')
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                        notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RESUME DEFAULTS */}
          {activeTab === 'defaults' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-foreground">Resume Builder Defaults</h2>
                <p className="text-xs text-muted-foreground">Set default layout template and colors</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">Default Template</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'modern', name: 'Modern Clean' },
                    { id: 'executive', name: 'Executive Suite' },
                    { id: 'minimal', name: 'Minimalist Tech' },
                    { id: 'creative', name: 'Creative Portfolio' },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        setDefaultTemplate(tpl.id)
                        toast.success(`Default template set to ${tpl.name}`)
                      }}
                      className={`p-3.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        defaultTemplate === tpl.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-foreground hover:border-primary/30'
                      }`}
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">Default Accent Color</label>
                <div className="flex gap-3">
                  {[
                    { hex: '#3b82f6', name: 'Blue' },
                    { hex: '#10b981', name: 'Emerald' },
                    { hex: '#8b5cf6', name: 'Purple' },
                    { hex: '#f43f5e', name: 'Rose' },
                    { hex: '#475569', name: 'Slate' },
                  ].map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => {
                        setDefaultColor(color.hex)
                        toast.success(`Default accent color set to ${color.name}`)
                      }}
                      style={{ backgroundColor: color.hex }}
                      className={`h-9 w-9 rounded-xl transition-all flex items-center justify-center ${
                        defaultColor === color.hex ? 'ring-4 ring-primary/30 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {defaultColor === color.hex && <Check size={16} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRIVACY & DATA */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-foreground">Privacy & Data Management</h2>
                <p className="text-xs text-muted-foreground">Export your data or clear activity history</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">Export Account Data</p>
                    <p className="text-xs text-muted-foreground">Download a complete JSON export of your profile, resumes, and chats</p>
                  </div>
                  <button
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-all disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    <span>Export JSON</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">Clear AI Chat History</p>
                    <p className="text-xs text-muted-foreground">Delete all previous AI chat sessions and messages</p>
                  </div>
                  <button
                    onClick={handleClearChats}
                    disabled={isClearingChats}
                    className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all disabled:opacity-50"
                  >
                    {isClearingChats ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    <span>Clear Chats</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DANGER ZONE */}
          {activeTab === 'danger' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <h2 className="text-base font-bold text-destructive">Danger Zone</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Actions here are irreversible. Deleting your account will remove all your saved profile details, generated resumes, and chat logs permanently.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-destructive/30 bg-background space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Delete Account</h3>
                  <p className="text-xs text-muted-foreground">Once deleted, your data cannot be recovered.</p>
                </div>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-all shadow-sm"
                >
                  <Trash2 size={15} />
                  <span>Delete My Account Permanently</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <h3 className="text-lg font-bold text-destructive">Confirm Account Deletion</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you completely sure you want to delete your account? This action cannot be undone. All your resumes, profile info, and chat records will be permanently erased.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-all disabled:opacity-50"
              >
                {isDeletingAccount ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>Yes, Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
