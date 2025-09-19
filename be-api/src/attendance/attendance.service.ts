import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // Absen masuk / pulang
  async createAttendance(userId: string, role: string, qrValue: string) {
    if (qrValue !== 'ABSEN-PINTU-1') {
      throw new ForbiddenException('QR Code tidak valid');
    }

    // Hanya PEKERJA & KAPROG
    if (role !== 'PEKERJA' && role !== 'KAPROG') {
      throw new ForbiddenException('Role tidak boleh absen');
    }

    // Cari absensi hari ini
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
      // Kalau sudah absen masuk → update jadi absen pulang
      return this.prisma.attendance.update({
        where: { id: existing.id },
        data: { timeOut: new Date(), status: 'Completed' },
        include: { user: true },
      });
    }

    // Kalau belum ada → buat absen masuk
    return this.prisma.attendance.create({
      data: {
        userId,
        date: new Date(),
        timeIn: new Date(),
        status: 'Present',
      },
      include: { user: true },
    });
  }

  // Ambil semua data absensi
  async findAll() {
    return this.prisma.attendance.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
