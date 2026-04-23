// src/app/api/dashboard/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  type: z.enum(['AFFILIATE', 'MANUAL']),
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  currency: z.string().default('USD'),
  imageUrls: z.array(z.string().url()).max(10).default([]),
  affiliateUrl: z.string().url().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  tags: z.array(z.string()).max(20).default([]),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const store = await db.store.findUnique({ where: { userId: user.id } })
  if (!store) return NextResponse.json({ products: [] })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where = {
    storeId: store.id,
    ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    db.product.count({ where }),
  ])

  return NextResponse.json({ products, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check subscription
  const subscription = await db.subscription.findUnique({ where: { userId: user.id } })
  if (subscription?.status === 'EXPIRED' || subscription?.status === 'CANCELED') {
    return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
  }

  const store = await db.store.findUnique({ where: { userId: user.id } })
  if (!store) return NextResponse.json({ error: 'Create a store first' }, { status: 400 })

  try {
    const data = createSchema.parse(await req.json())
    const product = await db.product.create({
      data: { ...data, storeId: store.id },
    })
    return NextResponse.json({ product }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
