// src/app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#080808] flex">
      <AdminSidebar user={{ name: user.name, email: user.email }} />
      <main className="flex-1 lg:ml-64 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
