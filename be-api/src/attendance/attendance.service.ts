import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * ✅ CHECK-IN
   */
  async checkin(dto: any) {
    const { qrValue, userId, role } = dto;

    if (!userId) throw new BadRequestException('User ID tidak valid');
    if (!role) throw new BadRequestException('Role tidak valid');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const departmentId = user.departmentId || null;
    const departmentName = user.departmentName || null;

    // 🔹 Cek sudah ada attendance hari ini
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAttendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (todayAttendance) {
      throw new BadRequestException('Sudah melakukan check-in hari ini');
    }

    return this.prisma.attendance.create({
      data: {
        userId,
        departmentId,
        departmentName,
        qrValue: qrValue || null,
        date: new Date(),
        timeIn: new Date(),
        role,
        status: AttendanceStatus.PRESENT,
      },
    });
  }

  /**
   * ✅ CHECK-OUT
   */
  async checkout(dto: any) {
    const { userId, qrValue } = dto;

    if (!userId) throw new BadRequestException('User ID tidak valid');

    // 🔹 Validasi user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // 🔹 Cari attendance aktif (belum checkout)
    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
        timeOut: null,
        qrValue: qrValue || undefined,
      },
    });

    if (!existingAttendance) {
      throw new NotFoundException('Belum melakukan check-in atau sudah checkout sebelumnya.');
    }

    // 🔹 Update waktu keluar & status
    const updated = await this.prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: {
        timeOut: new Date(),
        status: AttendanceStatus.COMPLETED,
      },
    });

    return {
      message: 'Checkout berhasil',
      data: updated,
    };
  }

  /**
   * ✅ GET ALL ATTENDANCE
   */
  async findAll() {
    return this.prisma.attendance.findMany({
      include: {
        user: { select: { id: true, username: true, name: true, role: true } },
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
