import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const newPassword = '123456';
  const hashed = await bcrypt.hash(newPassword, 10);

  const users = await prisma.user.findMany();

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });
    console.log(`✅ Password reset untuk ${user.username}`);
  }

  console.log(`\n🔑 Semua password direset ke: ${newPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
