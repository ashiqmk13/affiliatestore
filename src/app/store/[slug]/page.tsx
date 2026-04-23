// src/app/store/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import type { Metadata } from 'next'
import StoreClient from '@/components/store/StoreClient'

interface Props { params: { slug: string } }

interface DbProduct {
  id: string
  name: string
  description: string | null
  price: number | null
  originalPrice: number | null
  currency: string
  imageUrls: string[]
  affiliateUrl: string | null
  type: string
  isFeatured: boolean
  tags: string[]
}

interface DbCategory {
  id: string
  name: string
  slug: string
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await db.store.findUnique({ where: { slug: params.slug } })
  if (!store) return { title: 'Store not found' }
  return {
    title: store.metaTitle || store.name,
    description: store.metaDescription || store.description || undefined,
    openGraph: {
      title: store.metaTitle || store.name,
      description: store.metaDescription || store.description || undefined,
      type: 'website',
    },
  }
}

export default async function StorePage({ params }: Props) {
  const store = await db.store.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      },
      categories: true,
    },
  })

  if (!store || !store.isPublished) notFound()

  return (
    <StoreClient
      store={{
        name: store.name,
        slug: store.slug,
        description: store.description,
        logoUrl: store.logoUrl,
        bannerUrl: store.bannerUrl,
        themeColor: store.themeColor,
        currency: store.currency,
      }}
      products={(store.products as DbProduct[]).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        currency: p.currency,
        imageUrls: p.imageUrls,
        affiliateUrl: p.affiliateUrl,
        type: p.type,
        isFeatured: p.isFeatured,
        tags: p.tags,
      }))}
      categories={(store.categories as DbCategory[]).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }))}
    />
  )
}
