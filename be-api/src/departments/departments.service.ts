import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  // ✅ Ambil semua department (termasuk barcode dan user)
  async findAll() {
    return this.prisma.department.findMany({
      include: { barcodes: true, users: true },
      orderBy: { name: 'asc' },
    });
  }

  // ✅ Ambil satu department by ID
  async findOne(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { barcodes: true, users: true },
    });
    if (!dept) throw new NotFoundException('Department tidak ditemukan');
    return dept;
  }

  // ✅ Ambil barcode berdasarkan value QR
  async findByBarcode(value: string) {
    const barcode = await this.prisma.barcode.findUnique({
      where: { value },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    });
    if (!barcode) throw new NotFoundException('Barcode tidak ditemukan');
    return barcode;
  }

  // ✅ Tambah department baru + auto-generate barcode
  async create(data: {
    name: string;
    code: string;
    startTime: string;
    endTime: string;
  }) {
    const { name, code, startTime, endTime } = data;
    if (!name || !code) {
      throw new BadRequestException('Nama dan kode wajib diisi');
    }

    // Pastikan tidak duplikat
    const existing = await this.prisma.department.findFirst({
      where: { OR: [{ name }, { code }] },
    });
    if (existing)
      throw new BadRequestException('Nama atau kode department sudah digunakan');

    // Konversi jam kerja jadi DateTime (pakai hari ini)
    const today = new Date();
    const start = new Date(`${today.toDateString()} ${startTime}`);
    const end = new Date(`${today.toDateString()} ${endTime}`);

    // 1️⃣ Buat department baru
    const department = await this.prisma.department.create({
      data: {
        name,
        code,
        startTime: start,
        endTime: end,
      },
    });

    // 2️⃣ Generate barcode unik berdasarkan kode departemen
    const barcodeValue = `${code}-${randomBytes(3).toString('hex')}`; // ex: IT-a83f5b

    // 3️⃣ Simpan barcode di tabel Barcode
    await this.prisma.barcode.create({
      data: {
        value: barcodeValue,
        departmentId: department.id,
        departmentName: department.name,
        latitude: 0, // bisa diganti default lokasi kantor
        longitude: 0, // atau ambil dari frontend kalau mau dinamis
      },
    });

    // 4️⃣ Return department beserta barcode-nya
    return this.prisma.department.findUnique({
      where: { id: department.id },
      include: { barcodes: true },
    });
  }

  // ✅ Update data department
  async update(
    id: string,
    data: { name?: string; code?: string; startTime?: string; endTime?: string },
  ) {
    const dept = await this.prisma.department.findUnique({ where: { id } });
    if (!dept) throw new NotFoundException('Department tidak ditemukan');

    const today = new Date();
    const start = data.startTime
      ? new Date(`${today.toDateString()} ${data.startTime}`)
      : dept.startTime;
    const end = data.endTime
      ? new Date(`${today.toDateString()} ${data.endTime}`)
      : dept.endTime;

    return this.prisma.department.update({
      where: { id },
      data: {
        name: data.name ?? dept.name,
        code: data.code ?? dept.code,
        startTime: start,
        endTime: end,
      },
    });
  }

  // ✅ Hapus department + barcode-nya
  async delete(id: string) {
    const dept = await this.prisma.department.findUnique({ where: { id } });
    if (!dept) throw new NotFoundException('Department tidak ditemukan');

    // Hapus semua barcode yang terkait
    await this.prisma.barcode.deleteMany({ where: { departmentId: id } });

    // Hapus departemen
    return this.prisma.department.delete({ where: { id } });
  }
}
