// src/attendance/attendance.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CheckinDto } from './dto/checkin.dto';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // =======================
  // CHECK IN
  // =======================
  @Post('checkin')
  async checkin(@Body() data: CheckinDto) {
    return this.attendanceService.checkin(data.userId, data.role, data.qrValue);
  }

  // =======================
  // CHECK OUT
  // =======================
  @Post('checkout')
  async checkout(@Body() data: CheckoutDto) {
    return this.attendanceService.checkout(data.userId, data.role, data.qrValue);
  }

  // =======================
  // GET ALL
  // =======================
  @Get()
  async findAll() {
    return this.attendanceService.findAll();
  }
}
