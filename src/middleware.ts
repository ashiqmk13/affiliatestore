// src/middleware.ts
// Edge-compatible middleware — does NOT import bcrypt/jsonwebtoken
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/',
  '/auth/',
  '/store/',
  '/api/store/',
  '/api/auth/',
  '/api/billing/webhook',
]

function isPublic(pathname: string): boolean {
  if (pathname === '/') return true
  return PUBLIC_PATHS.some(p => pathname.startsWith(p))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    isPublic(pathname)
  ) {
    return NextResponse.next()
  }

  // Check session cookie exists (full JWT verification happens in route handlers)
  const token = req.cookies.get('as_session')?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
