// src/app/api/billing/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata.userId
        if (!userId) break

        await db.subscription.update({
          where: { userId },
          data: {
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id,
            status: sub.status === 'active' ? 'ACTIVE' : sub.status === 'past_due' ? 'PAST_DUE' : 'CANCELED',
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata.userId
        if (!userId) break

        await db.subscription.update({
          where: { userId },
          data: { status: 'CANCELED', canceledAt: new Date() },
        })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const userId = sub.metadata.userId
          if (userId) {
            await db.subscription.update({
              where: { userId },
              data: { status: 'ACTIVE' },
            })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const userId = sub.metadata.userId
          if (userId) {
            await db.subscription.update({
              where: { userId },
              data: { status: 'PAST_DUE' },
            })
          }
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
  }

  return NextResponse.json({ received: true })
}
