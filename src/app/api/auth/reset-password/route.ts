// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = schema.parse(await req.json())
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const token = await db.otpToken.findFirst({
      where: { userId: user.id, token: otp, type: 'password_reset', used: false, expiresAt: { gt: new Date() } },
    })
    if (!token) return NextResponse.json({ error: 'OTP is invalid or has expired' }, { status: 400 })

    const passwordHash = await hashPassword(newPassword)
    await db.user.update({ where: { id: user.id }, data: { passwordHash } })
    await db.otpToken.update({ where: { id: token.id }, data: { used: true } })
    // Invalidate all sessions
    await db.session.deleteMany({ where: { userId: user.id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
