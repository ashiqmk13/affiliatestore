// src/app/api/billing/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { createCheckoutSession, createStripeCustomer } from '@/lib/stripe'

export async function POST(_req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let subscription = await db.subscription.findUnique({ where: { userId: user.id } })

  let customerId = subscription?.stripeCustomerId

  if (!customerId) {
    const customer = await createStripeCustomer(user.email, user.name || undefined)
    customerId = customer.id
    await db.subscription.upsert({
      where: { userId: user.id },
      update: { stripeCustomerId: customerId },
      create: { userId: user.id, stripeCustomerId: customerId, status: 'TRIAL' },
    })
  }

  const session = await createCheckoutSession(customerId, user.id)
  return NextResponse.json({ url: session.url })
}
