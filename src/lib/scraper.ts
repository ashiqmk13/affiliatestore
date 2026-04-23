// src/lib/scraper.ts
import * as cheerio from 'cheerio'

export interface ScrapedProduct {
  name: string
  description?: string
  price?: number
  originalPrice?: number
  currency?: string
  imageUrls: string[]
  affiliateUrl: string
}

export async function scrapeProductFromUrl(url: string): Promise<ScrapedProduct> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AffiliateStoreBot/1.0)',
      Accept: 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`)

  const html = await res.text()
  const $ = cheerio.load(html)

  // Open Graph data first
  const ogTitle = $('meta[property="og:title"]').attr('content')
  const ogDesc = $('meta[property="og:description"]').attr('content')
  const ogImage = $('meta[property="og:image"]').attr('content')
  const ogSiteName = $('meta[property="og:site_name"]').attr('content')

  // Fallbacks
  const title = ogTitle || $('title').first().text() || $('h1').first().text()
  const description = ogDesc || $('meta[name="description"]').attr('content')

  // Images
  const images: string[] = []
  if (ogImage) images.push(ogImage)

  // Product images fallback
  $('img[itemprop="image"], img.product-image, #landingImage, .product-image img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src')
    if (src && !images.includes(src)) images.push(src)
  })

  // Price extraction
  let price: number | undefined
  let originalPrice: number | undefined

  const priceSelectors = [
    '[itemprop="price"]',
    '.price',
    '#priceblock_ourprice',
    '.a-price-whole',
    '[data-price]',
    '.product-price',
    '.offer-price',
  ]

  for (const sel of priceSelectors) {
    const el = $(sel).first()
    if (el.length) {
      const raw = el.attr('content') || el.text()
      const cleaned = raw.replace(/[^0-9.]/g, '')
      const parsed = parseFloat(cleaned)
      if (!isNaN(parsed) && parsed > 0) {
        price = parsed
        break
      }
    }
  }

  return {
    name: title?.trim().slice(0, 200) || 'Untitled Product',
    description: description?.trim().slice(0, 2000),
    price,
    originalPrice,
    currency: 'USD',
    imageUrls: images.slice(0, 5).filter(Boolean),
    affiliateUrl: url,
  }
}
