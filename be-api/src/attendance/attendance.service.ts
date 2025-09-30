import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkin(dto: any) {
    return this.prisma.attendance.create({
      data: {
        userId: dto.userId,
        departmentId: dto.departmentId,
        qrValue: dto.qrValue,
        timeIn: new Date(),
        status: AttendanceStatus.PRESENT,
      },
    });
  }

  async findAll() {
    return this.prisma.attendance.findMany({
      include: { user: true, department: true },
    });
  }

  async checkout(attendanceId: string) {
    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        timeOut: new Date(),
        status: AttendanceStatus.COMPLETED, // ✅ enum baru
      },
    });
  }
}
