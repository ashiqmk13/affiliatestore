'use client'
// src/components/dashboard/DomainClient.tsx
import { useState } from 'react'
import { Globe, CheckCircle2, Clock, XCircle, Copy, Check, Loader2, Shield, Zap, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DomainData {
  domain: string; status: string; txtRecord: string
  sslEnabled: boolean; verifiedAt: string | null
}

const STATUS_MAP: Record<string, { icon: any; color: string; label: string }> = {
  PENDING:  { icon: Clock,        color: 'text-amber-400',  label: 'Pending Verification' },
  VERIFIED: { icon: CheckCircle2, color: 'text-brand-400',  label: 'Verified' },
  FAILED:   { icon: XCircle,      color: 'text-red-400',    label: 'Verification Failed' },
}

export default function DomainClient({
  domain: initialDomain, defaultUrl, isPremium, storeSlug
}: { domain: DomainData | null; defaultUrl: string | null; isPremium: boolean; storeSlug: string | null }) {
  const [domain, setDomain] = useState<DomainData | null>(initialDomain)
  const [newDomain, setNewDomain] = useState('')
  const [adding, setAdding] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true); setError('')
    try {
      const res = await fetch('/api/dashboard/domain', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain.toLowerCase().trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to add domain'); return }
      setDomain(data.domain); setNewDomain(''); showToast('Domain added — now add the DNS record below')
    } finally { setAdding(false) }
  }

  async function handleVerify() {
    setVerifying(true); setError('')
    try {
      const res = await fetch('/api/dashboard/domain/verify', { method: 'POST' })
      const data = await res.json()
      if (data.verified) {
        setDomain(prev => prev ? { ...prev, status: 'VERIFIED', verifiedAt: new Date().toISOString() } : null)
        showToast('Domain verified successfully!')
      } else {
        setError(data.message || 'Verification failed. Check DNS settings.')
      }
    } finally { setVerifying(false) }
  }

  async function handleRemove() {
    if (!confirm('Remove this custom domain?')) return
    setRemoving(true)
    try {
      await fetch('/api/dashboard/domain', { method: 'DELETE' })
      setDomain(null); showToast('Domain removed')
    } finally { setRemoving(false) }
  }

  const statusInfo = domain ? STATUS_MAP[domain.status] || STATUS_MAP.PENDING : null

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-brand-900 border border-brand-700 text-brand-300 px-4 py-3 rounded-xl text-sm font-medium shadow-xl">
          {toast}
        </div>
      )}

      <div>
        <h1 className="font-display text-2xl font-700 text-white mb-1">Domain</h1>
        <p className="text-white/40 text-sm">Connect a custom domain or use your free subdomain</p>
      </div>

      {/* Default URL */}
      {defaultUrl && (
        <div className="glass rounded-2xl border border-white/8 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-white/40" />
            <p className="text-sm font-medium text-white/60">Your Free Store URL</p>
            <span className="text-xs bg-white/5 text-white/30 px-2 py-0.5 rounded-full">Always active</span>
          </div>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-sm text-white/70 font-mono truncate">{defaultUrl}</code>
            <button onClick={() => copy(defaultUrl, 'default')} className="text-white/30 hover:text-white transition-colors p-1">
              {copied === 'default' ? <Check className="w-4 h-4 text-brand-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <a href={defaultUrl} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors p-1">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Premium gate */}
      {!isPremium && (
        <div className="rounded-2xl border border-amber-700/30 bg-amber-950/20 p-5 flex items-start gap-4">
          <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300 mb-1">Custom domains require an active subscription</p>
            <p className="text-xs text-amber-400/60">Upgrade to $13/month to connect your own domain, get SSL, and remove the platform branding from your URL.</p>
            <a href="/dashboard/billing" className="inline-flex items-center gap-1.5 mt-3 text-xs bg-amber-600 hover:bg-amber-500 text-black font-medium px-3 py-1.5 rounded-lg transition-all">
              <Zap className="w-3 h-3" /> Upgrade to unlock
            </a>
          </div>
        </div>
      )}

      {/* Custom domain section */}
      {isPremium && (
        <>
          {!domain ? (
            <div className="glass rounded-2xl border border-white/8 p-6">
              <h2 className="font-display font-700 text-white text-lg mb-1">Add Custom Domain</h2>
              <p className="text-white/40 text-sm mb-5">Point your domain to our servers and we'll handle the rest.</p>

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              <form onSubmit={handleAdd} className="flex gap-3">
                <input
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  placeholder="shop.yourdomain.com"
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-brand-600/60 transition-all"
                />
                <button
                  type="submit"
                  disabled={adding || !newDomain.trim()}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  Add Domain
                </button>
              </form>
            </div>
          ) : (
            <div className="glass rounded-2xl border border-white/8 p-6 space-y-5">
              {/* Domain header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-display font-700 text-white text-lg">{domain.domain}</h2>
                    {statusInfo && (
                      <span className={cn('flex items-center gap-1 text-xs font-medium', statusInfo.color)}>
                        <statusInfo.icon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    )}
                  </div>
                  {domain.sslEnabled && (
                    <p className="text-xs text-brand-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> SSL/HTTPS enabled
                    </p>
                  )}
                </div>
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
                >
                  {removing ? 'Removing…' : 'Remove'}
                </button>
              </div>

              {/* DNS Instructions */}
              {domain.status !== 'VERIFIED' && (
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-4">
                  <p className="text-sm font-medium text-white/70">Add this DNS record to verify ownership:</p>

                  <div className="space-y-2">
                    {[
                      { label: 'Type', value: 'TXT' },
                      { label: 'Name / Host', value: '@' },
                      { label: 'Value', value: domain.txtRecord },
                      { label: 'TTL', value: '3600' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                        <span className="text-xs text-white/30 w-28 shrink-0">{row.label}</span>
                        <code className="text-xs text-white/70 font-mono flex-1 break-all">{row.value}</code>
                        {row.label === 'Value' && (
                          <button onClick={() => copy(row.value, 'txt')} className="text-white/30 hover:text-white transition-colors shrink-0">
                            {copied === 'txt' ? <Check className="w-3.5 h-3.5 text-brand-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-white/25">DNS changes can take up to 48 hours to propagate.</p>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/8 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {verifying ? 'Checking DNS…' : 'Check Verification'}
                  </button>
                </div>
              )}

              {domain.status === 'VERIFIED' && (
                <div className="rounded-xl bg-brand-950/30 border border-brand-700/20 p-4">
                  <p className="text-sm text-brand-300 mb-1">✓ Your store is live at <strong>https://{domain.domain}</strong></p>
                  <p className="text-xs text-white/30">Also add a CNAME record pointing {domain.domain} → proxy.samplewebsite.com for full routing.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* How it works */}
      <div className="glass rounded-2xl border border-white/8 p-5">
        <h3 className="font-medium text-white/70 text-sm mb-3">How custom domains work</h3>
        <ol className="space-y-2 text-xs text-white/40 list-decimal list-inside">
          <li>Enter your domain (e.g. shop.yourdomain.com)</li>
          <li>Add the TXT record to your DNS provider (Namecheap, Cloudflare, GoDaddy, etc.)</li>
          <li>Click "Check Verification" — we confirm ownership</li>
          <li>Add a CNAME record pointing to our servers</li>
          <li>Your store is live on your custom domain with HTTPS</li>
        </ol>
      </div>
    </div>
  )
}
