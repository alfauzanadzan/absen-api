import { IsString, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CheckinDto {
  @IsString()
  userId!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  qrValue!: string;
}
