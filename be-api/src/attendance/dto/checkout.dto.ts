// src/attendance/dto/checkout.dto.ts
import { IsString } from 'class-validator';
import { UserRole } from '../../common/types';

export class CheckOutDto {
  @IsString()
  userId: string;

  role: UserRole;

  @IsString()
  qrValue: string;
}
