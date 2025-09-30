// src/attendance/attendance.controller.ts
import { Controller, Post, Body, Get, UseGuards } from "@nestjs/common"
import { AttendanceService } from "./attendance.service"
import { CheckinDto } from "./dto/checkin.dto"
import { JwtAuthGuard } from "../auth/jwt-auth.guard"

@Controller("attendance")
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post("checkin")
  checkin(@Body() dto: CheckinDto) {
    return this.attendanceService.checkin(dto)
  }

  @Get()
  findAll() {
    return this.attendanceService.findAll()
  }
}
