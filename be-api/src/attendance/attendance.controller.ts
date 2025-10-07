import { Controller, Post, Get, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CheckinDto } from './dto/checkin.dto';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ✅ Check-In endpoint
  @Post('checkin')
  async checkin(@Body() dto: CheckinDto) {
    return this.attendanceService.checkin(dto);
  }

  // ✅ Check-Out endpoint
  @Post('checkout')
  async checkout(@Body() dto: CheckoutDto) {
    return this.attendanceService.checkout(dto);
  }

  // ✅ Get all attendance data
  @Get()
  async findAll() {
    return this.attendanceService.findAll();
  }
}
