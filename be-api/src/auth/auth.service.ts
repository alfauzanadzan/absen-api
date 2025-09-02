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

    const user = await this.prisma.user.findUnique({ where: { username } });
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
    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    const existing = await this.prisma.user.findUnique({
      where: { username: 'superadmin' },
    });

    if (existing) {
      await this.prisma.user.update({
        where: { username: 'superadmin' },
        data: { password: hashedPassword },
      });
      console.log('⚡ Super Admin password direset ke superadmin123');
    } else {
      await this.prisma.user.create({
        data: {
          username: 'superadmin',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          email: 'superadmin@example.com',
        },
      });
      console.log('⚡ Super Admin berhasil dibuat (superadmin123)');
    }
  }
}
