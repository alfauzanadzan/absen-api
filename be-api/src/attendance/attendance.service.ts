import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus, AttendanceType, UserRole } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // ========================
  // ✅ CHECK-IN
  // ========================
  async checkin(dto: {
    userId: string;
    role: UserRole;
    qrValue: string;
    latitude?: number;
    longitude?: number;
  }) {
    const { userId, role, qrValue, latitude, longitude } = dto;

    if (!userId) throw new BadRequestException('User ID tidak valid');
    if (!role) throw new BadRequestException('Role tidak valid');
    if (!qrValue) throw new BadRequestException('QR code tidak boleh kosong');

    const allowedRoles: UserRole[] = [UserRole.KAPROG, UserRole.PEKERJA];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException('❌ Role kamu tidak diizinkan untuk absen');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const barcode = await this.prisma.barcode.findUnique({ where: { value: qrValue } });
    if (!barcode) throw new BadRequestException('QR code tidak valid');

    if (user.departmentId !== barcode.departmentId) {
      throw new BadRequestException('❌ QR code tidak sesuai dengan department kamu');
    }

    const department = await this.prisma.department.findUnique({
      where: { id: user.departmentId },
    });
    if (!department) throw new NotFoundException('Department tidak ditemukan');

    const now = this.getWIBTime();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Jam masuk per-department
    const isMarketing = department.name?.toLowerCase().includes('marketing');
    const startTimeStr = isMarketing ? '09:00' : '08:00';
    const [startHour, startMinute] = startTimeStr.split(':').map(Number);
    const startTime = new Date(now);
    startTime.setHours(startHour, startMinute, 0, 0);

    // Hitung selisih menit
    const diffMinutes = (now.getTime() - startTime.getTime()) / 60000;
    const status = diffMinutes > 5 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

    // Cek apakah sudah check-in hari ini
    const existing = await this.prisma.attendance.findUnique({
      where: { userId_date_type: { userId, date, type: AttendanceType.IN } },
    });
    if (existing) throw new BadRequestException('❌ Kamu sudah check-in hari ini');

    const checkin = await this.prisma.attendance.create({
      data: {
        userId,
        departmentId: user.departmentId,
        departmentName: department.name,
        qrValue,
        date,
        time: now,
        role,
        type: AttendanceType.IN,
        status,
        latitude,
        longitude,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
        department: { select: { id: true, name: true } },
      },
    });

    return {
      message:
        status === AttendanceStatus.LATE
          ? '⚠️ Kamu terlambat masuk!'
          : '✅ Check-in berhasil, tepat waktu!',
      data: checkin,
    };
  }

  // ========================
  // ✅ CHECK-OUT
  // ========================
  async checkout(dto: {
    userId: string;
    qrValue: string;
    reason?: string;
    latitude?: number;
    longitude?: number;
  }) {
    const { userId, qrValue, reason, latitude, longitude } = dto;

    if (!userId) throw new BadRequestException('User ID tidak valid');
    if (!qrValue) throw new BadRequestException('QR code tidak boleh kosong');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const allowedRoles: UserRole[] = [UserRole.KAPROG, UserRole.PEKERJA];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('❌ Role kamu tidak diizinkan untuk checkout');
    }

    const barcode = await this.prisma.barcode.findUnique({ where: { value: qrValue } });
    if (!barcode) throw new BadRequestException('QR code tidak valid');

    if (user.departmentId !== barcode.departmentId) {
      throw new BadRequestException('❌ QR code tidak sesuai dengan department kamu');
    }

    const department = await this.prisma.department.findUnique({
      where: { id: user.departmentId },
    });
    if (!department) throw new NotFoundException('Department tidak ditemukan');

    const now = this.getWIBTime();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Jam pulang per-department
    const isMarketing = department.name?.toLowerCase().includes('marketing');
    const endTimeStr = isMarketing ? '18:00' : '17:00';
    const [endHour, endMinute] = endTimeStr.split(':').map(Number);
    const endTime = new Date(now);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Cek apakah sudah check-in
    const checkin = await this.prisma.attendance.findUnique({
      where: { userId_date_type: { userId, date, type: AttendanceType.IN } },
    });
    if (!checkin) throw new NotFoundException('❌ Kamu belum check-in hari ini');

    // Cek apakah sudah checkout
    const existingOut = await this.prisma.attendance.findUnique({
      where: { userId_date_type: { userId, date, type: AttendanceType.OUT } },
    });
    if (existingOut) throw new BadRequestException('❌ Kamu sudah checkout hari ini');

    const diffMinutes = (now.getTime() - endTime.getTime()) / 60000;
    let status: AttendanceStatus = AttendanceStatus.COMPLETED;
    let checkoutReason: string | null = reason || null;

    if (now < endTime && diffMinutes < -5) {
      status = AttendanceStatus.EARLY_OUT;
      if (!reason)
        throw new BadRequestException(
          '⚠️ Checkout sebelum jam pulang memerlukan alasan.',
        );
    } else if (now > endTime && diffMinutes > 5) {
      status = AttendanceStatus.OVERTIME;
    }

    const checkout = await this.prisma.attendance.create({
      data: {
        userId,
        departmentId: user.departmentId,
        departmentName: department.name,
        qrValue,
        date,
        time: now,
        role: user.role,
        type: AttendanceType.OUT,
        status,
        reason: checkoutReason,
        latitude,
        longitude,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
        department: { select: { id: true, name: true } },
      },
    });

    return {
      message:
        status === AttendanceStatus.EARLY_OUT
          ? '⚠️ Kamu pulang lebih awal.'
          : status === AttendanceStatus.OVERTIME
          ? '💪 Lembur, mantap!'
          : '✅ Checkout berhasil!',
      data: checkout,
    };
  }

  // ========================
  // ✅ GET ALL ATTENDANCE
  // ========================
  async findAll() {
    return this.prisma.attendance.findMany({
      include: {
        user: { select: { id: true, username: true, name: true, role: true } },
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ========================
  // ✅ GET BY DEPARTMENT (untuk /attendance/department/:dept)
  // ========================
  async findByDepartment(dept: string) {
    if (!dept) throw new BadRequestException('Nama departemen harus diisi');

    const department = await this.prisma.department.findFirst({
      where: {
        name: {
          equals: dept,
          mode: 'insensitive',
        },
      },
    });

    if (!department) throw new NotFoundException('Department tidak ditemukan');

    const data = await this.prisma.attendance.findMany({
      where: { departmentId: department.id },
      include: {
        user: { select: { id: true, name: true, role: true, username: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      department: department.name,
      total: data.length,
      data,
    };
  }

  // ========================
  // ✅ GET REPORT (Daily, Weekly, Monthly, Yesterday)
  // ========================
  async getReport(type: 'daily' | 'weekly' | 'monthly' | 'yesterday') {
    const now = this.getWIBTime();
    let startDate: Date;
    let endDate: Date;

    if (type === 'yesterday') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (type === 'weekly') {
      const day = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (type === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    }

    const data = await this.prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: [
        { date: 'desc' },
        { department: { name: 'asc' } },
        { user: { name: 'asc' } },
        { time: 'asc' },
      ],
    });

    const grouped: Record<string, any> = {};
    for (const a of data) {
      const dateKey = a.date.toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = {};

      const deptKey = a.department?.name || 'Tanpa Department';
      if (!grouped[dateKey][deptKey]) grouped[dateKey][deptKey] = [];

      grouped[dateKey][deptKey].push({
        user: {
          id: a.user?.id,
          name: a.user?.name || 'Tidak diketahui',
          role: a.user?.role || '-',
        },
        type: a.type,
        status: a.status,
        time: a.time,
        reason: a.reason,
      });
    }

    return {
      range: type,
      total: data.length,
      result: grouped,
    };
  }

  // ========================
  // ✅ GET USER ATTENDANCE
  // ========================
  async getUserAttendance(userId: string) {
    if (!userId) throw new BadRequestException('User ID tidak valid');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const records = await this.prisma.attendance.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, role: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    const grouped: Record<string, any> = {};
    for (const r of records) {
      const key = r.date.toISOString().split('T')[0];
      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          checkInTime: null,
          checkOutTime: null,
          status: 'Absent',
        };
      }

      if (r.type === AttendanceType.IN) grouped[key].checkInTime = r.time;
      if (r.type === AttendanceType.OUT) grouped[key].checkOutTime = r.time;
      grouped[key].status = r.status;
    }

    return Object.values(grouped);
  }

  // ========================
  // ✅ GET ALL WITH LOCATION
  // ========================
  async getAllWithLocation() {
    return this.prisma.attendance.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        user: { select: { id: true, name: true, username: true, role: true } },
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ========================
  // ✅ UTIL - WIB Time
  // ========================
  private getWIBTime(): Date {
    const nowUTC = new Date();
    const utc = nowUTC.getTime() + nowUTC.getTimezoneOffset() * 60000;
    const wibOffset = 7 * 60 * 60 * 1000;
    return new Date(utc + wibOffset);
  }
}
