import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ========================
  // ✅ GET semua data absen (admin)
  // ========================
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.attendanceService.findAll();
  }

  // ========================
  // ✅ GET laporan harian / mingguan / bulanan (kaprog)
  // ========================
  @UseGuards(JwtAuthGuard)
  @Get('report')
  async getReport(
    @Query('type') type: 'daily' | 'weekly' | 'monthly' = 'daily',
  ) {
    return this.attendanceService.getReport(type);
  }

  // ========================
  // ✅ GET laporan absensi user tertentu (buat pekerja IT)
  // ========================
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getUserReport(@Param('userId') userId: string) {
    return this.attendanceService.getUserAttendance(userId);
  }

  // ========================
  // ✅ POST Check-In
  // ========================
  @UseGuards(JwtAuthGuard)
  @Post('checkin')
  async checkin(
    @Body()
    dto: {
      userId: string;
      role: UserRole;
      qrValue: string;
      latitude?: number; // posisi absen
      longitude?: number; // posisi absen
    },
  ) {
    return this.attendanceService.checkin(dto);
  }

  // ========================
  // ✅ POST Check-Out
  // ========================
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(
    @Body()
    dto: {
      userId: string;
      qrValue: string;
      reason?: string;
      latitude?: number; // posisi keluar
      longitude?: number; // posisi keluar
    },
  ) {
    return this.attendanceService.checkout(dto);
  }

  // ========================
  // ✅ GET semua lokasi absensi (buat admin/superadmin lihat di peta)
  // ========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Get('locations')
  async getAllLocations() {
    return this.attendanceService.getAllWithLocation();
  }
}
