import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus, AttendanceType, UserRole } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // ✅ CHECK-IN
  async checkin(dto: { userId: string; role: UserRole; qrValue: string }) {
    const { userId, role, qrValue } = dto;

    if (!userId) throw new BadRequestException('User ID tidak valid');
    if (!role) throw new BadRequestException('Role tidak valid');
    if (!qrValue) throw new BadRequestException('QR code tidak boleh kosong');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const barcode = await this.prisma.barcode.findUnique({ where: { value: qrValue } });
    if (!barcode) throw new BadRequestException('QR code tidak valid');

    if (user.departmentId !== barcode.departmentId) {
      throw new BadRequestException('❌ QR code tidak sesuai dengan department kamu');
    }

    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const existing = await this.prisma.attendance.findUnique({
      where: {
        userId_date_type: {
          userId,
          date,
          type: AttendanceType.IN,
        },
      },
    });
    if (existing) {
      throw new BadRequestException('❌ Kamu sudah melakukan check-in hari ini');
    }

    const status = now.getHours() >= 8 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

    const checkin = await this.prisma.attendance.create({
      data: {
        userId,
        departmentId: user.departmentId,
        departmentName: user.departmentName,
        qrValue,
        date,
        time: now,
        role,
        type: AttendanceType.IN,
        status,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
        department: { select: { id: true, name: true } },
      },
    });

    return { message: '✅ Check-in berhasil!', data: checkin };
  }

  // ✅ CHECK-OUT
  async checkout(dto: { userId: string; qrValue: string; reason?: string }) {
    const { userId, qrValue, reason } = dto;

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
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const checkin = await this.prisma.attendance.findUnique({
      where: {
        userId_date_type: {
          userId,
          date,
          type: AttendanceType.IN,
        },
      },
    });

    if (!checkin) {
      throw new NotFoundException('❌ Kamu belum melakukan check-in hari ini');
    }

    const existingOut = await this.prisma.attendance.findUnique({
      where: {
        userId_date_type: {
          userId,
          date,
          type: AttendanceType.OUT,
        },
      },
    });

    if (existingOut) {
      throw new BadRequestException('❌ Kamu sudah checkout hari ini');
    }

    const endTime = new Date(date);
    endTime.setHours(17, 0, 0, 0);

    let status: AttendanceStatus = AttendanceStatus.COMPLETED;
    let checkoutReason: string | null = reason || null;

    if (now < endTime) {
      status = AttendanceStatus.EARLY_OUT;
      if (!reason) {
        throw new BadRequestException('⚠️ Checkout sebelum jam 17:00 memerlukan alasan.');
      }
    } else if (now > endTime) {
      status = AttendanceStatus.OVERTIME;
    }

    const checkout = await this.prisma.attendance.create({
      data: {
        userId,
        departmentId: user.departmentId,
        departmentName: user.departmentName,
        qrValue,
        date,
        time: now,
        role: user.role,
        type: AttendanceType.OUT,
        status,
        reason: checkoutReason,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
        department: { select: { id: true, name: true } },
      },
    });

    return { message: '✅ Checkout berhasil!', data: checkout };
  }

  // ✅ GET ALL ATTENDANCE
  async findAll() {
    const records = await this.prisma.attendance.findMany({
      include: {
        user: { select: { id: true, username: true, name: true, role: true } },
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => ({
      id: r.id,
      date: r.date,
      time: r.time,
      qrValue: r.qrValue,
      role: r.role,
      status: r.status,
      type: r.type,
      reason: r.reason,
      user: r.user,
      department: r.department,
    }));
  }

  // ✅ REPORT (daily, weekly, monthly)
  async getReport(type: 'daily' | 'weekly' | 'monthly') {
    const now = new Date();
    let startDate = new Date(now);

    if (type === 'weekly') {
      const day = now.getDay(); // Minggu=0
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day);
    } else if (type === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const attendances = await this.prisma.attendance.findMany({
      where: { date: { gte: startDate } },
      include: {
        user: { select: { id: true, name: true, role: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    const grouped: Record<string, any[]> = {};
    for (const att of attendances) {
      const dept = att.department?.name || 'Unknown';
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(att);
    }

    return Object.entries(grouped).map(([department, list]) => ({
      department,
      count: list.length,
      items: list,
    }));
  }
}
