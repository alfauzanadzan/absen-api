import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 🔹 LOGIN
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Login gagal, periksa username/password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Login gagal, periksa username/password');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        name: user.name,
        position: user.position,
      },
    };
  }

  // 🔹 SEED USER
  async seedSuperAdmin() {
    // ===== Super Admin =====
    const superAdminPassword = await bcrypt.hash('superadmin123', 10);
    await this.prisma.user.upsert({
      where: { username: 'superadmin' },
      update: {
        password: superAdminPassword,
        role: UserRole.SUPERADMIN,
        name: 'Super Admin',
      },
      create: {
        username: 'superadmin',
        password: superAdminPassword,
        role: UserRole.SUPERADMIN,
        email: 'superadmin@example.com',
        name: 'Super Admin',
      },
    });

    // ===== Admin =====
    const adminPassword = await bcrypt.hash('admin123', 10);
    await this.prisma.user.upsert({
      where: { username: 'admin1' },
      update: {
        password: adminPassword,
        role: UserRole.ADMIN,
        name: 'Admin 1',
      },
      create: {
        username: 'admin1',
        password: adminPassword,
        role: UserRole.ADMIN,
        email: 'admin@example.com',
        name: 'Admin 1',
      },
    });

    // ===== Kaprog =====
    const kaprogPassword = await bcrypt.hash('kaprog123', 10);
    await this.prisma.user.upsert({
      where: { username: 'kaprog' },
      update: {
        password: kaprogPassword,
        role: UserRole.KAPROG,
        name: 'Kaprogram',
      },
      create: {
        username: 'kaprog',
        password: kaprogPassword,
        role: UserRole.KAPROG,
        email: 'kaprog@example.com',
        name: 'Kaprogram',
      },
    });

    // ===== Pekerja =====
    const pekerjaPassword = await bcrypt.hash('pekerja123', 10);
    await this.prisma.user.upsert({
      where: { username: 'pekerja1' },
      update: {
        password: pekerjaPassword,
        role: UserRole.PEKERJA,
        name: 'Pekerja 1',
        position: 'Operator Mesin',
      },
      create: {
        username: 'pekerja1',
        password: pekerjaPassword,
        role: UserRole.PEKERJA,
        email: 'pekerja1@example.com',
        name: 'Pekerja 1',
        position: 'Operator Mesin',
      },
    });

    return { message: '✅ User seed berhasil: superadmin, admin1, kaprog, pekerja1' };
  }
}
