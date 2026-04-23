// src/app/dashboard/store/page.tsx
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import StoreClient from '@/components/dashboard/StoreClient'
import { getStoreUrl } from '@/lib/utils'

export default async function StorePage() {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login')

  const store = await db.store.findUnique({
    where: { userId: user.id },
    include: { customDomain: true },
  })

  return (
    <StoreClient
      initialStore={store ? {
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description || '',
        themeColor: store.themeColor,
        currency: store.currency,
        language: store.language,
        metaTitle: store.metaTitle || '',
        metaDescription: store.metaDescription || '',
        isPublished: store.isPublished,
        logoUrl: store.logoUrl || '',
        storeUrl: getStoreUrl(store.slug, store.customDomain?.domain),
      } : null}
    />
  )
}
