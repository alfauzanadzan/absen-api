import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.attendanceService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('report')
  async getReport(@Query('type') type: 'daily' | 'weekly' | 'monthly' = 'daily') {
    return this.attendanceService.getReport(type);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkin')
  async checkin(@Body() dto: { userId: string; role: UserRole; qrValue: string }) {
    return this.attendanceService.checkin(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(@Body() dto: { userId: string; qrValue: string; reason?: string }) {
    return this.attendanceService.checkout(dto);
  }
}
