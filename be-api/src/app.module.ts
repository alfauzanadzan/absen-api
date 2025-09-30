import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PrismaService } from './prisma/prisma.service';
import { DepartmentsController } from './departements/departments.controller';

@Module({
  imports: [AuthModule, UsersModule, AttendanceModule],
  controllers: [DepartmentsController], // ✅ sekarang controller udah ada
  providers: [PrismaService],
})
export class AppModule {}
