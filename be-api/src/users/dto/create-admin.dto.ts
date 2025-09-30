import { IsString, IsOptional, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateAdminDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole) // ✅ enum Prisma
  role: UserRole;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  position?: string;
}
