// src/app/api/dashboard/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'

interface AnalyticsRow {
  storeId: string
  date: Date
  pageViews: number
  visitors: number
  clicks: number
  source: string | null
  country: string | null
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const store = await db.store.findUnique({ where: { userId: user.id } })
  if (!store) return NextResponse.json({ analytics: [], summary: { views: 0, visitors: 0, clicks: 0 } })

  const { searchParams } = new URL(req.url)
  const days = Math.min(parseInt(searchParams.get('days') || '30'), 90)
  const since = new Date()
  since.setDate(since.getDate() - days)

  const analytics = await db.analytics.findMany({
    where: { storeId: store.id, date: { gte: since } },
    orderBy: { date: 'asc' },
  })

  const rows = analytics as AnalyticsRow[]

  const summary = rows.reduce(
    (acc: { views: number; visitors: number; clicks: number }, a: AnalyticsRow) => ({
      views: acc.views + a.pageViews,
      visitors: acc.visitors + a.visitors,
      clicks: acc.clicks + a.clicks,
    }),
    { views: 0, visitors: 0, clicks: 0 }
  )

  const bySource = rows.reduce((acc: Record<string, number>, a: AnalyticsRow) => {
    if (a.source) acc[a.source] = (acc[a.source] || 0) + a.visitors
    return acc
  }, {})

  const topSources = Object.entries(bySource)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source, count]) => ({ source, count }))

  return NextResponse.json({
    analytics: rows.map((a: AnalyticsRow) => ({
      date: a.date.toISOString().split('T')[0],
      pageViews: a.pageViews,
      visitors: a.visitors,
      clicks: a.clicks,
    })),
    summary,
    topSources,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { storeSlug, source } = await req.json()
    const store = await db.store.findUnique({ where: { slug: storeSlug } })
    if (!store) return NextResponse.json({ ok: false })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Use findFirst + upsert pattern to avoid null unique constraint issues
    const existing = await db.analytics.findFirst({
      where: {
        storeId: store.id,
        date: today,
        source: source || null,
        country: null,
      },
    })

    if (existing) {
      await db.analytics.update({
        where: { id: existing.id },
        data: { pageViews: { increment: 1 }, visitors: { increment: 1 } },
      })
    } else {
      await db.analytics.create({
        data: {
          storeId: store.id,
          date: today,
          pageViews: 1,
          visitors: 1,
          source: source || null,
          country: null,
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
