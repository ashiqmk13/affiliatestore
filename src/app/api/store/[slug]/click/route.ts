// src/app/api/store/[slug]/click/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { productId } = await req.json()
    const store = await db.store.findUnique({ where: { slug: params.slug } })
    if (!store) return NextResponse.json({ ok: false })

    await db.product.update({
      where: { id: productId, storeId: store.id },
      data: { clickCount: { increment: 1 } },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existing = await db.analytics.findFirst({
      where: { storeId: store.id, date: today, source: null, country: null },
    })

    if (existing) {
      await db.analytics.update({
        where: { id: existing.id },
        data: { clicks: { increment: 1 } },
      })
    } else {
      await db.analytics.create({
        data: { storeId: store.id, date: today, clicks: 1, pageViews: 0, visitors: 0 },
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
