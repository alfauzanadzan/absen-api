import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus, UserRole } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // ✅ CHECK-IN
  async checkin(dto: { userId: string; role: UserRole; qrValue: string }) {
    const { userId, role, qrValue } = dto;

    if (!userId) throw new BadRequestException('User ID tidak valid');
    if (!role) throw new BadRequestException('Role tidak valid');
    if (!qrValue) throw new BadRequestException('QR code tidak boleh kosong');

    // Ambil user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    // Ambil barcode
    const barcode = await this.prisma.barcode.findUnique({ where: { value: qrValue } });
    if (!barcode) throw new BadRequestException('QR code tidak valid');

    // Cek department cocok
    if (user.departmentId !== barcode.departmentId) {
      throw new BadRequestException('QR code tidak sesuai department Anda');
    }

    // Cek sudah check-in hari ini
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAttendance = await this.prisma.attendance.findFirst({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } },
    });
    if (todayAttendance) throw new BadRequestException('Sudah melakukan check-in hari ini');

    // Status: LATE kalau lewat jam 8
    const now = new Date();
    const status = now.getHours() >= 8 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

    // Create attendance
    return this.prisma.attendance.create({
      data: {
        userId,
        departmentId: user.departmentId || null,
        departmentName: user.departmentName || null,
        qrValue,
        date: now,
        timeIn: now,
        role,
        status,
      },
    });
  }

  // ✅ CHECK-OUT
  async checkout(dto: { userId: string; qrValue: string }) {
    const { userId, qrValue } = dto;

    if (!userId) throw new BadRequestException('User ID tidak valid');
    if (!qrValue) throw new BadRequestException('QR code tidak boleh kosong');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const barcode = await this.prisma.barcode.findUnique({ where: { value: qrValue } });
    if (!barcode) throw new BadRequestException('QR code tidak valid');

    if (user.departmentId !== barcode.departmentId) {
      throw new BadRequestException('QR code tidak sesuai department Anda');
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await this.prisma.attendance.findFirst({
      where: { userId, date: { gte: startOfDay, lte: endOfDay }, timeOut: null },
    });
    if (!existingAttendance) throw new NotFoundException('Belum melakukan check-in atau sudah checkout');

    const updated = await this.prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: { timeOut: now, status: AttendanceStatus.COMPLETED },
    });

    return { message: 'Checkout berhasil', data: updated };
  }

  // ✅ GET ALL ATTENDANCE
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
