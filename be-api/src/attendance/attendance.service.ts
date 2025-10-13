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

    // Pastikan department cocok
    if (user.departmentId !== barcode.departmentId) {
      throw new BadRequestException('❌ QR code tidak sesuai dengan department kamu');
    }

    // Buat tanggal hari ini (tanpa jam)
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Cek apakah sudah ada attendance hari ini
    const todayAttendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (todayAttendance) {
      throw new BadRequestException('❌ Kamu sudah melakukan check-in hari ini');
    }

    // Status: LATE kalau lewat jam 8 pagi
    const status = now.getHours() >= 8 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

    // Simpan attendance
    return this.prisma.attendance.create({
      data: {
        userId,
        departmentId: user.departmentId,
        departmentName: user.departmentName,
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
      throw new BadRequestException('❌ QR code tidak sesuai dengan department kamu');
    }

    const now = new Date();

    // 🔎 Cari attendance hari ini yang belum checkout
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
        timeOut: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!existingAttendance) {
      throw new NotFoundException('❌ Belum melakukan check-in hari ini atau sudah checkout');
    }

    // Update attendance
    const updated = await this.prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: {
        timeOut: now,
        status: AttendanceStatus.COMPLETED,
      },
    });

    return { message: '✅ Checkout berhasil!', data: updated };
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
