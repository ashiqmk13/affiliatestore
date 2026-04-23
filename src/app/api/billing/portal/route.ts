// src/app/api/billing/portal/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { createPortalSession } from '@/lib/stripe'

export async function POST(_req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const subscription = await db.subscription.findUnique({ where: { userId: user.id } })
  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 400 })
  }

  const session = await createPortalSession(subscription.stripeCustomerId)
  return NextResponse.json({ url: session.url })
}
