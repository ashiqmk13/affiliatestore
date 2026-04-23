'use client'
// src/components/dashboard/BillingClient.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, CheckCircle2, AlertTriangle, Clock, Loader2, ExternalLink, Zap } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

interface SubData {
  status: string
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  canceledAt: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; desc: string }> = {
  TRIAL:    { label: 'Free Trial',    color: 'text-brand-400 bg-brand-900/30 border-brand-700/30', icon: Clock,         desc: 'Enjoying your free trial period.' },
  ACTIVE:   { label: 'Active',        color: 'text-emerald-400 bg-emerald-900/30 border-emerald-700/30', icon: CheckCircle2, desc: 'Your subscription is active.' },
  PAST_DUE: { label: 'Past Due',      color: 'text-amber-400 bg-amber-900/30 border-amber-700/30', icon: AlertTriangle,  desc: 'Payment failed. Update your payment method.' },
  CANCELED: { label: 'Canceled',      color: 'text-red-400 bg-red-900/30 border-red-700/30',     icon: AlertTriangle,  desc: 'Your subscription has been canceled.' },
  EXPIRED:  { label: 'Expired',       color: 'text-red-400 bg-red-900/30 border-red-700/30',     icon: AlertTriangle,  desc: 'Your trial or subscription has expired.' },
}

const FEATURES = [
  'Unlimited products',
  'Custom domain support',
  'Built-in analytics',
  'Product auto-import',
  'SEO tools',
  'Email support',
  'SSL certificate',
  'Cancel anytime',
]

export default function BillingClient({ subscription }: { subscription: SubData | null }) {
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [error, setError] = useState('')

  const status = subscription?.status || 'TRIAL'
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.TRIAL
  const StatusIcon = config.icon

  const trialDaysLeft = subscription?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86400000))
    : 30

  async function handleSubscribe() {
    setLoadingCheckout(true)
    setError('')
    try {
      const res = await fetch('/api/billing/checkout', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create checkout'); return }
      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoadingCheckout(false)
    }
  }

  async function handlePortal() {
    setLoadingPortal(true)
    setError('')
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to open portal'); return }
      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoadingPortal(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-700 text-white mb-1">Billing</h1>
        <p className="text-white/40 text-sm">Manage your subscription and payment details</p>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-800/40 text-red-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Status card */}
      <div className="glass rounded-2xl border border-white/8 p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-white/40 mb-2 uppercase tracking-widest">Current Plan</p>
            <div className="flex items-center gap-3">
              <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border', config.color)}>
                <StatusIcon className="w-3 h-3" />
                {config.label}
              </span>
            </div>
            <p className="text-white/50 text-sm mt-2">{config.desc}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display text-4xl font-700 text-white">
              {status === 'TRIAL' ? 'Free' : '$13'}
            </p>
            <p className="text-white/30 text-sm">{status === 'TRIAL' ? 'trial period' : '/month'}</p>
          </div>
        </div>

        {/* Trial countdown */}
        {status === 'TRIAL' && subscription?.trialEndsAt && (
          <div className="mb-5 p-4 rounded-xl bg-brand-950/30 border border-brand-700/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-brand-300 font-medium">Trial Period</p>
              <p className="text-sm font-mono text-brand-400">{trialDaysLeft} days left</p>
            </div>
            <div className="h-2 rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all"
                style={{ width: `${Math.max(5, (trialDaysLeft / 30) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-white/30 mt-2">
              Trial ends {formatDate(subscription.trialEndsAt)}. Subscribe to keep your store live.
            </p>
          </div>
        )}

        {/* Active subscription info */}
        {status === 'ACTIVE' && subscription?.currentPeriodEnd && (
          <div className="mb-5 p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <p className="text-sm text-white/50">
              Next billing date: <span className="text-white">{formatDate(subscription.currentPeriodEnd)}</span>
            </p>
            {subscription.canceledAt && (
              <p className="text-sm text-amber-400 mt-1">
                ⚠ Scheduled to cancel on {formatDate(subscription.currentPeriodEnd)}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {(status === 'TRIAL' || status === 'EXPIRED' || status === 'CANCELED') && (
            <button
              onClick={handleSubscribe}
              disabled={loadingCheckout}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              {loadingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Subscribe for $13/month
            </button>
          )}

          {subscription?.stripeCustomerId && (
            <button
              onClick={handlePortal}
              disabled={loadingPortal}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all border border-white/8"
            >
              {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Manage in Stripe Portal
            </button>
          )}
        </div>
      </div>

      {/* What's included */}
      <div className="glass rounded-2xl border border-white/8 p-6">
        <h2 className="font-display font-700 text-white text-lg mb-4">What's included</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {FEATURES.map(f => (
            <div key={f} className="flex items-center gap-3 text-sm text-white/60">
              <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Invoice note */}
      <p className="text-xs text-white/25 text-center">
        Payments are processed securely by Stripe. We never store your card details.
        {subscription?.stripeCustomerId && ' View invoices and update payment methods in the Stripe portal.'}
      </p>
    </div>
  )
}
