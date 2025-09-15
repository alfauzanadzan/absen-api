import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AttendanceModule } from './attendance/attendance.module'; // <- tambahin
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [AuthModule, UsersModule, AttendanceModule], // <- include AttendanceModule
  providers: [PrismaService],
})
export class AppModule {}
