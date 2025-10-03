import { IsString, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateAdminDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
