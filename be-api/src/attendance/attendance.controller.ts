import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  async checkIn(@Body('userId') userId: string) {
    return this.attendanceService.checkIn(userId);
  }

  @Post('check-out')
  async checkOut(@Body('userId') userId: string) {
    return this.attendanceService.checkOut(userId);
  }

  @Get(':userId')
  async getUserAttendance(@Param('userId') userId: string) {
    return this.attendanceService.getUserAttendance(userId);
  }
}
