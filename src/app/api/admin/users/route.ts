// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'

async function requireAdmin() {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') return null
  return user
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 25
  const skip = (page - 1) * pageSize

  const where = q
    ? { OR: [{ email: { contains: q, mode: 'insensitive' as const } }, { name: { contains: q, mode: 'insensitive' as const } }] }
    : {}

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        createdAt: true, emailVerified: true,
        store: { select: { id: true, name: true, slug: true, isPublished: true } },
        subscription: { select: { status: true, trialEndsAt: true, currentPeriodEnd: true } },
      },
    }),
    db.user.count({ where }),
  ])

  return NextResponse.json({ users, total, page, pageSize })
}
