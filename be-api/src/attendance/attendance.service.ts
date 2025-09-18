import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.attendance.findMany({
      include: { user: true }, // kalau nanti ada relasi ke User
    });
  }

  async create(data: { userId: string; date: Date; status: string }) {
    return this.prisma.attendance.create({
      data,
    });
  }
}
