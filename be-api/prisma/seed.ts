import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import * as QRCode from 'qrcode'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Mulai seeding database...')
  const password = await bcrypt.hash('123456', 10)

  // ========================
  // DEPARTMENTS
  // ========================
  const itDept = await prisma.department.upsert({
    where: { code: 'IT01' },
    update: {},
    create: { name: 'IT', code: 'IT01' },
  })

  const marketingDept = await prisma.department.upsert({
    where: { code: 'MKT01' },
    update: {},
    create: { name: 'Marketing', code: 'MKT01' },
  })

  console.log('✅ Department siap')

  // ========================
  // BARCODES
  // ========================
  const barcodes = [
    {
      value: 'QR-IT-001',
      departmentId: itDept.id,
      departmentName: itDept.name,
      latitude: -6.200000,
      longitude: 106.816666,
    },
    {
      value: 'QR-MKT-001',
      departmentId: marketingDept.id,
      departmentName: marketingDept.name,
      latitude: -6.210000,
      longitude: 106.820000,
    },
  ]

  const qrDir = './prisma/qrcodes'
  if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true })

  for (const data of barcodes) {
    const barcode = await prisma.barcode.upsert({
      where: { value: data.value }, // ✅ pakai unique field `value`
      update: {
        latitude: data.latitude,
        longitude: data.longitude,
        departmentName: data.departmentName,
      },
      create: data,
    })

    // ✅ Generate QR file pakai value-nya
    const qrPath = `${qrDir}/${barcode.value}.png`
    await QRCode.toFile(qrPath, barcode.value)

    console.log(`✅ Barcode ${barcode.value} saved at ${qrPath}`)
  }

  // ========================
  // USERS
  // ========================

  // Superadmin
  await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: { password, role: UserRole.SUPERADMIN },
    create: {
      username: 'superadmin',
      password,
      role: UserRole.SUPERADMIN,
      name: 'Super Admin',
      email: 'superadmin@example.com',
    },
  })

  // Kaprog IT
  await prisma.user.upsert({
    where: { username: 'alhizam' },
    update: { password, role: UserRole.KAPROG },
    create: {
      username: 'alhizam',
      password,
      role: UserRole.KAPROG,
      name: 'Alhizam Kaprog',
      email: 'alhizam@company.com',
      departmentId: itDept.id,
      departmentName: itDept.name,
    },
  })

  // Kaprog Marketing
  await prisma.user.upsert({
    where: { username: 'mia' },
    update: { password, role: UserRole.KAPROG },
    create: {
      username: 'mia',
      password,
      role: UserRole.KAPROG,
      name: 'Mia Kaprog',
      email: 'mia@company.com',
      departmentId: marketingDept.id,
      departmentName: marketingDept.name,
    },
  })

  // Pekerja IT
  await prisma.user.upsert({
    where: { username: 'budi' },
    update: { password, role: UserRole.PEKERJA },
    create: {
      username: 'budi',
      password,
      role: UserRole.PEKERJA,
      name: 'Budi Pekerja',
      email: 'budi@company.com',
      departmentId: itDept.id,
      departmentName: itDept.name,
    },
  })

  // Pekerja Marketing
  await prisma.user.upsert({
    where: { username: 'siti' },
    update: { password, role: UserRole.PEKERJA },
    create: {
      username: 'siti',
      password,
      role: UserRole.PEKERJA,
      name: 'Siti Pekerja',
      email: 'siti@company.com',
      departmentId: marketingDept.id,
      departmentName: marketingDept.name,
    },
  })

  console.log('✅ Users siap')
  console.log('🎉 Seed selesai — Department, Barcode, dan User berhasil dibuat!')
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
