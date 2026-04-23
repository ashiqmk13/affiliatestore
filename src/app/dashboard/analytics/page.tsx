// src/app/dashboard/analytics/page.tsx
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import AnalyticsClient from '@/components/dashboard/AnalyticsClient'

interface AnalyticsRow {
  date: Date
  pageViews: number
  visitors: number
  clicks: number
}

interface TopProduct {
  id: string
  name: string
  clickCount: number
  imageUrls: string[]
  affiliateUrl: string | null
}

export default async function AnalyticsPage() {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login')

  const store = await db.store.findUnique({ where: { userId: user.id } })
  if (!store) redirect('/dashboard/store')

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const analytics = await db.analytics.findMany({
    where: { storeId: store.id, date: { gte: thirtyDaysAgo } },
    orderBy: { date: 'asc' },
  })

  const topProducts = await db.product.findMany({
    where: { storeId: store.id, isActive: true },
    orderBy: { clickCount: 'desc' },
    take: 10,
    select: { id: true, name: true, clickCount: true, imageUrls: true, affiliateUrl: true },
  })

  return (
    <AnalyticsClient
      analytics={(analytics as AnalyticsRow[]).map((a) => ({
        date: a.date.toISOString().split('T')[0],
        pageViews: a.pageViews,
        visitors: a.visitors,
        clicks: a.clicks,
      }))}
      topProducts={topProducts as TopProduct[]}
    />
  )
}
