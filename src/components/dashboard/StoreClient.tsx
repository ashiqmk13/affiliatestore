'use client'
// src/components/dashboard/StoreClient.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Store, ExternalLink, Copy, Check, Globe, Eye, EyeOff, Loader2, Save, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoreData {
  id: string; name: string; slug: string; description: string
  themeColor: string; currency: string; language: string
  metaTitle: string; metaDescription: string; isPublished: boolean
  logoUrl: string; storeUrl: string
}

const COLORS = ['#22c55e','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#ec4899','#06b6d4','#f97316']
const CURRENCIES = ['USD','EUR','GBP','INR','AUD','CAD','SGD','AED']
const LANGUAGES = [{ v: 'en', l: 'English' },{ v: 'es', l: 'Spanish' },{ v: 'fr', l: 'French' },{ v: 'de', l: 'German' },{ v: 'hi', l: 'Hindi' },{ v: 'ar', l: 'Arabic' }]

export default function StoreClient({ initialStore }: { initialStore: StoreData | null }) {
  const [store, setStore] = useState<StoreData | null>(initialStore)
  const [form, setForm] = useState({
    name: initialStore?.name || '',
    description: initialStore?.description || '',
    themeColor: initialStore?.themeColor || '#22c55e',
    currency: initialStore?.currency || 'USD',
    language: initialStore?.language || 'en',
    metaTitle: initialStore?.metaTitle || '',
    metaDescription: initialStore?.metaDescription || '',
    logoUrl: initialStore?.logoUrl || '',
  })
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [tab, setTab] = useState<'general' | 'seo' | 'appearance'>('general')

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const method = store ? 'PATCH' : 'POST'
      const res = await fetch('/api/dashboard/store', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Failed to save', 'error'); return }
      setStore(prev => ({ ...prev!, ...data.store, storeUrl: data.store.storeUrl || prev?.storeUrl }))
      showToast('Store saved successfully')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish() {
    if (!store) return
    setToggling(true)
    try {
      const res = await fetch('/api/dashboard/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !store.isPublished }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Failed', 'error'); return }
      setStore(prev => prev ? { ...prev, isPublished: data.store.isPublished } : null)
      showToast(data.store.isPublished ? 'Store is now live!' : 'Store is now hidden')
    } finally {
      setToggling(false)
    }
  }

  function copyUrl() {
    if (!store) return
    navigator.clipboard.writeText(store.storeUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'seo', label: 'SEO' },
  ] as const

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className={cn('fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl',
            toast.type === 'success' ? 'bg-brand-900 border border-brand-700 text-brand-300' : 'bg-red-950 border border-red-800 text-red-300'
          )}
        >
          {toast.msg}
        </motion.div>
      )}

      <div className="mb-8">
        <h1 className="font-display text-2xl font-700 text-white mb-1">My Store</h1>
        <p className="text-white/40 text-sm">{store ? 'Manage your store settings' : 'Create your store to get started'}</p>
      </div>

      {/* Store URL banner */}
      {store && (
        <div className="mb-6 glass rounded-xl border border-white/8 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn('w-2 h-2 rounded-full shrink-0', store.isPublished ? 'bg-brand-400' : 'bg-white/20')} />
            <div className="min-w-0">
              <p className="text-xs text-white/40 mb-0.5">{store.isPublished ? 'Store is live' : 'Store is hidden'}</p>
              <p className="text-sm text-white/70 truncate font-mono">{store.storeUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={copyUrl} className="p-2 text-white/40 hover:text-white transition-colors" title="Copy URL">
              {copied ? <Check className="w-4 h-4 text-brand-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <a href={store.storeUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-white/40 hover:text-white transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={togglePublish}
              disabled={toggling}
              className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                store.isPublished
                  ? 'bg-white/5 hover:bg-white/10 text-white/60'
                  : 'bg-brand-600 hover:bg-brand-500 text-white'
              )}
            >
              {toggling ? <Loader2 className="w-3 h-3 animate-spin" /> : store.isPublished ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {store.isPublished ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/[0.03] p-1 rounded-xl border border-white/5">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.id ? 'bg-brand-900/50 text-brand-300 border border-brand-700/40' : 'text-white/40 hover:text-white/70'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {tab === 'general' && (
          <>
            <Field label="Store Name *">
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="My Awesome Store"
                className={inputCls}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="What does your store sell?"
                rows={3}
                className={cn(inputCls, 'resize-none')}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Currency">
                <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} className={inputCls}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Language">
                <select value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))} className={inputCls}>
                  {LANGUAGES.map(l => <option key={l.v} value={l.v}>{l.l}</option>)}
                </select>
              </Field>
            </div>
          </>
        )}

        {tab === 'appearance' && (
          <>
            <Field label="Logo URL">
              <input
                value={form.logoUrl}
                onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))}
                placeholder="https://example.com/logo.png"
                className={inputCls}
              />
            </Field>
            <Field label="Brand Color">
              <div className="flex items-center gap-3">
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(p => ({ ...p, themeColor: c }))}
                      className={cn('w-8 h-8 rounded-lg transition-all', form.themeColor === c ? 'ring-2 ring-offset-2 ring-offset-[#0d0d0d] ring-white scale-110' : 'hover:scale-105')}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="color"
                    value={form.themeColor}
                    onChange={e => setForm(p => ({ ...p, themeColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    value={form.themeColor}
                    onChange={e => setForm(p => ({ ...p, themeColor: e.target.value }))}
                    className={cn(inputCls, 'w-28 font-mono text-sm')}
                    maxLength={7}
                  />
                </div>
              </div>
            </Field>
          </>
        )}

        {tab === 'seo' && (
          <>
            <Field label="Meta Title" hint="60 characters max. Shown in search engines.">
              <input
                value={form.metaTitle}
                onChange={e => setForm(p => ({ ...p, metaTitle: e.target.value }))}
                placeholder={form.name || 'My Store'}
                maxLength={60}
                className={inputCls}
              />
              <p className="text-xs text-white/30 mt-1">{form.metaTitle.length}/60</p>
            </Field>
            <Field label="Meta Description" hint="160 characters max. Appears in search results.">
              <textarea
                value={form.metaDescription}
                onChange={e => setForm(p => ({ ...p, metaDescription: e.target.value }))}
                placeholder={form.description || 'Shop our collection of products...'}
                maxLength={160}
                rows={3}
                className={cn(inputCls, 'resize-none')}
              />
              <p className="text-xs text-white/30 mt-1">{form.metaDescription.length}/160</p>
            </Field>
            {/* SEO Preview */}
            {(form.metaTitle || form.name) && (
              <div className="rounded-xl border border-white/8 p-4 bg-white/[0.02]">
                <p className="text-xs text-white/30 mb-3 uppercase tracking-widest">Search Preview</p>
                <p className="text-blue-400 text-sm font-medium mb-1">{form.metaTitle || form.name}</p>
                <p className="text-green-600 text-xs mb-1">samplewebsite.com/store/{store?.slug || 'your-store'}</p>
                <p className="text-white/50 text-xs leading-relaxed">{form.metaDescription || form.description || 'No description set.'}</p>
              </div>
            )}
          </>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !form.name}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {store ? 'Save Changes' : 'Create Store'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-white/50 mb-1.5 block font-medium">
        {label}
        {hint && <span className="ml-1 text-white/30 font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-brand-600/60 transition-all'
