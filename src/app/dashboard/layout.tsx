// src/app/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import DashboardSidebar from '@/components/dashboard/Sidebar'
import DashboardTopbar from '@/components/dashboard/Topbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-[#080808] flex">
      <DashboardSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <DashboardTopbar user={user} />
        <main className="flex-1 p-6 lg:p-8 overflow-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  )
}
