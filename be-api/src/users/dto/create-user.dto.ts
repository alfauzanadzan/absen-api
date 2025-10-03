import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  username!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  departmentName?: string; // PASTIKAN ADA INI

  @IsString()
  @IsOptional()
  position?: string;

  // BISA HAPUS departmentId KALAU TIDAK PAKAI
  @IsString()
  @IsOptional()
  departmentId?: string;
}