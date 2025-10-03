import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentsModule } from './departments/departments.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    AttendanceModule,
    DepartmentsModule,
  ],
})
export class AppModule {}
