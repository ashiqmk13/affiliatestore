// src/app/dashboard/products/page.tsx
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import ProductsClient from '@/components/dashboard/ProductsClient'

interface DbProduct {
  id: string
  name: string
  price: number | null
  type: string
  isActive: boolean
  isFeatured: boolean
  imageUrls: string[]
  affiliateUrl: string | null
  clickCount: number
  category: { name: string } | null
  createdAt: Date
}

interface DbCategory {
  id: string
  name: string
}

export default async function ProductsPage() {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login')

  const store = await db.store.findUnique({ where: { userId: user.id } })
  if (!store) redirect('/dashboard/store')

  const products = await db.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })

  const categories = await db.category.findMany({ where: { storeId: store.id } })

  return (
    <ProductsClient
      storeId={store.id}
      products={(products as DbProduct[]).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        type: p.type,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        imageUrls: p.imageUrls,
        affiliateUrl: p.affiliateUrl,
        clickCount: p.clickCount,
        category: p.category?.name,
        createdAt: p.createdAt.toISOString(),
      }))}
      categories={(categories as DbCategory[]).map((c) => ({ id: c.id, name: c.name }))}
    />
  )
}
