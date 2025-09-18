import { IsString, IsEmail, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateAdminDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string; // sesuai schema Prisma

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role; // 👈 biar cuma bisa SUPER_ADMIN, ADMIN, KAPROG, PEKERJA

  @IsOptional()
  @IsString()
  position?: string; // opsional (wajib kalau role = PEKERJA)
}
