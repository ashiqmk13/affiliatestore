'use client'
// src/components/admin/AdminSidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Settings, Store, BarChart2, LogOut, Shield, ChevronRight } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

const nav = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/stores', icon: Store, label: 'Stores' },
  { href: '/admin/settings', icon: Settings, label: 'Platform Settings' },
]

export default function AdminSidebar({ user }: { user: { name?: string | null; email: string } }) {
  const pathname = usePathname()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/auth/login'
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col z-40 hidden lg:flex">
      <div className="h-16 px-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center">
          <Shield className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="font-display font-700 text-white text-sm leading-none">Admin Panel</p>
          <p className="text-xs text-white/30 mt-0.5">Sample Website</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-amber-900/30 text-amber-300 border border-amber-700/30'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              )}
            >
              <item.icon className={cn('w-4 h-4 shrink-0', active ? 'text-amber-400' : 'text-white/40 group-hover:text-white/70')} />
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-amber-600" />}
            </Link>
          )
        })}

        <div className="pt-4 border-t border-white/5 mt-4">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
            <Store className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03]">
          <div className="w-8 h-8 rounded-lg bg-amber-700 flex items-center justify-center text-xs font-700 text-white shrink-0">
            {getInitials(user.name || user.email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name || 'Admin'}</p>
            <p className="text-xs text-amber-400/60">Administrator</p>
          </div>
          <button onClick={logout} className="text-white/30 hover:text-red-400 transition-colors p-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
