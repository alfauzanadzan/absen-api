import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Role } from '@prisma/client'; // enum dari Prisma

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 🔍 Ambil semua user
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        position: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ➕ Bikin user baru (role tergantung siapa yg buat)
  async create(data: any, creatorRole: Role) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    if (creatorRole === Role.SUPER_ADMIN) {
      // SUPER_ADMIN hanya boleh bikin ADMIN
      if (data.role !== Role.ADMIN) {
        throw new ForbiddenException('SUPER_ADMIN hanya bisa membuat ADMIN');
      }

      return this.prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: Role.ADMIN,
        },
      });
    }

    if (creatorRole === Role.ADMIN) {
      // ADMIN bisa bikin KAPROG / PEKERJA
      if (![Role.KAPROG, Role.PEKERJA].includes(data.role)) {
        throw new ForbiddenException('ADMIN hanya bisa membuat akun KAPROG atau PEKERJA');
      }

      if (data.role === Role.PEKERJA && !data.position) {
        throw new BadRequestException('PEKERJA wajib memiliki position');
      }

      return this.prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: data.role,
          position: data.role === Role.PEKERJA ? data.position : null,
        },
      });
    }

    throw new ForbiddenException('Role tidak diizinkan membuat akun');
  }

  // ✏️ Update user
  async update(id: string, data: Partial<CreateAdminDto>) {
    const updateData: any = {
      username: data.username,
      email: data.email,
      name: data.name,
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    if (data.position) {
      updateData.position = data.position;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  // 🗑️ Hapus user
  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // 📊 Statistik jumlah user per role
  async getStats() {
    const superAdmin = await this.prisma.user.count({ where: { role: Role.SUPER_ADMIN } });
    const admin = await this.prisma.user.count({ where: { role: Role.ADMIN } });
    const kaprog = await this.prisma.user.count({ where: { role: Role.KAPROG } });
    const pekerja = await this.prisma.user.count({ where: { role: Role.PEKERJA } });

    return { superAdmin, admin, kaprog, pekerja };
  }
}
