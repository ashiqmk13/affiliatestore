// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display text-8xl font-800 gradient-text mb-4">404</p>
        <h1 className="font-display text-2xl font-700 text-white mb-2">Page not found</h1>
        <p className="text-white/40 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-medium transition-all">
          Go home
        </Link>
      </div>
    </div>
  )
}
