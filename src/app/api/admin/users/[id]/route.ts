// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

async function requireAdmin() {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') return null
  return user
}

const actionSchema = z.object({
  action: z.enum(['promote', 'demote', 'delete', 'extend_trial']),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const user = await db.user.findUnique({
    where: { id: params.id },
    include: {
      store: { include: { _count: { select: { products: true } }, customDomain: true } },
      subscription: true,
    },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (params.id === admin.id) {
    return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 })
  }

  try {
    const { action } = actionSchema.parse(await req.json())

    if (action === 'promote') {
      await db.user.update({ where: { id: params.id }, data: { role: 'ADMIN' } })
    } else if (action === 'demote') {
      await db.user.update({ where: { id: params.id }, data: { role: 'USER' } })
    } else if (action === 'extend_trial') {
      const newEnd = new Date()
      newEnd.setDate(newEnd.getDate() + 30)
      await db.subscription.upsert({
        where: { userId: params.id },
        update: { trialEndsAt: newEnd, status: 'TRIAL' },
        create: { userId: params.id, status: 'TRIAL', trialEndsAt: newEnd },
      })
    } else if (action === 'delete') {
      await db.user.delete({ where: { id: params.id } })
    }

    await db.auditLog.create({
      data: { userId: admin.id, action: `ADMIN_${action.toUpperCase()}`, entityId: params.id, entity: 'User' },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
