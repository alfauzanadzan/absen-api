import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus, UserRole } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // ✅ Checkin: create attendance + simpan snapshot departmentName
  async checkin(dto: any) {
    let departmentName: string | null = null;

    if (dto.departmentId) {
      // cari departemen
      const dept = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
        select: { name: true },
      });

      if (!dept) {
        throw new NotFoundException('Department not found');
      }

      departmentName = dept.name; // ✅ snapshot nama departemen
    }

    return this.prisma.attendance.create({
      data: {
        userId: dto.userId,
        departmentId: dto.departmentId ?? null,
        departmentName: departmentName, // <<<<< masukin hasil query
        qrValue: dto.qrValue,
        timeIn: new Date(),
        role: dto.role ?? UserRole.PEKERJA,
        status: AttendanceStatus.PRESENT,
      },
    });
  }

  // ✅ Ambil semua attendance
  async findAll() {
    return this.prisma.attendance.findMany({
      include: {
        user: {
          select: { id: true, username: true, name: true, role: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Checkout: update timeOut + status
  async checkout(attendanceId: string) {
    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        timeOut: new Date(),
        status: AttendanceStatus.COMPLETED,
      },
});
}
}