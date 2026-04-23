// src/lib/settings.ts
import { db } from './db'

interface SettingRow { key: string; value: string }

export async function getSetting(key: string): Promise<string | null> {
  const s = await db.platformSettings.findUnique({ where: { key } })
  return s?.value ?? null
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await db.platformSettings.findMany({ where: { key: { in: keys } } })
  return Object.fromEntries((rows as SettingRow[]).map((r) => [r.key, r.value]))
}

export async function setSetting(key: string, value: string) {
  return db.platformSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.platformSettings.findMany()
  return Object.fromEntries((rows as SettingRow[]).map((r) => [r.key, r.value]))
}
