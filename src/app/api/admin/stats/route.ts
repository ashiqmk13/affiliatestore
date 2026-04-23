// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest) {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [totalUsers, totalStores, totalProducts, subscriptionCounts] = await Promise.all([
    db.user.count(),
    db.store.count(),
    db.product.count(),
    db.subscription.groupBy({ by: ['status'], _count: { status: true } }),
  ])

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const [newUsersThisWeek, newStoresThisWeek] = await Promise.all([
    db.user.count({ where: { createdAt: { gte: weekAgo } } }),
    db.store.count({ where: { createdAt: { gte: weekAgo } } }),
  ])

  const subStats = subscriptionCounts.reduce((acc: Record<string, number>, s: { status: string; _count: { status: number } }) => {
    acc[s.status] = s._count.status
    return acc
  }, {})

  const recentLogs = await db.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  })

  return NextResponse.json({
    stats: {
      totalUsers, totalStores, totalProducts,
      newUsersThisWeek, newStoresThisWeek,
      subscriptions: subStats,
    },
    recentActivity: recentLogs.map((l: { id: string; action: string; createdAt: Date; user: { name: string | null; email: string } | null }) => ({
      id: l.id,
      action: l.action,
      user: l.user?.name || l.user?.email || 'Unknown',
      createdAt: l.createdAt.toISOString(),
    })),
  })
}
