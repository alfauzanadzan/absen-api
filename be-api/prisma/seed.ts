import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // SUPER ADMIN
  const superAdminPassword = await bcrypt.hash('superadmin123', 10);
  await prisma.user.upsert({
    where: { email: 'superadmin@example.com' }, // gunakan email sebagai unique field
    update: { password: superAdminPassword },
    create: {
      username: 'superadmin',
      email: 'superadmin@example.com',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('⚡ Super Admin password direset ke superadmin123');

  // ADMIN
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: adminPassword },
    create: {
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('⚡ Admin password direset ke admin123');

  // KAPROG
  const kaprogPassword = await bcrypt.hash('kaprog123', 10);
  await prisma.user.upsert({
    where: { email: 'kaprog@example.com' },
    update: { password: kaprogPassword },
    create: {
      username: 'kaprog',
      email: 'kaprog@example.com',
      password: kaprogPassword,
      role: 'KAPROG',
    },
  });
  console.log('⚡ Kaprog password direset ke kaprog123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
