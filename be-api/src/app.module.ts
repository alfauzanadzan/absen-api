import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module'; // 🔹 tambahin ini
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    AuthModule,
    UsersModule, // 🔹 daftarin UsersModule
  ],
  providers: [PrismaService],
})
export class AppModule {}
