// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateOTP } from '@/lib/auth'
import { sendOTPEmail } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  try {
    const { email } = schema.parse(await req.json())
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })

    // Always return success to prevent email enumeration
    if (!user) return NextResponse.json({ success: true })

    // Invalidate old OTPs
    await db.otpToken.updateMany({
      where: { userId: user.id, type: 'password_reset', used: false },
      data: { used: true },
    })

    const otp = generateOTP()
    await db.otpToken.create({
      data: {
        userId: user.id,
        token: otp,
        type: 'password_reset',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    await sendOTPEmail(user.email, otp, 'reset')
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
