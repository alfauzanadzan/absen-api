import { Controller, Post, Body, Get } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // API untuk absen (scan QR → kirim userId, role, qrValue)
  @Post()
  async create(
    @Body() data: { userId: string; role: string; qrValue: string },
  ) {
    return this.attendanceService.createAttendance(
      data.userId,
      data.role,
      data.qrValue,
    );
  }

  // API untuk lihat semua absensi (buat admin/kaprog)
  @Get()
  async findAll() {
    return this.attendanceService.findAll();
  }
}
