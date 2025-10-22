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
  // ✅ GET semua data absen (ADMIN / SUPERADMIN)
  // ========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get()
  async getAll() {
    return this.attendanceService.findAll();
  }

  // ========================
  // ✅ GET absensi berdasarkan departemen (KAPROG / PEKERJA bisa akses)
  // contoh: GET /attendance/department/IT
  // ========================
  @UseGuards(JwtAuthGuard)
  @Get('department/:dept')
  async getByDepartment(@Param('dept') dept: string) {
    return this.attendanceService.findByDepartment(dept);
  }

  // ========================
  // ✅ GET laporan harian / mingguan / bulanan / kemarin
  // ========================
  @UseGuards(JwtAuthGuard)
  @Get('report')
  async getReport(
    @Query('type') type: 'daily' | 'weekly' | 'monthly' | 'yesterday' = 'daily',
  ) {
    return this.attendanceService.getReport(type);
  }

  // ========================
  // ✅ GET laporan absensi user tertentu
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
      latitude?: number;
      longitude?: number;
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
      latitude?: number;
      longitude?: number;
    },
  ) {
    return this.attendanceService.checkout(dto);
  }

  // ========================
  // ✅ GET semua lokasi absensi (ADMIN / SUPERADMIN)
  // ========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get('locations')
  async getAllLocations() {
    return this.attendanceService.getAllWithLocation();
  }
}
