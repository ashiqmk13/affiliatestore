// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = schema.parse(body)

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const ip = req.headers.get('x-forwarded-for') || req.ip
    const ua = req.headers.get('user-agent') || undefined
    const token = await createSession(user.id, { ip: ip || undefined, ua })
    setSessionCookie(token)

    await db.auditLog.create({
      data: { userId: user.id, action: 'login', ipAddress: ip || undefined },
    })

    return NextResponse.json({ success: true, role: user.role })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
