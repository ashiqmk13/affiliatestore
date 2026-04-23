// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

async function getProductWithAuth(id: string, userId: string) {
  const product = await db.product.findUnique({
    where: { id },
    include: { store: true },
  })
  if (!product || product.store.userId !== userId) return null
  return product
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await getProductWithAuth(params.id, user.id)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const allowed = ['name', 'description', 'price', 'originalPrice', 'isActive', 'isFeatured', 'categoryId', 'tags', 'affiliateUrl', 'imageUrls', 'metaTitle', 'metaDescription']
  const update: Record<string, any> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const updated = await db.product.update({ where: { id: params.id }, data: update })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await getProductWithAuth(params.id, user.id)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.product.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
