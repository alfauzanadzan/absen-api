// src/attendance/attendance.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus, UserRole } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // =======================
  // CHECK IN
  // =======================
  async checkin(userId: string, role: UserRole, qrValue: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (qrValue !== 'ABSEN-PINTU-1') {
      throw new ForbiddenException('QR Code tidak valid');
    }

    if (role !== UserRole.PEKERJA && role !== UserRole.KAPROG) {
      throw new ForbiddenException('Role tidak boleh absen');
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const existing = await this.prisma.attendance.findFirst({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existing) {
      throw new ForbiddenException('Kamu sudah check-in hari ini');
    }

    return this.prisma.attendance.create({
      data: {
        userId,
        date: new Date(),
        timeIn: new Date(),
        status: AttendanceStatus.PRESENT,
        qrValue,          // ✅ WAJIB diisi
        role,             // ✅ enum UserRole dari Prisma
      },
      include: { user: true },
    });
  }

  // =======================
  // CHECK OUT
  // =======================
  async checkout(userId: string, role: UserRole, qrValue: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (qrValue !== 'ABSEN-PINTU-1') {
      throw new ForbiddenException('QR Code tidak valid');
    }

    if (role !== UserRole.PEKERJA && role !== UserRole.KAPROG) {
      throw new ForbiddenException('Role tidak boleh absen');
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const existing = await this.prisma.attendance.findFirst({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (!existing) {
      throw new NotFoundException('Belum ada check-in hari ini');
    }

    if (existing.timeOut) {
      throw new ForbiddenException('Kamu sudah check-out hari ini');
    }

    return this.prisma.attendance.update({
      where: { id: existing.id },
      data: {
        timeOut: new Date(),
        status: AttendanceStatus.COMPLETED,
      },
      include: { user: true },
    });
  }

  // =======================
  // GET ALL
  // =======================
  async findAll() {
    return this.prisma.attendance.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
