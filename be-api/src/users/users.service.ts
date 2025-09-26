import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async create(data: CreateAdminDto, creatorRole: string) {
    let allowedRole: string;

    if (creatorRole === 'SUPERADMIN') {
      // superadmin hanya bisa buat ADMIN
      allowedRole = 'ADMIN';
    } else if (creatorRole === 'ADMIN') {
      // admin hanya bisa buat kaprog atau pekerja
      if (!['KAPROG', 'PEKERJA'].includes(data.role)) {
        throw new ForbiddenException('Admin hanya bisa buat KAPROG atau PEKERJA');
      }
      allowedRole = data.role;
    } else {
      throw new ForbiddenException('Anda tidak punya akses membuat user');
    }

    // cek username unik
    const existing = await this.prisma.user.findUnique({ where: { username: data.username } });
    if (existing) throw new BadRequestException('❌ Username sudah dipakai');

    // hash password
    const hashed = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        username: data.username,
        password: hashed,
        role: allowedRole, // ✅ string sesuai schema
        email: data.email ?? `${data.username}@mail.com`,
        name: data.name ?? null,
        position: data.position ?? null,
      },
    });
  }

  async update(id: string, data: Partial<CreateAdminDto>) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async getStats() {
    return this.prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });
  }
}
