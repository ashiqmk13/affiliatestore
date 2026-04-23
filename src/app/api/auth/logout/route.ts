// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { invalidateSession, clearSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = cookies().get('as_session')?.value
  if (token) await invalidateSession(token)
  clearSessionCookie()
  return NextResponse.json({ success: true })
}
