// src/app/admin/page.tsx
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Users, Store, Package, CreditCard, Activity, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function AdminPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') redirect('/dashboard')

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [totalUsers, totalStores, totalProducts, subCounts, newUsers, recentLogs] = await Promise.all([
    db.user.count(),
    db.store.count(),
    db.product.count(),
    db.subscription.groupBy({ by: ['status'], _count: { status: true } }),
    db.user.count({ where: { createdAt: { gte: weekAgo } } }),
    db.auditLog.findMany({
      take: 15, orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
  ])

  const subMap = subCounts.reduce((a: Record<string, number>, s: { status: string; _count: { status: number } }) => { a[s.status] = s._count.status; return a }, {})
  const activeRevenue = (subMap['ACTIVE'] || 0) * 13

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-700/20' },
    { label: 'Total Stores', value: totalStores, icon: Store, color: 'text-brand-400', bg: 'bg-brand-900/20 border-brand-700/20' },
    { label: 'Total Products', value: totalProducts, icon: Package, color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-700/20' },
    { label: 'MRR (est.)', value: `$${activeRevenue}`, icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-900/20 border-amber-700/20' },
    { label: 'Active Subs', value: subMap['ACTIVE'] || 0, icon: TrendingUp, color: 'text-brand-400', bg: 'bg-brand-900/20 border-brand-700/20' },
    { label: 'New This Week', value: newUsers, icon: Activity, color: 'text-pink-400', bg: 'bg-pink-900/20 border-pink-700/20' },
  ]

  const ACTION_LABELS: Record<string, string> = {
    LOGIN: 'Signed in',
    ADMIN_PROMOTE: 'Promoted user to admin',
    ADMIN_DEMOTE: 'Demoted admin to user',
    ADMIN_DELETE: 'Deleted user',
    ADMIN_EXTEND_TRIAL: 'Extended user trial',
    SETTINGS_UPDATE: 'Updated platform settings',
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-700 text-white mb-1">Platform Overview</h1>
        <p className="text-white/40 text-sm">Real-time metrics for Sample Website</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`glass rounded-2xl border p-5 ${s.bg}`}>
            <div className="flex items-center gap-2 mb-3">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <p className="text-xs text-white/40 font-medium">{s.label}</p>
            </div>
            <p className={`font-display text-3xl font-700 ${s.color}`}>
              {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Subscription breakdown */}
      <div className="glass rounded-2xl border border-white/8 p-6">
        <h2 className="font-display font-700 text-white text-lg mb-4">Subscription Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { status: 'TRIAL', label: 'Trial', color: 'text-brand-400' },
            { status: 'ACTIVE', label: 'Active', color: 'text-emerald-400' },
            { status: 'PAST_DUE', label: 'Past Due', color: 'text-amber-400' },
            { status: 'CANCELED', label: 'Canceled', color: 'text-red-400' },
          ].map(s => (
            <div key={s.status} className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className={`font-display text-2xl font-700 ${s.color}`}>{subMap[s.status] || 0}</p>
              <p className="text-xs text-white/40 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass rounded-2xl border border-white/8 p-6">
        <h2 className="font-display font-700 text-white text-lg mb-4">Recent Activity</h2>
        {recentLogs.length === 0 ? (
          <p className="text-white/30 text-sm">No activity yet.</p>
        ) : (
          <div className="space-y-1">
            {recentLogs.map((log: { id: string; action: string; createdAt: Date; user: { name: string | null; email: string } | null }) => (
              <div key={log.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                  <div>
                    <p className="text-sm text-white/70">
                      <span className="text-white/90 font-medium">{log.user?.name || log.user?.email || 'System'}</span>
                      {' — '}
                      {ACTION_LABELS[log.action] || log.action.toLowerCase().replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-white/25 shrink-0 ml-4">{formatDate(log.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
