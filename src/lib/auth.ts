// src/lib/auth.ts
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!
const SESSION_COOKIE = 'as_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: object, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions)
}

export function verifyToken<T>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T
  } catch {
    return null
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createSession(userId: string, metadata?: { ip?: string; ua?: string }) {
  const token = generateToken({ userId }, '7d')
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress: metadata?.ip,
      userAgent: metadata?.ua,
    },
  })

  return token
}

export async function getSessionUser() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return null

    const payload = verifyToken<{ userId: string }>(token)
    if (!payload) return null

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) return null
    return session.user
  } catch {
    return null
  }
}

export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE)
}

export async function invalidateSession(token: string) {
  await db.session.deleteMany({ where: { token } })
}
