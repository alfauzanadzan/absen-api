import { IsString, IsUUID, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class AttendanceDto {
  @IsUUID()
  userId!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  qrValue!: string;
}
