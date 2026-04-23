'use client'
// src/components/admin/AdminUsersClient.tsx
import { useState } from 'react'
import { Search, Shield, ShieldOff, Trash2, Clock, ChevronDown, ExternalLink, Loader2 } from 'lucide-react'
import { cn, formatDate, getInitials } from '@/lib/utils'

interface User {
  id: string; name: string | null; email: string; role: string
  createdAt: string; emailVerified: string | null
  store: { name: string; slug: string; isPublished: boolean } | null
  subscription: { status: string; trialEndsAt: string | null; currentPeriodEnd: string | null } | null
}

const STATUS_COLORS: Record<string, string> = {
  TRIAL: 'text-brand-400 bg-brand-900/30',
  ACTIVE: 'text-emerald-400 bg-emerald-900/30',
  PAST_DUE: 'text-amber-400 bg-amber-900/30',
  CANCELED: 'text-red-400 bg-red-900/30',
  EXPIRED: 'text-red-400 bg-red-900/30',
}

export default function AdminUsersClient({ users: initialUsers, total, currentUserId }: { users: User[]; total: number; currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers)
  const [q, setQ] = useState('')
  const [searching, setSearching] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function search(query: string) {
    setSearching(true)
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setUsers(data.users)
    } finally { setSearching(false) }
  }

  async function doAction(userId: string, action: string) {
    if (action === 'delete' && !confirm('Permanently delete this user and all their data?')) return
    setActionLoading(`${userId}-${action}`)
    setOpenMenu(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Action failed'); return }

      if (action === 'delete') {
        setUsers(u => u.filter(x => x.id !== userId))
        showToast('User deleted')
      } else if (action === 'promote') {
        setUsers(u => u.map(x => x.id === userId ? { ...x, role: 'ADMIN' } : x))
        showToast('User promoted to admin')
      } else if (action === 'demote') {
        setUsers(u => u.map(x => x.id === userId ? { ...x, role: 'USER' } : x))
        showToast('User demoted to regular user')
      } else if (action === 'extend_trial') {
        showToast('Trial extended by 30 days')
      }
    } finally { setActionLoading(null) }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-brand-900 border border-brand-700 text-brand-300 px-4 py-3 rounded-xl text-sm font-medium shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-700 text-white mb-1">Users</h1>
          <p className="text-white/40 text-sm">{total.toLocaleString()} total users</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-800/40 text-red-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={q}
          onChange={e => { setQ(e.target.value); search(e.target.value) }}
          placeholder="Search by name or email…"
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-brand-600/60 transition-all"
        />
        {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 animate-spin" />}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-white/30 font-medium px-5 py-3.5 uppercase tracking-wider">User</th>
                <th className="text-left text-xs text-white/30 font-medium px-4 py-3.5 uppercase tracking-wider">Store</th>
                <th className="text-left text-xs text-white/30 font-medium px-4 py-3.5 uppercase tracking-wider">Subscription</th>
                <th className="text-left text-xs text-white/30 font-medium px-4 py-3.5 uppercase tracking-wider">Joined</th>
                <th className="text-right text-xs text-white/30 font-medium px-5 py-3.5 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-xs font-700 text-white shrink-0">
                        {getInitials(u.name || u.email)}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{u.name || 'No name'}</p>
                        <p className="text-xs text-white/40">{u.email}</p>
                      </div>
                      {u.role === 'ADMIN' && (
                        <span className="text-xs bg-amber-900/30 border border-amber-700/30 text-amber-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" /> Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {u.store ? (
                      <div className="flex items-center gap-2">
                        <div className={cn('w-1.5 h-1.5 rounded-full', u.store.isPublished ? 'bg-brand-400' : 'bg-white/20')} />
                        <span className="text-sm text-white/60 truncate max-w-32">{u.store.name}</span>
                        <a href={`/store/${u.store.slug}`} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/60 transition-colors">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-white/20">No store</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {u.subscription ? (
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[u.subscription.status] || 'text-white/40')}>
                        {u.subscription.status}
                      </span>
                    ) : (
                      <span className="text-xs text-white/20">None</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-white/40">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-4">
                    {u.id !== currentUserId && (
                      <div className="relative flex justify-end">
                        <button
                          onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                          className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                        >
                          Actions <ChevronDown className="w-3 h-3" />
                        </button>
                        {openMenu === u.id && (
                          <div className="absolute right-0 top-8 z-20 bg-[#111] border border-white/10 rounded-xl shadow-2xl py-1 w-44" onClick={() => setOpenMenu(null)}>
                            {u.role !== 'ADMIN' ? (
                              <button onClick={() => doAction(u.id, 'promote')} className="w-full text-left px-4 py-2.5 text-sm text-amber-400 hover:bg-white/5 flex items-center gap-2 transition-colors">
                                <Shield className="w-3.5 h-3.5" /> Make Admin
                              </button>
                            ) : (
                              <button onClick={() => doAction(u.id, 'demote')} className="w-full text-left px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 flex items-center gap-2 transition-colors">
                                <ShieldOff className="w-3.5 h-3.5" /> Remove Admin
                              </button>
                            )}
                            <button onClick={() => doAction(u.id, 'extend_trial')} className="w-full text-left px-4 py-2.5 text-sm text-brand-400 hover:bg-white/5 flex items-center gap-2 transition-colors">
                              <Clock className="w-3.5 h-3.5" /> Extend Trial
                            </button>
                            <div className="border-t border-white/5 my-1" />
                            <button onClick={() => doAction(u.id, 'delete')} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/30 flex items-center gap-2 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" /> Delete User
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-white/30 text-sm">No users found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
