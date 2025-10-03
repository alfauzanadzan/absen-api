import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ✅ Endpoint checkin (scan QR)
  @Post('checkin')
  async checkin(@Body() dto: any) {
    return this.attendanceService.checkin(dto);
  }

  // ✅ Endpoint ambil semua attendance
  @Get()
  async findAll() {
    return this.attendanceService.findAll();
  }

  // ✅ Endpoint checkout
  @Post('checkout/:id')
  async checkout(@Param('id') id: string) {
    return this.attendanceService.checkout(id);
  }
}
