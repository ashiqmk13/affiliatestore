// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { z } from 'zod'

const createSchema = z.object({
  storeId: z.string(),
  type: z.enum(['AFFILIATE', 'MANUAL']),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().optional(),
  originalPrice: z.number().optional(),
  currency: z.string().default('USD'),
  imageUrls: z.array(z.string()).default([]),
  affiliateUrl: z.string().url().optional(),
  sourceUrl: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const store = await db.store.findUnique({ where: { userId: user.id } })
  if (!store) return NextResponse.json({ products: [] })

  const products = await db.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    // Verify store belongs to user
    const store = await db.store.findFirst({ where: { id: data.storeId, userId: user.id } })
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    const product = await db.product.create({
      data: {
        storeId: data.storeId,
        type: data.type,
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        currency: data.currency,
        imageUrls: data.imageUrls,
        affiliateUrl: data.affiliateUrl,
        sourceUrl: data.sourceUrl,
        categoryId: data.categoryId || null,
        tags: data.tags,
      },
      include: { category: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
