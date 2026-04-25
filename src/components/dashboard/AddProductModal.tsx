'use client'
// src/components/dashboard/AddProductModal.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link2, Package, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

type Mode = 'choose' | 'affiliate' | 'manual'

interface Props {
  storeId: string
  categories: { id: string; name: string }[]
  isOpen: boolean
  onClose: () => void
  onSuccess: (product: any) => void
}

export default function AddProductModal({ storeId, categories, isOpen, onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>('choose')
  const [url, setUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [scraped, setScraped] = useState<any>(null)
  const [scrapeError, setScrapeError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', price: '', originalPrice: '',
    affiliateUrl: '', categoryId: '', tags: '',
  })

  function reset() {
    setMode('choose'); setUrl(''); setScraping(false); setScraped(null)
    setScrapeError(''); setSaving(false)
    setForm({ name: '', description: '', price: '', originalPrice: '', affiliateUrl: '', categoryId: '', tags: '' })
  }

  function handleClose() { reset(); onClose() }

  async function scrapeUrl() {
  if (!url) return

  setScraping(true)
  setScrapeError('')
  setScraped(null)

  try {
    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    const data = await res.json()

    if (!res.ok) {
      setScrapeError(data.error || 'Failed to load product details')
      return
    }

    const product = data.product

    setScraped(product)

    setForm(f => ({
      ...f,
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      affiliateUrl: url,
    }))

  } catch {
    setScrapeError('Failed to reach the URL. Please try again.')
  } finally {
    setScraping(false)
  }
}
 async function saveProduct() {
    if (!form.name) return
    setSaving(true)
    try {
      const body: any = {
        storeId,
        type: mode === 'affiliate' ? 'AFFILIATE' : 'MANUAL',
        name: form.name,
        description: form.description || undefined,
        price: form.price ? parseFloat(form.price) : undefined,
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        affiliateUrl: form.affiliateUrl || undefined,
        sourceUrl: url || undefined,
        imageUrls: scraped?.imageUrls || [],
        categoryId: form.categoryId || undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) return
      onSuccess(data)
      reset()
    } finally { setSaving(false) }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={handleClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
            <h2 className="font-display font-700 text-white text-lg">
              {mode === 'choose' ? 'Add Product' : mode === 'affiliate' ? 'Add Affiliate Product' : 'Add Manual Product'}
            </h2>
            <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
            {/* Mode chooser */}
            {mode === 'choose' && (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setMode('affiliate')}
                  className="group p-6 rounded-2xl border border-white/8 hover:border-brand-700/50 bg-white/[0.02] hover:bg-brand-950/20 transition-all text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-900/30 border border-blue-700/30 flex items-center justify-center mb-4 group-hover:bg-blue-800/30 transition-colors">
                    <Link2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="font-display font-700 text-white mb-1">Affiliate Link</p>
                  <p className="text-xs text-white/40 leading-relaxed">Paste a product URL and we'll auto-fill all the details.</p>
                </button>
                <button onClick={() => setMode('manual')}
                  className="group p-6 rounded-2xl border border-white/8 hover:border-brand-700/50 bg-white/[0.02] hover:bg-brand-950/20 transition-all text-left">
                  <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-700/30 flex items-center justify-center mb-4 group-hover:bg-purple-800/30 transition-colors">
                    <Package className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="font-display font-700 text-white mb-1">Manual Product</p>
                  <p className="text-xs text-white/40 leading-relaxed">Enter product details yourself, including your own images and description.</p>
                </button>
              </div>
            )}

            {/* Affiliate mode */}
            {mode === 'affiliate' && (
              <div className="space-y-5">
                {!scraped ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Product URL</label>
                      <div className="flex gap-2">
                        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://amazon.com/dp/..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-600/50 text-sm transition-all" />
                        <button onClick={scrapeUrl} disabled={scraping || !url}
                          className="shrink-0 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2">
                          {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                          {scraping ? 'Loading…' : 'Fetch'}
                        </button>
                      </div>
                      {scrapeError && (
                        <div className="mt-2 flex items-start gap-2 text-red-400 text-xs bg-red-900/20 border border-red-700/30 rounded-xl px-3 py-2.5">
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {scrapeError}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-white/30 text-center">Supports Amazon, Flipkart, ShareASale, and most product pages</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-brand-400 text-sm bg-brand-950/30 border border-brand-700/30 px-3 py-2.5 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> Product details loaded successfully
                    </div>
                    {scraped.imageUrls?.[0] && (
                      <img src={scraped.imageUrls[0]} alt="" className="w-full h-40 object-contain rounded-xl bg-white/5" />
                    )}
                    {renderFormFields()}
                  </>
                )}
              </div>
            )}

            {/* Manual mode */}
            {mode === 'manual' && (
              <div className="space-y-5">
                {renderFormFields()}
              </div>
            )}
          </div>

          {/* Footer */}
          {(mode === 'manual' || (mode === 'affiliate' && scraped)) && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/8 bg-white/[0.01]">
              <button onClick={() => { setMode('choose'); setScraped(null) }}
                className="text-sm text-white/50 hover:text-white/80 px-4 py-2 transition-colors">
                Back
              </button>
              <button onClick={saveProduct} disabled={saving || !form.name}
                className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Product'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )

  function renderFormFields() {
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Product name *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-600/50 text-sm transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3} placeholder="Product description…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-600/50 text-sm transition-all resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Price</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-600/50 text-sm transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Original price</label>
            <input type="number" min="0" step="0.01" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-600/50 text-sm transition-all" />
          </div>
        </div>
        {mode === 'manual' && (
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Affiliate URL</label>
            <input value={form.affiliateUrl} onChange={e => setForm(f => ({ ...f, affiliateUrl: e.target.value }))} placeholder="https://…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-600/50 text-sm transition-all" />
          </div>
        )}
        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Category</label>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-600/50 text-sm transition-all">
              <option value="">No category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Tags</label>
          <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="electronics, gadgets, wireless (comma separated)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-600/50 text-sm transition-all" />
        </div>
      </>
    )
  }
}
