'use client'
// src/components/store/StoreClient.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ExternalLink, Tag, ShoppingBag, X, ChevronLeft } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useParams } from 'next/navigation'
import Image from 'next/image'

interface Product {
  id: string; name: string; description: string | null
  price: number | null; originalPrice: number | null; currency: string
  imageUrls: string[]; affiliateUrl: string | null; type: string
  isFeatured: boolean; tags: string[]
}

interface Category { id: string; name: string; slug: string }

interface Store {
  name: string; slug: string; description: string | null
  logoUrl: string | null; bannerUrl: string | null
  themeColor: string; currency: string
}

function ProductCard({ product, onSelect, themeColor }: { product: Product; onSelect: (p: Product) => void; themeColor: string }) {
  const discount = product.originalPrice && product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden cursor-pointer hover:border-white/20 transition-all hover:shadow-xl hover:shadow-black/40"
      onClick={() => onSelect(product)}
    >
      {/* Image */}
      <div className="aspect-square bg-white/[0.02] relative overflow-hidden">
        {product.imageUrls[0] ? (
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-white/10" />
          </div>
        )}
        {product.isFeatured && (
          <span className="absolute top-2.5 left-2.5 text-xs font-medium text-white px-2 py-1 rounded-full" style={{ background: themeColor }}>
            Featured
          </span>
        )}
        {discount && (
          <span className="absolute top-2.5 right-2.5 text-xs font-700 text-white bg-red-600 px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-white/90 mb-2 line-clamp-2 leading-snug">{product.name}</h3>

        <div className="flex items-center justify-between">
          <div>
            {product.price ? (
              <div className="flex items-baseline gap-2">
                <span className="text-base font-700 text-white" style={{ color: themeColor }}>
                  {formatCurrency(product.price, product.currency)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-white/30 line-through">
                    {formatCurrency(product.originalPrice, product.currency)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-white/30">Price varies</span>
            )}
          </div>
          {product.tags.slice(0, 1).map(tag => (
            <span key={tag} className="text-xs text-white/30 border border-white/10 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function ProductModal({ product, onClose, onBuy, themeColor }: { product: Product; onClose: () => void; onBuy: (p: Product) => void; themeColor: string }) {
  const [imgIdx, setImgIdx] = useState(0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex">
          {/* Image panel */}
          <div className="w-2/5 shrink-0 bg-white/[0.02] relative">
            <div className="aspect-square">
              {product.imageUrls[imgIdx] ? (
                <img src={product.imageUrls[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-white/10" />
                </div>
              )}
            </div>
            {product.imageUrls.length > 1 && (
              <div className="flex gap-1.5 p-3">
                {product.imageUrls.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={cn('w-8 h-8 rounded-lg overflow-hidden border transition-all', imgIdx === i ? 'border-white/40' : 'border-transparent opacity-50')}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details panel */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className="font-display font-700 text-white text-xl leading-tight">{product.name}</h2>
              <button onClick={onClose} className="text-white/30 hover:text-white transition-colors shrink-0 mt-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {product.price && (
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-700" style={{ color: themeColor }}>
                  {formatCurrency(product.price, product.currency)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-white/30 line-through">{formatCurrency(product.originalPrice, product.currency)}</span>
                )}
              </div>
            )}

            {product.description && (
              <p className="text-sm text-white/50 leading-relaxed mb-5 flex-1">{product.description.slice(0, 400)}{product.description.length > 400 ? '…' : ''}</p>
            )}

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {product.tags.map(tag => (
                  <span key={tag} className="text-xs text-white/30 border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />{tag}
                  </span>
                ))}
              </div>
            )}

            {product.affiliateUrl && (
              <button
                onClick={() => onBuy(product)}
                className="flex items-center justify-center gap-2 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5 mt-auto"
                style={{ background: themeColor }}
              >
                <ExternalLink className="w-4 h-4" />
                View Deal
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function StoreClient({ store, products, categories }: { store: Store; products: Product[]; categories: Category[] }) {
  const params = useParams()
  const [q, setQ] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selected, setSelected] = useState<Product | null>(null)

  async function trackView() {
    try {
      await fetch(`/api/dashboard/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeSlug: store.slug, source: document.referrer ? new URL(document.referrer).hostname : 'direct' }),
      })
    } catch {}
  }

  useEffect(() => { trackView() }, [])

  async function handleBuy(product: Product) {
    if (!product.affiliateUrl) return
    try {
      await fetch(`/api/store/${store.slug}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
    } catch {}
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer')
  }

  const filtered = products.filter(p => {
    const matchQ = !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(q.toLowerCase()))
    return matchQ
  })

  const featured = filtered.filter(p => p.isFeatured)
  const regular = filtered.filter(p => !p.isFeatured)

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#080808]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 shrink-0">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-8 w-auto rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: store.themeColor }}>
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="font-display font-700 text-white text-lg">{store.name}</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
            />
            {q && (
              <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-xs text-white/20 shrink-0">{products.length} products</span>
        </div>
      </header>

      {/* Banner */}
      {store.bannerUrl && (
        <div className="h-48 md:h-64 overflow-hidden relative">
          <img src={store.bannerUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#080808]" />
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Store description */}
        {store.description && (
          <p className="text-white/40 text-center mb-8 max-w-xl mx-auto">{store.description}</p>
        )}

        {/* Mobile search */}
        <div className="relative mb-6 sm:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search products…"
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none"
          />
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn('shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
                !activeCategory ? 'text-white border-white/20 bg-white/5' : 'text-white/40 border-white/10 hover:border-white/20'
              )}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                className={cn('shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
                  activeCategory === cat.id ? 'text-white border-white/20' : 'text-white/40 border-white/10 hover:border-white/20'
                )}
                style={activeCategory === cat.id ? { background: `${store.themeColor}20`, borderColor: `${store.themeColor}60`, color: store.themeColor } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Featured row */}
        {featured.length > 0 && !q && (
          <div className="mb-12">
            <h2 className="font-display font-700 text-white text-xl mb-4">Featured</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map(p => (
                <ProductCard key={p.id} product={p} onSelect={setSelected} themeColor={store.themeColor} />
              ))}
            </div>
          </div>
        )}

        {/* All products */}
        {regular.length > 0 && (
          <div>
            {featured.length > 0 && !q && (
              <h2 className="font-display font-700 text-white text-xl mb-4">All Products</h2>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(q ? filtered : regular).map(p => (
                <ProductCard key={p.id} product={p} onSelect={setSelected} themeColor={store.themeColor} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <ShoppingBag className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-lg">{q ? `No products match "${q}"` : 'No products yet'}</p>
            {q && <button onClick={() => setQ('')} className="mt-3 text-sm text-white/40 hover:text-white transition-colors">Clear search</button>}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 mt-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-white/20">
            Powered by <a href="/" className="hover:text-white/40 transition-colors">Sample Website</a>
          </p>
        </div>
      </footer>

      {/* Product modal */}
      <AnimatePresence>
        {selected && (
          <ProductModal
            product={selected}
            onClose={() => setSelected(null)}
            onBuy={handleBuy}
            themeColor={store.themeColor}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
