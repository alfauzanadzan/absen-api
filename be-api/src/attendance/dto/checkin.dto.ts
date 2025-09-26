// src/attendance/dto/checkin.dto.ts
import { IsString } from 'class-validator';
import { UserRole } from '../../common/types';

export class CheckInDto {
  @IsString()
  userId: string;

  role: UserRole;

  @IsString()
  qrValue: string;
}
