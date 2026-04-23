'use client'
// src/components/dashboard/ProductsClient.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Link2, Package, Pencil, Trash2, Eye, EyeOff, Star, Loader2, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import AddProductModal from './AddProductModal'

interface Product {
  id: string; name: string; price?: number | null; type: string; isActive: boolean
  isFeatured: boolean; imageUrls: string[]; affiliateUrl?: string | null
  clickCount: number; category?: string; createdAt: string
}

interface Props {
  storeId: string
  products: Product[]
  categories: { id: string; name: string }[]
}

export default function ProductsClient({ storeId, products: initial, categories }: Props) {
  const [products, setProducts] = useState(initial)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'affiliate' | 'manual'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.type.toLowerCase() === filter
    return matchSearch && matchFilter
  })

  async function toggleActive(id: string) {
    const product = products.find(p => p.id === id)
    if (!product) return
    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !product.isActive }),
    })
    if (res.ok) setProducts(ps => ps.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p))
  }

  async function toggleFeatured(id: string) {
    const product = products.find(p => p.id === id)
    if (!product) return
    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !product.isFeatured }),
    })
    if (res.ok) setProducts(ps => ps.map(p => p.id === id ? { ...p, isFeatured: !p.isFeatured } : p))
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    setDeleting(id)
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) setProducts(ps => ps.filter(p => p.id !== id))
    setDeleting(null)
  }

  function onProductAdded(product: Product) {
    setProducts(ps => [product, ...ps])
    setShowAdd(false)
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-700 text-white">Products</h2>
          <p className="text-white/40 text-sm mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} in your store</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-600/50 text-sm transition-all"
          />
        </div>
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {(['all', 'affiliate', 'manual'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? 'bg-brand-700 text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl border border-white/8 p-16 text-center">
          <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="font-display text-lg font-700 text-white/60 mb-2">
            {search || filter !== 'all' ? 'No products found' : 'No products yet'}
          </h3>
          <p className="text-white/30 text-sm mb-6">
            {search || filter !== 'all' ? 'Try adjusting your filters.' : 'Add your first product by pasting an affiliate link or creating one manually.'}
          </p>
          {!search && filter === 'all' && (
            <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all">
              <Plus className="w-4 h-4" /> Add your first product
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className={`glass rounded-2xl border p-4 transition-all ${product.isActive ? 'border-white/8' : 'border-white/4 opacity-60'}`}
              >
                <div className="flex items-center gap-4">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl bg-white/5 shrink-0 overflow-hidden">
                    {product.imageUrls?.[0] ? (
                      <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-white/20" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-white truncate">{product.name}</p>
                      {product.isFeatured && <span className="shrink-0 text-xs bg-yellow-900/30 border border-yellow-700/30 text-yellow-400 px-2 py-0.5 rounded-full">Featured</span>}
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${product.type === 'AFFILIATE' ? 'bg-blue-900/20 border-blue-700/30 text-blue-400' : 'bg-purple-900/20 border-purple-700/30 text-purple-400'}`}>
                        {product.type === 'AFFILIATE' ? <span className="flex items-center gap-1"><Link2 className="w-2.5 h-2.5" />Affiliate</span> : 'Manual'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      {product.price && <span className="text-brand-400 font-mono font-600">{formatCurrency(product.price)}</span>}
                      {product.category && <span>{product.category}</span>}
                      <span>{product.clickCount} clicks</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {product.affiliateUrl && (
                      <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all" title="Open affiliate link">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button onClick={() => toggleFeatured(product.id)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${product.isFeatured ? 'text-yellow-400 bg-yellow-900/20' : 'text-white/30 hover:text-yellow-400 hover:bg-white/5'}`}
                      title="Toggle featured">
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleActive(product.id)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${product.isActive ? 'text-brand-400 bg-brand-900/20' : 'text-white/30 hover:text-brand-400 hover:bg-white/5'}`}
                      title={product.isActive ? 'Hide product' : 'Show product'}>
                      {product.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => deleteProduct(product.id)} disabled={deleting === product.id}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-900/20 transition-all" title="Delete product">
                      {deleting === product.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        storeId={storeId}
        categories={categories}
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={onProductAdded}
      />
    </div>
  )
}
