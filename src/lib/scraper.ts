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

function cleanText(text?: string) {
  return text?.replace(/\s+/g, ' ').trim()
}

function extractPrice(raw?: string) {
  if (!raw) return undefined

  const cleaned = raw
    .replace(/,/g, '')
    .replace(/[^\d.]/g, '')

  const price = parseFloat(cleaned)

  return !isNaN(price) && price > 0 ? price : undefined
}

function absoluteUrl(src: string, baseUrl: string) {
  try {
    return new URL(src, baseUrl).toString()
  } catch {
    return src
  }
}

export async function scrapeProductFromUrl(url: string): Promise<ScrapedProduct> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`)

  const html = await res.text()
  const $ = cheerio.load(html)

  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('[itemprop="name"]').first().text() ||
    $('h1').first().text() ||
    $('title').first().text()

  const description =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="twitter:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    $('[itemprop="description"]').first().text() ||
    $('#feature-bullets').text()

  const images = new Set<string>()

  const imageSelectors = [
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
  ]

  for (const sel of imageSelectors) {
    const img = $(sel).attr('content')
    if (img) images.add(absoluteUrl(img, url))
  }

  const htmlImageSelectors = [
    '#landingImage',
    '#imgBlkFront',
    '[itemprop="image"]',
    '.product-image img',
    '.product__media img',
    '.product-gallery img',
    'img',
  ]

  for (const sel of htmlImageSelectors) {
    $(sel).each((_, el) => {
      const src =
        $(el).attr('src') ||
        $(el).attr('data-src') ||
        $(el).attr('data-original') ||
        $(el).attr('data-old-hires')

      if (src && !src.startsWith('data:')) {
        images.add(absoluteUrl(src, url))
      }
    })
  }

  let price: number | undefined
  let originalPrice: number | undefined

  const priceSelectors = [
    'meta[property="product:price:amount"]',
    'meta[itemprop="price"]',
    '[itemprop="price"]',
    '[data-price]',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-price .a-offscreen',
    '.a-price-whole',
    '.price',
    '.product-price',
    '.offer-price',
    '.sale-price',
    '.current-price',
    '.money',
  ]

  for (const sel of priceSelectors) {
    const el = $(sel).first()
    if (!el.length) continue

    const raw =
      el.attr('content') ||
      el.attr('data-price') ||
      el.text()

    const parsed = extractPrice(raw)
    if (parsed) {
      price = parsed
      break
    }
  }

  const originalPriceSelectors = [
    '.list-price',
    '.was-price',
    '.original-price',
    '.price--compare',
    '.a-text-price .a-offscreen',
  ]

  for (const sel of originalPriceSelectors) {
    const raw = $(sel).first().text()
    const parsed = extractPrice(raw)
    if (parsed) {
      originalPrice = parsed
      break
    }
  }

  const currency =
    $('meta[property="product:price:currency"]').attr('content') ||
    $('[itemprop="priceCurrency"]').attr('content') ||
    (html.includes('₹') ? 'INR' : html.includes('$') ? 'USD' : 'USD')

  return {
    name: cleanText(title)?.slice(0, 200) || 'Untitled Product',
    description: cleanText(description)?.slice(0, 2000),
    price,
    originalPrice,
    currency,
    imageUrls: Array.from(images).slice(0, 8),
    affiliateUrl: url,
  }
}