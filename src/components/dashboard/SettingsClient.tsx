'use client'
// src/components/dashboard/SettingsClient.tsx
import { useState } from 'react'
import { User, Lock, Loader2, Save, ShieldCheck, LogOut } from 'lucide-react'
import { cn, getInitials, formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface UserData { id: string; name: string; email: string; role: string }

const inputCls = 'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-brand-600/60 transition-all disabled:opacity-50'

export default function SettingsClient({ user }: { user: UserData }) {
  const router = useRouter()
  const [tab, setTab] = useState<'profile' | 'security'>('profile')
  const [name, setName] = useState(user.name)
  const [savingProfile, setSavingProfile] = useState(false)
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null)

  function showToast(msg: string, err = false) {
    setToast({ msg, err })
    setTimeout(() => setToast(null), 3500)
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch('/api/dashboard/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Failed', true); return }
      showToast('Profile updated')
    } finally { setSavingProfile(false) }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pw.newPw !== pw.confirm) { showToast('Passwords do not match', true); return }
    if (pw.newPw.length < 8) { showToast('Password must be at least 8 characters', true); return }
    setSavingPw(true)
    try {
      const res = await fetch('/api/dashboard/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'password', currentPassword: pw.current, newPassword: pw.newPw }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Failed', true); return }
      showToast('Password changed. Please log in again.')
      setTimeout(() => router.push('/auth/login'), 2000)
    } finally { setSavingPw(false) }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {toast && (
        <div className={cn('fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl',
          toast.err ? 'bg-red-950 border border-red-800 text-red-300' : 'bg-brand-900 border border-brand-700 text-brand-300'
        )}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="font-display text-2xl font-700 text-white mb-1">Account Settings</h1>
        <p className="text-white/40 text-sm">Manage your profile and security</p>
      </div>

      {/* Avatar card */}
      <div className="glass rounded-2xl border border-white/8 p-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-brand-700 flex items-center justify-center text-xl font-700 text-white shrink-0">
          {getInitials(user.name || user.email)}
        </div>
        <div>
          <p className="font-medium text-white">{user.name || 'No name set'}</p>
          <p className="text-sm text-white/40">{user.email}</p>
          {user.role === 'ADMIN' && (
            <span className="inline-flex items-center gap-1 mt-1 text-xs bg-amber-900/30 border border-amber-700/30 text-amber-400 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> Admin
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
        {[{ id: 'profile', label: 'Profile', icon: User }, { id: 'security', label: 'Security', icon: Lock }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.id ? 'bg-brand-900/50 text-brand-300 border border-brand-700/40' : 'text-white/40 hover:text-white/70'
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="glass rounded-2xl border border-white/8 p-6 space-y-4">
          <h2 className="font-display font-700 text-white text-lg">Profile Information</h2>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block font-medium">Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block font-medium">Email Address</label>
            <input value={user.email} disabled className={inputCls} />
            <p className="text-xs text-white/25 mt-1">Email cannot be changed from here.</p>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingProfile} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile
            </button>
          </div>
        </form>
      )}

      {tab === 'security' && (
        <form onSubmit={savePassword} className="glass rounded-2xl border border-white/8 p-6 space-y-4">
          <h2 className="font-display font-700 text-white text-lg">Change Password</h2>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block font-medium">Current Password</label>
            <input type="password" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} placeholder="••••••••" className={inputCls} required />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block font-medium">New Password</label>
            <input type="password" value={pw.newPw} onChange={e => setPw(p => ({ ...p, newPw: e.target.value }))} placeholder="Min 8 characters" className={inputCls} required minLength={8} />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block font-medium">Confirm New Password</label>
            <input type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" className={inputCls} required />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingPw} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
              {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Update Password
            </button>
          </div>
        </form>
      )}

      {/* Danger zone */}
      <div className="glass rounded-2xl border border-white/8 p-5">
        <h3 className="font-medium text-white/60 text-sm mb-4">Session</h3>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-400/70 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out of all devices
        </button>
      </div>
    </div>
  )
}
