import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // SUPER ADMIN
  const superAdminPassword = await bcrypt.hash("superadmin123", 10)
  await prisma.user.upsert({
    where: { email: "superadmin@example.com" }, 
    update: {
      username: "superadmin",
      name: "Super Admin",   // 👈 WAJIB
      password: superAdminPassword,
      role: "SUPER_ADMIN",
    },
    create: {
      username: "superadmin",
      email: "superadmin@example.com",
      name: "Super Admin",   // 👈 WAJIB
      password: superAdminPassword,
      role: "SUPER_ADMIN",
    },
  })
  console.log("⚡ Super Admin password direset ke superadmin123")

  // ADMIN
  const adminPassword = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      username: "admin",
      name: "Admin Satu",   // 👈 WAJIB
      password: adminPassword,
      role: "ADMIN",
    },
    create: {
      username: "admin",
      email: "admin@example.com",
      name: "Admin Satu",   // 👈 WAJIB
      password: adminPassword,
      role: "ADMIN",
    },
  })
  console.log("⚡ Admin password direset ke admin123")

  // KAPROG
  const kaprogPassword = await bcrypt.hash("kaprog123", 10)
  await prisma.user.upsert({
    where: { email: "kaprog@example.com" },
    update: {
      username: "kaprog",
      name: "Kaprogram A",   // 👈 WAJIB
      position: "Kepala Program", // 👈 OPSIONAL
      password: kaprogPassword,
      role: "KAPROG",
    },
    create: {
      username: "kaprog",
      email: "kaprog@example.com",
      name: "Kaprogram A",   // 👈 WAJIB
      position: "Kepala Program", // 👈 OPSIONAL
      password: kaprogPassword,
      role: "KAPROG",
    },
  })
  console.log("⚡ Kaprog password direset ke kaprog123")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Error saat seed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
