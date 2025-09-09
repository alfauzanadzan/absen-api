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

    console.log('🔹 Login attempt:', username);
    console.log(
      '🔹 User found:',
      user ? { username: user.username, password: user.password } : null,
    );

    if (!user)
      throw new UnauthorizedException('Login gagal, periksa username/password');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔹 Password valid:', isPasswordValid);

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
        // email tidak diupdate supaya gak bentrok
      },
      create: {
        username: 'superadmin',
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
        email: 'superadmin@example.com',
      },
    });
    console.log('⚡ Super Admin siap (username: superadmin, password: superadmin123)');

    // ===== Admin =====
    const adminUsername = 'admin1'; // sesuai database lu
    const adminPassword = await bcrypt.hash('admin123', 10);
    await this.prisma.user.upsert({
      where: { username: adminUsername },
      update: {
        password: adminPassword,
        role: 'ADMIN',
        // jangan update email supaya tidak bentrok
      },
      create: {
        username: adminUsername,
        password: adminPassword,
        role: 'ADMIN',
        email: 'admin@example.com',
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
        // jangan update email
      },
      create: {
        username: kaprogUsername,
        password: kaprogPassword,
        role: 'KAPROG',
        email: 'kaprog@example.com',
      },
    });
    console.log(`⚡ Kaprog (${kaprogUsername}) siap (password: kaprog123)`);
  }
}
