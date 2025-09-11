import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ✅ ambil semua user
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // ✅ bikin user baru (default role ADMIN)
  async create(data: CreateAdminDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        role: 'ADMIN', // 🔒 fix supaya superadmin cuma bikin admin
        password: hashedPassword,
      },
    });
  }

  // ✅ update user (opsional password)
  async update(id: string, data: Partial<CreateAdminDto>) {
    const updateData: any = {
      username: data.username,
      email: data.email,
      role: 'ADMIN', // default ADMIN (jaga-jaga biar gak berubah)
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id }, // karena id UUID string
      data: updateData,
    });
  }

  // ✅ hapus user
  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
