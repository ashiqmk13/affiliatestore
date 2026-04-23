// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createSession, setSessionCookie } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = schema.parse(body)

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })

    const passwordHash = await hashPassword(password)
    const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        emailVerified: new Date(), // auto-verify for now
        subscription: {
          create: {
            status: 'TRIAL',
            trialEndsAt,
          },
        },
      },
    })

    const token = await createSession(user.id)
    setSessionCookie(token)

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name || 'there').catch(console.error)

    await db.auditLog.create({
      data: { userId: user.id, action: 'register' },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0]?.message || 'Invalid input' }, { status: 400 })
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
