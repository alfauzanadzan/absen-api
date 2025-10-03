import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import * as QRCode from 'qrcode'
import * as fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
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

  // ========================
  // BARCODES
  // ========================
  const barcodes = [
    { departmentId: itDept.id, latitude: -6.200000, longitude: 106.816666 },
    { departmentId: marketingDept.id, latitude: -6.210000, longitude: 106.820000 },
  ]

  const qrDir = './prisma/qrcodes'
  if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true })

  for (const data of barcodes) {
    const value = uuidv4()

    // Upsert: 1 barcode per department
    const barcode = await prisma.barcode.upsert({
      where: { departmentId: data.departmentId },
      update: {
        value,
        latitude: data.latitude,
        longitude: data.longitude,
      },
      create: {
        value,
        departmentId: data.departmentId,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    })

    // Save QR file
    const qrPath = `${qrDir}/${barcode.id}.png`
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
      departmentName: itDept.name, // snapshot
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

  console.log('✅ Seed selesai — Department, Barcode & User siap!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
