// src/app/admin/users/page.tsx
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import AdminUsersClient from '@/components/admin/AdminUsersClient'

export default async function AdminUsersPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') redirect('/dashboard')

  const users = await db.user.findMany({
    take: 25,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, role: true,
      createdAt: true, emailVerified: true,
      store: { select: { name: true, slug: true, isPublished: true } },
      subscription: { select: { status: true, trialEndsAt: true, currentPeriodEnd: true } },
    },
  })

  const total = await db.user.count()

  return <AdminUsersClient users={users as any} total={total} currentUserId={user.id} />
}
