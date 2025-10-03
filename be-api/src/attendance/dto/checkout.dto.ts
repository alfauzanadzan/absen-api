import { IsString } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CheckoutDto {
  @IsString()
  userId!: string;

  @IsString()
  role!: UserRole;

  @IsString()
  qrValue!: string;
}
