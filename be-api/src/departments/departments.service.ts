import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  // ✅ Ambil semua department
  async findAll() {
    return this.prisma.department.findMany({
      include: { barcodes: true },
      orderBy: { name: 'asc' },
    });
  }

  // ✅ Ambil satu department by ID
  async findOne(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      include: { barcodes: true },
    });
  }

  // ✅ Ambil barcode berdasarkan value QR (buat check-in)
  async findByBarcode(value: string) {
    return this.prisma.barcode.findUnique({
      where: { value },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }
}
