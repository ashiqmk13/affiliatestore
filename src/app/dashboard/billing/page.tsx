// src/app/dashboard/billing/page.tsx
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import BillingClient from '@/components/dashboard/BillingClient'

export default async function BillingPage() {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login')

  const subscription = await db.subscription.findUnique({ where: { userId: user.id } })

  return (
    <BillingClient
      subscription={subscription ? {
        status: subscription.status,
        trialEndsAt: subscription.trialEndsAt?.toISOString() || null,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        canceledAt: subscription.canceledAt?.toISOString() || null,
      } : null}
    />
  )
}
