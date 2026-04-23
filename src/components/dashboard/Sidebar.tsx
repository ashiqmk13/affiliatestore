'use client'
// src/components/dashboard/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Store, Package, BarChart2, Globe,
  CreditCard, Settings, LogOut, ChevronRight, Zap,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/store', icon: Store, label: 'My Store' },
  { href: '/dashboard/products', icon: Package, label: 'Products' },
  { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/dashboard/domain', icon: Globe, label: 'Domain' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

interface Props {
  user: { name?: string | null; email: string; role: string }
}

export default function DashboardSidebar({ user }: Props) {
  const pathname = usePathname()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/auth/login'
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col z-40 hidden lg:flex">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-700 text-white text-lg leading-none">Sample Website</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto sidebar-scroll">
        <div className="space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-brand-900/40 text-brand-300 border border-brand-700/30'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                )}
              >
                <item.icon className={cn('w-4 h-4 shrink-0', active ? 'text-brand-400' : 'text-white/40 group-hover:text-white/70')} />
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto text-brand-600" />}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03]">
          <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-xs font-700 text-white shrink-0">
            {getInitials(user.name || user.email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name || 'User'}</p>
            <p className="text-xs text-white/40 truncate">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="text-white/30 hover:text-red-400 transition-colors p-1" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
