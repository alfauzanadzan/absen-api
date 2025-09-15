import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkIn(userId: string) {
    return this.prisma.attendance.create({
      data: {
        userId,
        timeIn: new Date(),
        status: 'HADIR',
      },
    });
  }

  async checkOut(userId: string) {
    return this.prisma.attendance.updateMany({
      where: {
        userId,
        timeOut: null,
      },
      data: {
        timeOut: new Date(),
        status: 'SELESAI',
      },
    });
  }

  async getUserAttendance(userId: string) {
    return this.prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }
}
