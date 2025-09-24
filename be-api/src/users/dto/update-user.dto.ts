import { IsOptional, IsString, IsEnum, IsEmail } from 'class-validator';
import { UserRole } from '@prisma/client'; // ✅ benar

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsEnum(UserRole) // ✅ pakai UserRole
  role?: UserRole;
}
