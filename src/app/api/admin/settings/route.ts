// src/app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { getAllSettings, setSetting } from '@/lib/settings'
import { z } from 'zod'

async function requireAdmin() {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') return null
  return user
}

export async function GET(_req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const settings = await getAllSettings()
  return NextResponse.json({ settings })
}

const updateSchema = z.record(z.string(), z.string())

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const updates = updateSchema.parse(await req.json())

    // Allowed keys only (security guard)
    const allowed = [
      'platform_name', 'platform_domain', 'platform_tagline',
      'support_email', 'subscription_price', 'trial_days',
      'maintenance_mode', 'allow_registrations', 'smtp_from_name',
    ]

    for (const [key, value] of Object.entries(updates)) {
      if (allowed.includes(key)) {
        await setSetting(key, value)
      }
    }

    await db.auditLog.create({
      data: { userId: admin.id, action: 'SETTINGS_UPDATE', metadata: updates },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
