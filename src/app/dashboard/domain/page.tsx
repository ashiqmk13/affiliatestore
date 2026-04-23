// src/app/dashboard/domain/page.tsx
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import DomainClient from '@/components/dashboard/DomainClient'

export default async function DomainPage() {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login')

  const store = await db.store.findUnique({
    where: { userId: user.id },
    include: { customDomain: true },
  })

  const subscription = await db.subscription.findUnique({ where: { userId: user.id } })
  const isPremium = subscription?.status === 'ACTIVE'
  const defaultUrl = store ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/store/${store.slug}` : null

  return (
    <DomainClient
      domain={store?.customDomain ? {
        domain: store.customDomain.domain,
        status: store.customDomain.status,
        txtRecord: store.customDomain.txtRecord || '',
        sslEnabled: store.customDomain.sslEnabled,
        verifiedAt: store.customDomain.verifiedAt?.toISOString() || null,
      } : null}
      defaultUrl={defaultUrl}
      isPremium={isPremium}
      storeSlug={store?.slug || null}
    />
  )
}
