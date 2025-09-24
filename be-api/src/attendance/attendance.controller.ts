// src/attendance/attendance.controller.ts
import { Controller, Post, Body, Get, BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CheckinDto } from './dto/checkin.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { UserRole } from '@prisma/client'; // ✅ Enum Prisma

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // =======================
  // CHECK IN
  // =======================
  @Post('checkin')
  async checkin(@Body() data: CheckinDto) {
    if (!Object.values(UserRole).includes(data.role as UserRole)) {
      throw new BadRequestException('Invalid role');
    }

    return this.attendanceService.checkin(
      data.userId,
      data.role as UserRole, // ✅ cast ke enum
      data.qrValue,
    );
  }

  // =======================
  // CHECK OUT
  // =======================
  @Post('checkout')
  async checkout(@Body() data: CheckoutDto) {
    if (!Object.values(UserRole).includes(data.role as UserRole)) {
      throw new BadRequestException('Invalid role');
    }

    return this.attendanceService.checkout(
      data.userId,
      data.role as UserRole, // ✅ cast ke enum
      data.qrValue,
    );
  }

  // =======================
  // GET ALL
  // =======================
  @Get()
  async findAll() {
    return this.attendanceService.findAll();
  }
}
