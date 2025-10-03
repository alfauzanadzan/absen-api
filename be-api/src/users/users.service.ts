import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        name: true,
        departmentName: true,
        position: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createUser(data: CreateUserDto) {
    try {
      // Cek jika username sudah ada
      const existingUser = await this.prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUser) {
        throw new ConflictException('Username sudah digunakan');
      }

      // Validasi berdasarkan role
      if (data.role === UserRole.KAPROG && !data.departmentName) {
        throw new BadRequestException('KAPROG harus memiliki department');
      }

      if (data.role === UserRole.PEKERJA) {
        if (!data.position) {
          throw new BadRequestException('PEKERJA harus memiliki position');
        }
        if (!data.departmentName) {
          throw new BadRequestException('PEKERJA harus memiliki department');
        }
      }

      let departmentId: string | undefined = undefined;

      // Cari department berdasarkan nama
      if (data.departmentName) {
        const department = await this.prisma.department.findUnique({
          where: { name: data.departmentName },
        });

        if (!department) {
          throw new NotFoundException(`Department "${data.departmentName}" tidak ditemukan`);
        }

        departmentId = department.id;
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Buat email default jika tidak disediakan
      const userEmail = data.email || `${data.username}@mail.com`;

      return await this.prisma.user.create({
        data: {
          username: data.username,
          email: userEmail,
          password: hashedPassword,
          role: data.role,
          name: data.name || null,
          position: data.position || null,
          departmentId: departmentId || null,
          departmentName: data.departmentName || null,
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          name: true,
          departmentName: true,
          position: true,
          createdAt: true,
          updatedAt: true,
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Username atau email sudah digunakan');
      }
      throw error;
    }
  }

  async updateUser(id: string, data: Partial<CreateUserDto>) {
    try {
      // Cek jika user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException('User tidak ditemukan');
      }

      // Validasi berdasarkan role
      if (data.role === UserRole.KAPROG && !data.departmentName) {
        throw new BadRequestException('KAPROG harus memiliki department');
      }

      if (data.role === UserRole.PEKERJA) {
        if (!data.position) {
          throw new BadRequestException('PEKERJA harus memiliki position');
        }
        if (!data.departmentName) {
          throw new BadRequestException('PEKERJA harus memiliki department');
        }
      }

      let departmentId: string | undefined = undefined;

      if (data.departmentName) {
        const department = await this.prisma.department.findUnique({
          where: { name: data.departmentName },
        });

        if (!department) {
          throw new NotFoundException(`Department "${data.departmentName}" tidak ditemukan`);
        }

        departmentId = department.id;
      }

      const updateData: any = {
        username: data.username,
        role: data.role,
        name: data.name,
        position: data.position,
        departmentId: departmentId || null,
        departmentName: data.departmentName || null,
      };

      // Jika ada password baru, hash password
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
      }

      return await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          name: true,
          departmentName: true,
          position: true,
          createdAt: true,
          updatedAt: true,
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Username atau email sudah digunakan');
      }
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('User tidak ditemukan');
      }

      // Jangan izinkan hapus superadmin
      if (user.role === UserRole.ADMIN && user.username === 'superadmin') {
        throw new BadRequestException('Tidak dapat menghapus superadmin');
      }

      return await this.prisma.user.delete({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
        }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User tidak ditemukan');
      }
      throw error;
    }
  }
}