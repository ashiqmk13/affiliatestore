// src/app/api/store/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const store = await db.store.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true, name: true, description: true, price: true,
          originalPrice: true, currency: true, imageUrls: true,
          affiliateUrl: true, type: true, isFeatured: true, tags: true,
          clickCount: true,
        },
      },
      categories: true,
      customDomain: { select: { domain: true, status: true } },
    },
  })

  if (!store || !store.isPublished) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  return NextResponse.json({
    store: {
      id: store.id,
      name: store.name,
      slug: store.slug,
      description: store.description,
      logoUrl: store.logoUrl,
      bannerUrl: store.bannerUrl,
      themeColor: store.themeColor,
      currency: store.currency,
      metaTitle: store.metaTitle,
      metaDescription: store.metaDescription,
    },
    products: store.products,
    categories: store.categories,
  })
}
