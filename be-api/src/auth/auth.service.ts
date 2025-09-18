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
        name: user.name, // ✅ tambahin biar frontend bisa dapet juga
      },
    };
  }

  // 🔹 SEED SUPERADMIN, ADMIN, KAPROG
  async seedSuperAdmin() {
    // ===== Super Admin =====
    const superAdminPassword = await bcrypt.hash('superadmin123', 10);
    await this.prisma.user.upsert({
      where: { username: 'superadmin' },
      update: {
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
        name: 'Super Admin', // ✅ isi name
      },
      create: {
        username: 'superadmin',
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
        email: 'superadmin@example.com',
        name: 'Super Admin', // ✅ isi name
      },
    });
    console.log(
      '⚡ Super Admin siap (username: superadmin, password: superadmin123)',
    );

    // ===== Admin =====
    const adminUsername = 'admin1';
    const adminPassword = await bcrypt.hash('admin123', 10);
    await this.prisma.user.upsert({
      where: { username: adminUsername },
      update: {
        password: adminPassword,
        role: 'ADMIN',
        name: 'Admin 1', // ✅ isi name
      },
      create: {
        username: adminUsername,
        password: adminPassword,
        role: 'ADMIN',
        email: 'admin@example.com',
        name: 'Admin 1', // ✅ isi name
      },
    });
    console.log(`⚡ Admin (${adminUsername}) siap (password: admin123)`);

    // ===== Kaprog =====
    const kaprogUsername = 'kaprog';
    const kaprogPassword = await bcrypt.hash('kaprog123', 10);
    await this.prisma.user.upsert({
      where: { username: kaprogUsername },
      update: {
        password: kaprogPassword,
        role: 'KAPROG',
        name: 'Kaprogram', // ✅ isi name
      },
      create: {
        username: kaprogUsername,
        password: kaprogPassword,
        role: 'KAPROG',
        email: 'kaprog@example.com',
        name: 'Kaprogram', // ✅ isi name
      },
    });
    console.log(`⚡ Kaprog (${kaprogUsername}) siap (password: kaprog123)`);
  }
}
