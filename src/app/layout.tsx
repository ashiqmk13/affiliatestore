// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Sample Website – Launch Your Affiliate Store', template: '%s | Sample Website' },
  description: 'Build and launch your affiliate store in minutes. No coding required.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head />
      <body className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  )
}
