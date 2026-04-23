// src/app/api/dashboard/domain/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { promises as dns } from 'dns'

export async function POST(_req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const store = await db.store.findUnique({
    where: { userId: user.id },
    include: { customDomain: true },
  })

  if (!store?.customDomain) return NextResponse.json({ error: 'No domain configured' }, { status: 400 })

  const { domain, txtRecord } = store.customDomain

  try {
    // Try to resolve TXT records for the domain
    const records = await dns.resolveTxt(domain)
    const flat = records.flat()
    const verified = flat.some(r => r === txtRecord)

    if (verified) {
      await db.customDomain.update({
        where: { storeId: store.id },
        data: { status: 'VERIFIED', verifiedAt: new Date(), sslEnabled: true },
      })
      return NextResponse.json({ verified: true, status: 'VERIFIED' })
    }

    return NextResponse.json({ verified: false, status: 'PENDING', message: 'TXT record not found yet. DNS changes can take up to 48 hours.' })
  } catch (err) {
    return NextResponse.json({ verified: false, status: 'FAILED', message: 'Could not resolve domain. Check your DNS settings.' })
  }
}
