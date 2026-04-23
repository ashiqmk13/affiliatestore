// src/app/admin/settings/page.tsx
import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllSettings } from '@/lib/settings'
import AdminSettingsClient from '@/components/admin/AdminSettingsClient'

export default async function AdminSettingsPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') redirect('/dashboard')
  const settings = await getAllSettings()
  return <AdminSettingsClient settings={settings} />
}
