// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Platform settings
  const settings = [
    { key: 'platform_name', value: 'Sample Website' },
    { key: 'platform_domain', value: 'samplewebsite.com' },
    { key: 'platform_tagline', value: 'Launch your affiliate store in minutes' },
    { key: 'support_email', value: 'support@samplewebsite.com' },
    { key: 'subscription_price', value: '13' },
    { key: 'trial_days', value: '30' },
    { key: 'maintenance_mode', value: 'false' },
  ]

  for (const s of settings) {
    await prisma.platformSettings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    })
  }

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@samplewebsite.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456'
  const hash = await bcrypt.hash(adminPassword, 12)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      passwordHash: hash,
      emailVerified: new Date(),
      role: 'ADMIN',
    },
  })

  console.log('✅ Seed completed')
  console.log(`Admin: ${adminEmail} / ${adminPassword}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
