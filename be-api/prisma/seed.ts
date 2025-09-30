import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // --- SEED DEPARTMENT ---
  const existingDepartments = await prisma.department.findMany()
  if (existingDepartments.length === 0) {
    await prisma.department.createMany({
      data: [
        { name: 'IT', code: 'IT' },
        { name: 'MARKETING', code: 'MKT' },
      ],
    })
    console.log('✅ Departments IT & MARKETING berhasil dibuat')
  } else {
    console.log('⚡ Departments sudah ada, skip seeding')
  }

  // --- SEED SUPERADMIN ---
  const hashedPassword = await bcrypt.hash('password123', 10)
  await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPERADMIN',
    },
  })
  console.log('✅ Superadmin berhasil dibuat / sudah ada')
}

main()
  .then(async () => {
    console.log('🎉 Seeding selesai')
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
