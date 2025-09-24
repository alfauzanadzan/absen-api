import { PrismaClient, UserRole } from "@prisma/client"
import * as bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // SUPERADMIN
  const superAdminPassword = await bcrypt.hash("superadmin123", 10)
  await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {
      username: "superadmin",
      name: "Super Admin",
      password: superAdminPassword,
      role: UserRole.SUPERADMIN,
    },
    create: {
      username: "superadmin",
      email: "superadmin@example.com",
      name: "Super Admin",
      password: superAdminPassword,
      role: UserRole.SUPERADMIN,
    },
  })
  console.log("⚡ Super Admin siap")

  // ADMIN
  const adminPassword = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      username: "admin",
      name: "Admin Satu",
      password: adminPassword,
      role: UserRole.ADMIN,
    },
    create: {
      username: "admin",
      email: "admin@example.com",
      name: "Admin Satu",
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })
  console.log("⚡ Admin siap")

  // KAPROG
  const kaprogPassword = await bcrypt.hash("kaprog123", 10)
  await prisma.user.upsert({
    where: { email: "kaprog@example.com" },
    update: {
      username: "kaprog",
      name: "Kaprogram A",
      position: "Kepala Program",
      password: kaprogPassword,
      role: UserRole.KAPROG,
    },
    create: {
      username: "kaprog",
      email: "kaprog@example.com",
      name: "Kaprogram A",
      position: "Kepala Program",
      password: kaprogPassword,
      role: UserRole.KAPROG,
    },
  })
  console.log("⚡ Kaprog siap")

  // PEKERJA
  const pekerjaPassword = await bcrypt.hash("pekerja123", 10)
  await prisma.user.upsert({
    where: { email: "pekerja@example.com" },
    update: {
      username: "pekerja1",
      name: "Pekerja 1",
      position: "Operator Mesin",
      password: pekerjaPassword,
      role: UserRole.PEKERJA,
    },
    create: {
      username: "pekerja1",
      email: "pekerja@example.com",
      name: "Pekerja 1",
      position: "Operator Mesin",
      password: pekerjaPassword,
      role: UserRole.PEKERJA,
    },
  })
  console.log("⚡ Pekerja siap")
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log("✅ Semua user berhasil di-seed")
  })
  .catch(async (e) => {
    console.error("❌ Error saat seed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
