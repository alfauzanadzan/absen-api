import { Controller, Get, Post, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  async findAll() {
    return this.attendanceService.findAll();
  }

  @Post()
  async create(
    @Body() data: { userId: string; date: Date; status: string },
  ) {
    return this.attendanceService.create(data);
  }
}
