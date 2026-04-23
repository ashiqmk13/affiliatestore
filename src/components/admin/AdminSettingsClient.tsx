'use client'
// src/components/admin/AdminSettingsClient.tsx
import { useState } from 'react'
import { Save, Loader2, AlertTriangle, Globe, Mail, DollarSign, Clock, Settings } from 'lucide-react'

const inputCls = 'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-amber-600/60 transition-all'

const SETTINGS_SCHEMA = [
  {
    section: 'Platform Identity',
    icon: Globe,
    fields: [
      { key: 'platform_name', label: 'Platform Name', placeholder: 'Sample Website', hint: 'Shown across the entire platform' },
      { key: 'platform_domain', label: 'Platform Domain', placeholder: 'samplewebsite.com', hint: 'Root domain (without https://)' },
      { key: 'platform_tagline', label: 'Tagline', placeholder: 'Launch your affiliate store in minutes', hint: 'Shown on the homepage hero' },
    ],
  },
  {
    section: 'Contact & Support',
    icon: Mail,
    fields: [
      { key: 'support_email', label: 'Support Email', placeholder: 'support@samplewebsite.com', hint: 'Shown in footer and emails' },
      { key: 'smtp_from_name', label: 'Email From Name', placeholder: 'Sample Website', hint: 'Name used in outgoing emails' },
    ],
  },
  {
    section: 'Billing',
    icon: DollarSign,
    fields: [
      { key: 'subscription_price', label: 'Monthly Price (USD)', placeholder: '13', hint: 'Shown on pricing page (must match Stripe price)' },
    ],
  },
  {
    section: 'Trial & Access',
    icon: Clock,
    fields: [
      { key: 'trial_days', label: 'Free Trial Days', placeholder: '30', hint: 'Days new users get for free' },
      { key: 'allow_registrations', label: 'Allow Registrations', placeholder: 'true', hint: 'Set to "false" to disable new signups' },
      { key: 'maintenance_mode', label: 'Maintenance Mode', placeholder: 'false', hint: 'Set to "true" to show maintenance page' },
    ],
  },
]

export default function AdminSettingsClient({ settings: initialSettings }: { settings: Record<string, string> }) {
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null)
  const [changed, setChanged] = useState<Set<string>>(new Set())

  function showToast(msg: string, err = false) {
    setToast({ msg, err })
    setTimeout(() => setToast(null), 3500)
  }

  function handleChange(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
    setChanged(prev => new Set(Array.from(prev).concat(key)))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updates: Record<string, string> = {}
      Array.from(changed).forEach((k: string) => { updates[k] = settings[k] })

      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Failed to save', true); return }
      setChanged(new Set())
      showToast('Settings saved successfully')
    } finally { setSaving(false) }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl ${toast.err ? 'bg-red-950 border border-red-800 text-red-300' : 'bg-amber-900/80 border border-amber-700 text-amber-300'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-700 text-white mb-1">Platform Settings</h1>
          <p className="text-white/40 text-sm">Configure platform-wide options</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || changed.size === 0}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-black font-medium px-5 py-2.5 rounded-xl text-sm transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {changed.size > 0 ? `Save ${changed.size} change${changed.size > 1 ? 's' : ''}` : 'Saved'}
        </button>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 bg-amber-950/20 border border-amber-700/20 rounded-xl p-4">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-400/80">
          Changes to the platform name take effect immediately across all pages. Billing price changes are display only — update your Stripe product separately.
        </p>
      </div>

      {/* Settings sections */}
      {SETTINGS_SCHEMA.map(section => (
        <div key={section.section} className="glass rounded-2xl border border-white/8 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <section.icon className="w-4 h-4 text-amber-400" />
            <h2 className="font-display font-700 text-white">{section.section}</h2>
          </div>
          {section.fields.map(field => (
            <div key={field.key}>
              <label className="text-xs text-white/50 mb-1 block font-medium">
                {field.label}
                {changed.has(field.key) && <span className="ml-2 text-amber-400 text-xs">● modified</span>}
              </label>
              <input
                value={settings[field.key] || ''}
                onChange={e => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={inputCls}
              />
              {field.hint && <p className="text-xs text-white/25 mt-1">{field.hint}</p>}
            </div>
          ))}
        </div>
      ))}

      {/* Danger zone */}
      <div className="glass rounded-2xl border border-red-900/30 p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h2 className="font-display font-700 text-red-400">Danger Zone</h2>
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block font-medium">
            Maintenance Mode
            {changed.has('maintenance_mode') && <span className="ml-2 text-amber-400 text-xs">● modified</span>}
          </label>
          <div className="flex items-center gap-3">
            <select
              value={settings['maintenance_mode'] || 'false'}
              onChange={e => handleChange('maintenance_mode', e.target.value)}
              className={inputCls}
            >
              <option value="false">Off — Platform is live</option>
              <option value="true">On — Show maintenance page</option>
            </select>
          </div>
          <p className="text-xs text-red-400/50 mt-1">Enabling maintenance mode will show a maintenance page to all non-admin users.</p>
        </div>
      </div>
    </div>
  )
}
