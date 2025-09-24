// src/attendance/dto/checkout.dto.ts
import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CheckoutDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsEnum(UserRole) // ✅ Validasi enum
  role: UserRole;

  @IsNotEmpty()
  @IsString()
  qrValue: string;
}
