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
    // akses prisma.user dari PrismaClient
    const user = await (this.prisma as any).user.findUnique({ where: { username } });
    if (!user) throw new UnauthorizedException('Username atau password salah');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Username atau password salah');

    const payload = { sub: user.id, username: user.username, role: user.role };

    // 🔹 Return token + info user (supaya FE bisa arahkan sesuai role)
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

  // 🔹 SEED / RESET SUPER ADMIN
  async seedSuperAdmin() {
    // Seed/Reset Super Admin
    const superAdminPassword = await bcrypt.hash('superadmin123', 10);
    const superAdmin = await (this.prisma as any).user.findUnique({ where: { username: 'superadmin' } });
    if (superAdmin) {
      await (this.prisma as any).user.update({
        where: { username: 'superadmin' },
        data: { password: superAdminPassword },
      });
      console.log('⚡ Super Admin password direset ke superadmin123 (JANGAN GUNAKAN DI PRODUKSI)');
    } else {
      await (this.prisma as any).user.create({
        data: {
          username: 'superadmin',
          password: superAdminPassword,
          role: 'SUPER_ADMIN',
          email: 'superadmin@example.com',
        },
      });
      console.log('⚡ Super Admin berhasil dibuat (password: superadmin123, JANGAN GUNAKAN DI PRODUKSI)');
    }

    // Seed/Reset Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await (this.prisma as any).user.findUnique({ where: { username: 'admin@example.com' } });
    if (admin) {
      await (this.prisma as any).user.update({
        where: { username: 'admin@example.com' },
        data: { password: adminPassword },
      });
      console.log('⚡ Admin password direset ke admin123 (JANGAN GUNAKAN DI PRODUKSI)');
    } else {
      await (this.prisma as any).user.create({
        data: {
          username: 'admin@example.com',
          password: adminPassword,
          role: 'ADMIN',
          email: 'admin@example.com',
        },
      });
      console.log('⚡ Admin berhasil dibuat (username & email: admin@example.com, password: admin123, JANGAN GUNAKAN DI PRODUKSI)');
    }
  }
}
