// src/app/dashboard/page.tsx
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { getStoreUrl } from '@/lib/utils'
import DashboardOverview from '@/components/dashboard/Overview'

interface AnalyticsDay {
  date: Date
  pageViews: number
  clicks: number
  visitors: number
}

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login')

  const [store, subscription] = await Promise.all([
    db.store.findUnique({
      where: { userId: user.id },
      include: {
        _count: { select: { products: true } },
        customDomain: true,
      },
    }),
    db.subscription.findUnique({ where: { userId: user.id } }),
  ])

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const analytics: AnalyticsDay[] = store
    ? await db.analytics.findMany({
        where: { storeId: store.id, date: { gte: sevenDaysAgo } },
        orderBy: { date: 'asc' },
      })
    : []

  const totalViews    = analytics.reduce((sum: number, a: AnalyticsDay) => sum + a.pageViews, 0)
  const totalClicks   = analytics.reduce((sum: number, a: AnalyticsDay) => sum + a.clicks, 0)
  const totalVisitors = analytics.reduce((sum: number, a: AnalyticsDay) => sum + a.visitors, 0)

  const trialDaysLeft = subscription?.trialEndsAt
    ? Math.max(0, Math.ceil((subscription.trialEndsAt.getTime() - Date.now()) / 86400000))
    : 30

  return (
    <DashboardOverview
      user={{ name: user.name, email: user.email }}
      store={store ? {
        id: store.id,
        name: store.name,
        slug: store.slug,
        isPublished: store.isPublished,
        productCount: store._count.products,
        storeUrl: getStoreUrl(store.slug, store.customDomain?.domain),
        createdAt: store.createdAt.toISOString(),
      } : null}
      subscription={{
        status: subscription?.status || 'TRIAL',
        trialDaysLeft,
        currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString(),
      }}
      stats={{ totalViews, totalClicks, totalVisitors }}
      analyticsData={analytics.map((a: AnalyticsDay) => ({
        date: a.date.toISOString().split('T')[0],
        pageViews: a.pageViews,
        clicks: a.clicks,
        visitors: a.visitors,
      }))}
    />
  )
}
