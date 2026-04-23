// src/app/api/dashboard/domain/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const addSchema = z.object({
  domain: z.string().regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/, 'Invalid domain format'),
})

export async function GET(_req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const store = await db.store.findUnique({
    where: { userId: user.id },
    include: { customDomain: true },
  })

  return NextResponse.json({ domain: store?.customDomain || null })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await db.subscription.findUnique({ where: { userId: user.id } })
  if (!sub || sub.status === 'EXPIRED' || sub.status === 'CANCELED') {
    return NextResponse.json({ error: 'Active subscription required for custom domains' }, { status: 403 })
  }

  const store = await db.store.findUnique({ where: { userId: user.id } })
  if (!store) return NextResponse.json({ error: 'Create a store first' }, { status: 400 })

  try {
    const { domain } = addSchema.parse(await req.json())

    // Check if domain already used
    const existing = await db.customDomain.findUnique({ where: { domain } })
    if (existing && existing.storeId !== store.id) {
      return NextResponse.json({ error: 'Domain already in use' }, { status: 409 })
    }

    // Generate TXT verification record
    const txtRecord = `samplewebsite-verify=${Buffer.from(`${store.id}-${Date.now()}`).toString('base64').slice(0, 24)}`

    const customDomain = await db.customDomain.upsert({
      where: { storeId: store.id },
      update: { domain, status: 'PENDING', txtRecord, verifiedAt: null },
      create: { storeId: store.id, domain, status: 'PENDING', txtRecord },
    })

    return NextResponse.json({ domain: customDomain })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const store = await db.store.findUnique({ where: { userId: user.id } })
  if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.customDomain.deleteMany({ where: { storeId: store.id } })
  return NextResponse.json({ success: true })
}
