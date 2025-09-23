// src/attendance/dto/attendance.dto.ts
import { IsString, IsUUID, IsIn } from 'class-validator';

export class AttendanceDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsIn(['PEKERJA', 'KAPROG'])
  role: string;

  @IsString()
  qrValue: string;
}
