import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;   // 👈 tambahin biar sesuai Prisma

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  position?: string;  // 👈 opsional sesuai schema
}
