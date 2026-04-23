'use client'
// src/components/dashboard/Overview.tsx
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Store, Package, Eye, MousePointerClick, Users, ArrowRight, AlertCircle, ExternalLink, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Props {
  user: { name?: string | null; email: string }
  store: {
    id: string; name: string; slug: string; isPublished: boolean
    productCount: number; storeUrl: string; createdAt: string
  } | null
  subscription: { status: string; trialDaysLeft: number; currentPeriodEnd?: string }
  stats: { totalViews: number; totalClicks: number; totalVisitors: number }
  analyticsData: { date: string; pageViews: number; clicks: number; visitors: number }[]
}

const FadeUp = ({ children, delay = 0, className = '' }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
)

export default function DashboardOverview({ user, store, subscription, stats, analyticsData }: Props) {
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const statCards = [
    { label: 'Page Views', value: stats.totalViews, icon: Eye, suffix: '7d' },
    { label: 'Unique Visitors', value: stats.totalVisitors, icon: Users, suffix: '7d' },
    { label: 'Product Clicks', value: stats.totalClicks, icon: MousePointerClick, suffix: '7d' },
    { label: 'Products', value: store?.productCount ?? 0, icon: Package, suffix: 'total' },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <FadeUp>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/40 text-sm">{greeting()},</p>
            <h2 className="font-display text-2xl font-700 text-white mt-0.5">{user.name || user.email.split('@')[0]} 👋</h2>
          </div>
          {store && (
            <a href={store.storeUrl} target="_blank" rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 text-sm border border-white/10 hover:border-brand-700/50 text-white/60 hover:text-brand-300 px-4 py-2 rounded-xl transition-all">
              <ExternalLink className="w-3.5 h-3.5" /> View Live Store
            </a>
          )}
        </div>
      </FadeUp>

      {/* Trial banner */}
      {subscription.status === 'TRIAL' && subscription.trialDaysLeft <= 7 && (
        <FadeUp delay={0.05}>
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl px-5 py-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
            <div className="flex-1">
              <p className="text-yellow-300 text-sm font-medium">
                {subscription.trialDaysLeft === 0
                  ? 'Your trial has ended'
                  : `Trial ends in ${subscription.trialDaysLeft} day${subscription.trialDaysLeft !== 1 ? 's' : ''}`}
              </p>
              <p className="text-yellow-400/60 text-xs mt-0.5">Upgrade to keep your store live and all features active.</p>
            </div>
            <Link href="/dashboard/billing" className="shrink-0 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
              Upgrade now
            </Link>
          </div>
        </FadeUp>
      )}

      {/* No store prompt */}
      {!store && (
        <FadeUp delay={0.1}>
          <div className="glass rounded-2xl border border-white/8 p-10 text-center">
            <div className="w-14 h-14 bg-brand-900/40 rounded-2xl border border-brand-700/30 flex items-center justify-center mx-auto mb-4">
              <Store className="w-7 h-7 text-brand-400" />
            </div>
            <h3 className="font-display text-xl font-700 text-white mb-2">Set up your store</h3>
            <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">You haven't created a store yet. It only takes a minute — pick a name and start adding products.</p>
            <Link href="/dashboard/store" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all">
              <Plus className="w-4 h-4" /> Create my store
            </Link>
          </div>
        </FadeUp>
      )}

      {/* Stat cards */}
      {store && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s, i) => (
              <FadeUp key={s.label} delay={0.05 + i * 0.05}>
                <div className="glass rounded-2xl border border-white/8 p-5 card-hover">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white/40 text-xs font-medium">{s.label}</p>
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                      <s.icon className="w-3.5 h-3.5 text-white/40" />
                    </div>
                  </div>
                  <p className="font-display text-3xl font-800 text-white">{s.value.toLocaleString()}</p>
                  <p className="text-white/30 text-xs mt-1">{s.suffix}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Chart */}
          <FadeUp delay={0.25}>
            <div className="glass rounded-2xl border border-white/8 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-700 text-white">Traffic Overview</h3>
                <span className="text-xs text-white/30 bg-white/5 px-2.5 py-1 rounded-lg">Last 7 days</span>
              </div>
              {analyticsData.length === 0 ? (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-white/25 text-sm">No data yet — your analytics will appear here once visitors arrive.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={analyticsData}>
                    <defs>
                      <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#86efac" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#86efac" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                    />
                    <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#22c55e" strokeWidth={2} fill="url(#gv)" />
                    <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#86efac" strokeWidth={2} fill="url(#gc)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </FadeUp>

          {/* Quick actions */}
          <FadeUp delay={0.3}>
            <div className="glass rounded-2xl border border-white/8 p-6">
              <h3 className="font-display font-700 text-white mb-4">Quick Actions</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: 'Add Product', desc: 'Paste link or add manually', href: '/dashboard/products/new', icon: Package },
                  { label: 'Customize Store', desc: 'Theme, layout, branding', href: '/dashboard/store', icon: Store },
                  { label: 'Connect Domain', desc: 'Use your own domain', href: '/dashboard/domain', icon: ExternalLink },
                ].map(a => (
                  <Link key={a.label} href={a.href}
                    className="group flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-brand-700/40 hover:bg-brand-950/20 transition-all">
                    <div className="w-9 h-9 rounded-lg bg-white/5 group-hover:bg-brand-900/40 flex items-center justify-center transition-colors">
                      <a.icon className="w-4 h-4 text-white/40 group-hover:text-brand-400 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{a.label}</p>
                      <p className="text-xs text-white/30">{a.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-brand-400 ml-auto transition-all group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          </FadeUp>
        </>
      )}
    </div>
  )
}
