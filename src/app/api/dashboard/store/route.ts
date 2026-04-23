// src/app/api/dashboard/store/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(500).optional(),
  currency: z.string().default('USD'),
  language: z.string().default('en'),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#22c55e'),
})

const updateSchema = createSchema.partial().extend({
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  isPublished: z.boolean().optional(),
  logoUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
})

export async function GET(_req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const store = await db.store.findUnique({
    where: { userId: user.id },
    include: { customDomain: true, _count: { select: { products: true } } },
  })
  return NextResponse.json({ store })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await db.store.findUnique({ where: { userId: user.id } })
  if (existing) return NextResponse.json({ error: 'Store already exists' }, { status: 409 })

  try {
    const data = createSchema.parse(await req.json())
    let slug = slugify(data.name)
    // Ensure unique slug
    const slugExists = await db.store.findUnique({ where: { slug } })
    if (slugExists) slug = `${slug}-${Date.now().toString(36)}`

    const store = await db.store.create({
      data: { ...data, slug, userId: user.id },
    })

    // Create trial subscription
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 30)
    await db.subscription.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        status: 'TRIAL',
        trialEndsAt: trialEnd,
      },
    })

    return NextResponse.json({ store }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const store = await db.store.findUnique({ where: { userId: user.id } })
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

  try {
    const data = updateSchema.parse(await req.json())
    const updated = await db.store.update({ where: { id: store.id }, data })
    return NextResponse.json({ store: updated })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
