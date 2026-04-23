// src/app/admin/stores/page.tsx
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, Store, Package } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function AdminStoresPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') redirect('/dashboard')

  const stores = await db.store.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { products: true } },
      customDomain: { select: { domain: true, status: true } },
    },
  })

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-700 text-white mb-1">All Stores</h1>
        <p className="text-white/40 text-sm">{stores.length} stores total</p>
      </div>

      <div className="glass rounded-2xl border border-white/8 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Store', 'Owner', 'Products', 'Status', 'Domain', 'Created', ''].map(h => (
                <th key={h} className="text-left text-xs text-white/30 font-medium px-5 py-3.5 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {stores.map((store: {
              id: string
              name: string
              slug: string
              themeColor: string
              isPublished: boolean
              createdAt: Date
              _count: { products: number }
              user: { name: string | null; email: string }
              customDomain: { domain: string; status: string } | null
            }) => (
              <tr key={store.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: store.themeColor }}>
                      <Store className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{store.name}</p>
                      <p className="text-xs text-white/30 font-mono">/{store.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-white/60">{store.user.name || store.user.email}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-white/50">
                    <Package className="w-3.5 h-3.5" />
                    {store._count.products}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${store.isPublished ? 'text-brand-400 bg-brand-900/30' : 'text-white/30 bg-white/5'}`}>
                    {store.isPublished ? 'Live' : 'Hidden'}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-white/40">
                  {store.customDomain ? (
                    <span className={store.customDomain.status === 'VERIFIED' ? 'text-brand-400' : 'text-amber-400'}>
                      {store.customDomain.domain}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-5 py-4 text-sm text-white/30">{formatDate(store.createdAt)}</td>
                <td className="px-5 py-4">
                  <a
                    href={`/store/${store.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/30 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stores.length === 0 && (
          <div className="text-center py-12 text-white/30 text-sm">No stores yet.</div>
        )}
      </div>
    </div>
  )
}
