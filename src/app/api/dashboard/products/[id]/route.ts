// src/app/api/dashboard/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  price: z.number().positive().optional().nullable(),
  originalPrice: z.number().positive().optional().nullable(),
  currency: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  affiliateUrl: z.string().url().optional().nullable(),
  sku: z.string().optional().nullable(),
  stock: z.number().int().min(0).optional().nullable(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
})

async function getProductForUser(id: string, userId: string) {
  const store = await db.store.findUnique({ where: { userId } })
  if (!store) return null
  return db.product.findFirst({ where: { id, storeId: store.id } })
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const product = await getProductForUser(params.id, user.id)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const product = await getProductForUser(params.id, user.id)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const data = updateSchema.parse(await req.json())
    const updated = await db.product.update({ where: { id: params.id }, data })
    return NextResponse.json({ product: updated })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const product = await getProductForUser(params.id, user.id)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await db.product.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
