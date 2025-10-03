import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('123456', 10);

  // Superadmin
  await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: { password, role: UserRole.SUPERADMIN },
    create: { username: 'superadmin', password, role: UserRole.SUPERADMIN, name: 'Super Admin', email: 'superadmin@example.com' },
  });

  // KAPROG Marketing
  const marketingDept = await prisma.department.upsert({
    where: { code: 'MKT' },
    update: {},
    create: { name: 'Marketing', code: 'MKT' },
  });

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
    },
  });

  // KAPROG IT
  const itDept = await prisma.department.upsert({
    where: { code: 'IT' },
    update: {},
    create: { name: 'IT', code: 'IT' },
  });

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
    },
  });

  console.log('✅ Seed selesai');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
