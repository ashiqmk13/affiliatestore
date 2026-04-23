'use client'
// src/components/dashboard/AnalyticsClient.tsx
import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart2, Eye, Users, MousePointerClick, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsRow { date: string; pageViews: number; visitors: number; clicks: number }
interface TopProduct { id: string; name: string; clickCount: number; imageUrls: string[]; affiliateUrl: string | null }

const CHART_METRICS = [
  { key: 'pageViews', label: 'Page Views', color: '#22c55e', icon: Eye },
  { key: 'visitors', label: 'Visitors', color: '#3b82f6', icon: Users },
  { key: 'clicks', label: 'Clicks', color: '#f59e0b', icon: MousePointerClick },
] as const

export default function AnalyticsClient({ analytics, topProducts }: { analytics: AnalyticsRow[]; topProducts: TopProduct[] }) {
  const [metric, setMetric] = useState<'pageViews' | 'visitors' | 'clicks'>('pageViews')

  const totals = analytics.reduce(
    (acc, a) => ({ views: acc.views + a.pageViews, visitors: acc.visitors + a.visitors, clicks: acc.clicks + a.clicks }),
    { views: 0, visitors: 0, clicks: 0 }
  )

  const chartData = analytics.map(a => ({
    date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    pageViews: a.pageViews,
    visitors: a.visitors,
    clicks: a.clicks,
  }))

  const activeMetric = CHART_METRICS.find(m => m.key === metric)!
  const maxClicks = Math.max(...topProducts.map(p => p.clickCount), 1)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-700 text-white mb-1">Analytics</h1>
        <p className="text-white/40 text-sm">Last 30 days performance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Page Views', value: totals.views, icon: Eye, color: 'text-brand-400' },
          { label: 'Visitors', value: totals.visitors, icon: Users, color: 'text-blue-400' },
          { label: 'Product Clicks', value: totals.clicks, icon: MousePointerClick, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl border border-white/8 p-5">
            <div className="flex items-center gap-2 mb-3">
              <s.icon className={cn('w-4 h-4', s.color)} />
              <p className="text-xs text-white/40 font-medium">{s.label}</p>
            </div>
            <p className="font-display text-3xl font-700 text-white">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass rounded-2xl border border-white/8 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-700 text-white text-lg">Trend</h2>
          <div className="flex gap-1">
            {CHART_METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  metric === m.key ? 'text-white border' : 'text-white/40 hover:text-white/70'
                )}
                style={metric === m.key ? { background: `${m.color}20`, borderColor: `${m.color}40`, color: m.color } : {}}
              >
                <m.icon className="w-3 h-3" />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeMetric.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={activeMetric.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="date" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#ffffff80' }}
                itemStyle={{ color: activeMetric.color }}
              />
              <Area type="monotone" dataKey={metric} stroke={activeMetric.color} strokeWidth={2} fill="url(#colorGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart2 className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No data yet. Analytics will appear once your store gets visitors.</p>
            </div>
          </div>
        )}
      </div>

      {/* Top products */}
      {topProducts.length > 0 && (
        <div className="glass rounded-2xl border border-white/8 p-6">
          <h2 className="font-display font-700 text-white text-lg mb-5">Top Products by Clicks</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4">
                <span className="text-xs text-white/20 w-5 text-right font-mono">{i + 1}</span>
                <div className="w-8 h-8 rounded-lg bg-white/5 shrink-0 overflow-hidden">
                  {p.imageUrls[0] && <img src={p.imageUrls[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">{p.name}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${(p.clickCount / maxClicks) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-mono text-white/50 shrink-0">{p.clickCount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
