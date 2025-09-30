import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../common/types'; // ✅ enum lokal

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // =======================
  // LOGIN
  // =======================
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

  // =======================
  // SEED SUPERADMIN (manual)
  // =======================
  async seedSuperAdmin() {
    const defaultPassword = await bcrypt.hash('123456', 10);

    await this.prisma.user.upsert({
      where: { username: 'superadmin' },
      update: {
        password: defaultPassword,
        role: UserRole.SUPERADMIN,
        name: 'Super Admin',
      },
      create: {
        username: 'superadmin',
        password: defaultPassword,
        role: UserRole.SUPERADMIN,
        email: 'superadmin@example.com',
        name: 'Super Admin',
      },
    });

    return { message: '✅ Superadmin berhasil dibuat (password = 123456)' };
  }
}
