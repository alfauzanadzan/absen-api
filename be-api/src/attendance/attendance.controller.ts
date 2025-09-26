import { Controller, Post, Body, Get, BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/checkin.dto';
import { CheckOutDto } from './dto/checkout.dto';
import { UserRole } from '../common/types'; // ✅ fix import

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('checkin')
  async checkin(@Body() data: CheckInDto) {
    if (!Object.values(UserRole).includes(data.role as UserRole)) {
      throw new BadRequestException('Invalid role');
    }
    return this.attendanceService.checkin(data.userId, data.role as UserRole, data.qrValue);
  }

  @Post('checkout')
  async checkout(@Body() data: CheckOutDto) {
    if (!Object.values(UserRole).includes(data.role as UserRole)) {
      throw new BadRequestException('Invalid role');
    }
    return this.attendanceService.checkout(data.userId, data.role as UserRole, data.qrValue);
  }

  @Get()
  async findAll() {
    return this.attendanceService.findAll();
  }
}
