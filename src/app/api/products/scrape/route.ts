// src/app/api/products/scrape/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { scrapeProductFromUrl } from '@/lib/scraper'
import { isValidUrl } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({ url: z.string().url() })

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { url } = schema.parse(await req.json())
    if (!isValidUrl(url)) return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })

    const product = await scrapeProductFromUrl(url)
    return NextResponse.json(product)
  } catch (err: any) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    console.error('Scrape error:', err.message)
    return NextResponse.json({ error: err.message || 'Failed to load product details' }, { status: 422 })
  }
}
