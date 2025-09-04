import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true },
    });
  }

  async create(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        role: data.role,
        password: hashedPassword,
      },
    });
  }

  async update(id: string, data: any) {
    const updateData: any = {
      username: data.username,
      email: data.email,
      role: data.role,
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
