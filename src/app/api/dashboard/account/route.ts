// src/app/api/dashboard/account/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(1).max(100),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function GET(_req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const full = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true, emailVerified: true },
  })

  return NextResponse.json({ user: full })
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()

    if (body.type === 'password') {
      const { currentPassword, newPassword } = passwordSchema.parse(body)
      const full = await db.user.findUnique({ where: { id: user.id } })
      if (!full?.passwordHash) return NextResponse.json({ error: 'No password set' }, { status: 400 })

      const valid = await verifyPassword(currentPassword, full.passwordHash)
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

      const hash = await hashPassword(newPassword)
      await db.user.update({ where: { id: user.id }, data: { passwordHash: hash } })
      // Invalidate all sessions
      await db.session.deleteMany({ where: { userId: user.id } })
      return NextResponse.json({ success: true, reauth: true })
    }

    const { name } = profileSchema.parse(body)
    await db.user.update({ where: { id: user.id }, data: { name } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
