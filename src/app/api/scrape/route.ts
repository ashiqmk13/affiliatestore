// src/app/api/scrape/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { scrapeProductFromUrl } from '@/lib/scraper'
import { z } from 'zod'

const schema = z.object({ url: z.string().url() })

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { url } = schema.parse(await req.json())
    const product = await scrapeProductFromUrl(url)
    return NextResponse.json({ product })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    console.error('Scrape error:', err)
    return NextResponse.json({ error: 'Failed to fetch product details. You can add them manually.' }, { status: 422 })
  }
}
