import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UserRole } from '@prisma/client'; // ✅ enum dari Prisma

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
  async create(data: any, creatorRole: UserRole) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    if (creatorRole === UserRole.SUPERADMIN) {
      // SUPERADMIN hanya boleh bikin ADMIN
      if (data.role !== UserRole.ADMIN) {
        throw new ForbiddenException('SUPERADMIN hanya bisa membuat ADMIN');
      }

      return this.prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: UserRole.ADMIN,
        },
      });
    }

    if (creatorRole === UserRole.ADMIN) {
      // ADMIN bisa bikin KAPROG / PEKERJA
      if (![UserRole.KAPROG, UserRole.PEKERJA].includes(data.role)) {
        throw new ForbiddenException(
          'ADMIN hanya bisa membuat akun KAPROG atau PEKERJA',
        );
      }

      if (data.role === UserRole.PEKERJA && !data.position) {
        throw new BadRequestException('PEKERJA wajib memiliki position');
      }

      return this.prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: data.role,
          position: data.role === UserRole.PEKERJA ? data.position : null,
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
    const superAdmin = await this.prisma.user.count({ where: { role: UserRole.SUPERADMIN } });
    const admin = await this.prisma.user.count({ where: { role: UserRole.ADMIN } });
    const kaprog = await this.prisma.user.count({ where: { role: UserRole.KAPROG } });
    const pekerja = await this.prisma.user.count({ where: { role: UserRole.PEKERJA } });

    return { superAdmin, admin, kaprog, pekerja };
  }
}
