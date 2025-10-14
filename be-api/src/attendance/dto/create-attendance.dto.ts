import { AttendanceType } from '@prisma/client';

export class CreateAttendanceDto {
  userId!: string;          // pakai "!" biar dianggap sudah diassign
  role!: string;
  type!: AttendanceType;    // "IN" atau "OUT"
  qrValue!: string;         // QR code value
}
