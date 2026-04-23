// src/app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  type: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const { email, otp, type } = schema.parse(await req.json())
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })

    const token = await db.otpToken.findFirst({
      where: { userId: user.id, token: otp, type, used: false, expiresAt: { gt: new Date() } },
    })
    if (!token) return NextResponse.json({ error: 'OTP is invalid or has expired' }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
