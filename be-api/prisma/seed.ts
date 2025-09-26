// prisma/seed.ts
// Script seed yang ditulis agar lebih tahan terhadap mismatch tipe yang sering muncul
// - Menggunakan `username` sebagai unique key di `where` (lebih aman jika `email` tidak di-set unique di generated types)
// - Meng-cast payload ke `any` untuk menghindari error TypeScript di environment yang client-nya belum digenerate
// Pastikan: jalankan `npx prisma generate` sebelum menjalankan seed ini.

import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function upsertUser(opts: {
  username: string
  email?: string
  name?: string
  position?: string
  role: string
  passwordPlain: string
}) {
  const { username, email, name, position, role, passwordPlain } = opts
  const password = await bcrypt.hash(passwordPlain, 10)

  return prisma.user.upsert({
    where: { username },
    // cast ke any supaya script ini tetap compile walau generated types belum sinkron
    update: ({
      password,
      role,
      ...(name ? { name } : {}),
      ...(position ? { position } : {}),
      ...(email ? { email } : {}),
    } as any),
    create: ({
      username,
      email,
      name,
      position,
      password,
      role,
    } as any),
  })
}

async function main() {
  await upsertUser({
    username: "superadmin",
    email: "superadmin@example.com",
    name: "Super Admin",
    role: "SUPER_ADMIN",
    passwordPlain: "superadmin123",
  })
  console.log("⚡ Super Admin password direset ke superadmin123")

  await upsertUser({
    username: "admin",
    email: "admin@example.com",
    name: "Admin Satu",
    role: "ADMIN",
    passwordPlain: "admin123",
  })
  console.log("⚡ Admin password direset ke admin123")

  await upsertUser({
    username: "kaprog",
    email: "kaprog@example.com",
    name: "Kaprogram A",
    position: "Kepala Program",
    role: "KAPROG",
    passwordPlain: "kaprog123",
  })
  console.log("⚡ Kaprog password direset ke kaprog123")
}

main()
  .catch((e) => {
    console.error("❌ Error saat seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
