// src/app/dashboard/settings/page.tsx
import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SettingsClient from '@/components/dashboard/SettingsClient'

export default async function SettingsPage() {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login')
  return <SettingsClient user={{ id: user.id, name: user.name || '', email: user.email, role: user.role }} />
}
