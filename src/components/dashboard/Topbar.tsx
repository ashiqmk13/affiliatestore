'use client'
// src/components/dashboard/Topbar.tsx
import { Bell, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const labels: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/store': 'My Store',
  '/dashboard/products': 'Products',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/domain': 'Domain',
  '/dashboard/billing': 'Billing',
  '/dashboard/settings': 'Settings',
}

interface Props {
  user: { name?: string | null }
}

export default function DashboardTopbar({ user }: Props) {
  const pathname = usePathname()
  const title = Object.entries(labels).find(([k]) => pathname === k || (k !== '/dashboard' && pathname.startsWith(k)))?.[1] || 'Dashboard'

  return (
    <header className="h-16 px-6 lg:px-8 flex items-center justify-between border-b border-white/5 bg-[#080808]/80 backdrop-blur-md sticky top-0 z-30">
      <div>
        <h1 className="font-display font-700 text-white text-lg">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/store"
          className="hidden sm:inline-flex items-center gap-2 text-xs text-white/50 hover:text-white/80 border border-white/10 px-3 py-1.5 rounded-lg transition-all hover:border-white/20"
        >
          <ExternalLink className="w-3.5 h-3.5" /> View Store
        </Link>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
          <Bell className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  )
}
