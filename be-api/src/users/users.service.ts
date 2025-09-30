import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '../auth/roles.enum';
import { Department } from '@prisma/client'; // ✅ import model prisma

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        position: true,
        role: true,
        departmentId: true,
        departmentName: true, // ✅ tambahin biar FE bisa langsung baca text
      },
    });
  }

  async createUser(data: CreateUserDto, currentUser: any) {
    // ✅ validasi role
    if (currentUser.role === Role.ADMIN) {
      if (data.role === Role.ADMIN || data.role === Role.SUPERADMIN) {
        throw new ForbiddenException(
          'Admin hanya bisa membuat akun KAPROG atau PEKERJA',
        );
      }
    }

    if (
      currentUser.role !== Role.SUPERADMIN &&
      currentUser.role !== Role.ADMIN
    ) {
      throw new ForbiddenException('Anda tidak punya izin membuat akun');
    }

    // ✅ Validasi khusus berdasarkan role
    if (data.role === Role.KAPROG && !data.departmentId) {
      throw new BadRequestException('Kaprog wajib memilih departemen');
    }
    if (data.role === Role.PEKERJA && !data.position) {
      throw new BadRequestException('Pekerja wajib mengisi position');
    }

    // ✅ ambil departemen kalau ada
    let department: Department | null = null;
    if (data.departmentId) {
      department = await this.prisma.department.findUnique({
        where: { id: data.departmentId },
      });
      if (!department) {
        throw new NotFoundException('Departemen tidak ditemukan');
      }
    }

    const hashed = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashed,
        name: data.name,
        position: data.position,
        role: data.role as Role,
        departmentId: department?.id ?? null,
        departmentName: department?.name ?? null, // ✅ simpan text juga
      },
    });
  }

  async updateUser(
    id: string,
    data: Partial<CreateUserDto>,
    currentUser: any,
  ) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) throw new NotFoundException('User tidak ditemukan');

    // ✅ validasi role update
    if (currentUser.role === Role.ADMIN) {
      if (data.role === Role.ADMIN || data.role === Role.SUPERADMIN) {
        throw new ForbiddenException(
          'Admin tidak bisa mengubah role menjadi ADMIN atau SUPERADMIN',
        );
      }
    }

    // ✅ Validasi khusus update
    if (data.role === Role.KAPROG && !data.departmentId) {
      throw new BadRequestException('Kaprog wajib memilih departemen');
    }
    if (data.role === Role.PEKERJA && !data.position) {
      throw new BadRequestException('Pekerja wajib mengisi position');
    }

    // ✅ ambil departemen kalau ada
    let department: Department | null = null;
    if (data.departmentId) {
      department = await this.prisma.department.findUnique({
        where: { id: data.departmentId },
      });
      if (!department) {
        throw new NotFoundException('Departemen tidak ditemukan');
      }
    }

    let updateData: any = {
      username: data.username,
      email: data.email,
      name: data.name,
      position: data.position,
      role: data.role as Role,
      departmentId: department?.id ?? existingUser.departmentId,
      departmentName: department?.name ?? existingUser.departmentName, // ✅ update text juga
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async removeUser(id: string, currentUser: any) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) throw new NotFoundException('User tidak ditemukan');

    // ✅ Admin tidak boleh hapus superadmin
    if (
      currentUser.role === Role.ADMIN &&
      existingUser.role === Role.SUPERADMIN
    ) {
      throw new ForbiddenException('Admin tidak bisa menghapus Superadmin');
    }

    return this.prisma.user.delete({ where: { id } });
  }
}
