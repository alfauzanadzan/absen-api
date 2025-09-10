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

    if (!user) throw new UnauthorizedException('Login gagal, periksa username/password');

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
      },
    };
  }

  // 🔹 SEED SUPER ADMIN & ADMIN
  async seedSuperAdmin() {
    // Super Admin
    const superAdminPassword = await bcrypt.hash('superadmin123', 10);
    await this.prisma.user.upsert({
      where: { email: 'superadmin@example.com' },
      update: { password: superAdminPassword },
      create: {
        username: 'superadmin',
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
        email: 'superadmin@example.com',
      },
    });
    console.log('⚡ Super Admin siap (password: superadmin123)');

    // Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    await this.prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: { password: adminPassword, username: 'admin1' },
      create: {
        username: 'admin1',
        password: adminPassword,
        role: 'ADMIN',
        email: 'admin@example.com',
      },
    });
    console.log('⚡ Admin (admin1) siap (password: admin123)');
  }
}
