import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Super Admin
  await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: { name: 'Super Admin' },
    create: {
      username: 'superadmin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      name: 'Super Admin',
      position: 'System Owner',
      role: "SUPERADMIN",   // ✅ string
    },
  });

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { name: 'Admin Satu' },
    create: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin Satu',
      position: 'Admin Umum',
      role: "ADMIN",   // ✅ string
    },
  });

  // Kaprog
  await prisma.user.upsert({
    where: { email: 'kaprog@example.com' },
    update: { name: 'Kaprogram A' },
    create: {
      username: 'kaprog',
      email: 'kaprog@example.com',
      password: hashedPassword,
      name: 'Kaprogram A',
      position: 'Kepala Program',
      role: "KAPROG",   // ✅ string
    },
  });

  // Pekerja
  await prisma.user.upsert({
    where: { email: 'pekerja@example.com' },
    update: { name: 'Pekerja 1' },
    create: {
      username: 'pekerja',
      email: 'pekerja@example.com',
      password: hashedPassword,
      name: 'Pekerja 1',
      position: 'Staff Produksi',
      role: "PEKERJA",   // ✅ string
    },
  });
}

main()
  .then(() => {
    console.log('✅ Database seeded successfully');
  })
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
