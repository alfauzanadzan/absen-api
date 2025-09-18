// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

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

    if (!user)
      throw new UnauthorizedException('Login gagal, periksa username/password');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Login gagal, periksa username/password');

    const payload = { sub: user.id, username: user.username, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        name: user.name,
        position: user.position, // buat pekerja
      },
    };
  }

  // 🔹 SEED SEMUA USER (SUPERADMIN, ADMIN, KAPROG, PEKERJA)
  async seedSuperAdmin() {
    // ===== Super Admin =====
    const superAdminPassword = await bcrypt.hash('superadmin123', 10);
    await this.prisma.user.upsert({
      where: { username: 'superadmin' },
      update: {
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
        name: 'Super Admin',
      },
      create: {
        username: 'superadmin',
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
        email: 'superadmin@example.com',
        name: 'Super Admin',
      },
    });
    console.log(
      '⚡ Super Admin siap (username: superadmin, password: superadmin123)',
    );

    // ===== Admin =====
    const adminPassword = await bcrypt.hash('admin123', 10);
    await this.prisma.user.upsert({
      where: { username: 'admin1' },
      update: {
        password: adminPassword,
        role: 'ADMIN',
        name: 'Admin 1',
      },
      create: {
        username: 'admin1',
        password: adminPassword,
        role: 'ADMIN',
        email: 'admin@example.com',
        name: 'Admin 1',
      },
    });
    console.log('⚡ Admin (admin1) siap (password: admin123)');

    // ===== Kaprog =====
    const kaprogPassword = await bcrypt.hash('kaprog123', 10);
    await this.prisma.user.upsert({
      where: { username: 'kaprog' },
      update: {
        password: kaprogPassword,
        role: 'KAPROG',
        name: 'Kaprogram',
      },
      create: {
        username: 'kaprog',
        password: kaprogPassword,
        role: 'KAPROG',
        email: 'kaprog@example.com',
        name: 'Kaprogram',
      },
    });
    console.log('⚡ Kaprog (kaprog) siap (password: kaprog123)');

    // ===== Pekerja =====
    const pekerjaPassword = await bcrypt.hash('pekerja123', 10);
    await this.prisma.user.upsert({
      where: { username: 'pekerja1' },
      update: {
        password: pekerjaPassword,
        role: 'PEKERJA',
        name: 'Pekerja 1',
        position: 'Operator Mesin',
      },
      create: {
        username: 'pekerja1',
        password: pekerjaPassword,
        role: 'PEKERJA',
        email: 'pekerja1@example.com',
        name: 'Pekerja 1',
        position: 'Operator Mesin',
      },
    });
    console.log('⚡ Pekerja (pekerja1) siap (password: pekerja123)');
  }
}
