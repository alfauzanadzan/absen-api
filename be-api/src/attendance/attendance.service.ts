// src/attendance/attendance.service.ts
import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CheckinDto } from "./dto/checkin.dto"
import { CheckOutDto } from "./dto/checkout.dto"

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // CHECK IN
  // =========================
  async checkin(dto: CheckinDto) {
    // Cek user
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    })
    if (!user) throw new NotFoundException("User tidak ditemukan")

    // Cek apakah sudah absen hari ini
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existing = await this.prisma.attendance.findFirst({
      where: {
        userId: dto.userId,
        date: { gte: today },
      },
    })

    if (existing) {
      throw new BadRequestException("User sudah check-in hari ini")
    }

    // Simpan attendance
    return this.prisma.attendance.create({
      data: {
        userId: dto.userId,
        qrValue: dto.qrValue,
        role: dto.role ?? "PEKERJA",
        status: "PRESENT",
        timeIn: new Date(),
      },
    })
  }

  // =========================
  // CHECK OUT
  // =========================
  async checkout(dto: CheckOutDto) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await this.prisma.attendance.findFirst({
      where: {
        userId: dto.userId,
        date: { gte: today },
      },
    })

    if (!attendance) {
      throw new NotFoundException("Belum ada check-in hari ini")
    }

    if (attendance.timeOut) {
      throw new BadRequestException("User sudah checkout")
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        timeOut: new Date(),
        status: "COMPLETED",
      },
    })
  }

  // =========================
  // GET ALL ATTENDANCE (untuk admin)
  // =========================
  async findAll() {
    return this.prisma.attendance.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    })
  }

  // =========================
  // GET ATTENDANCE BY USER
  // =========================
  async findByUser(userId: string) {
    return this.prisma.attendance.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
  }
}
