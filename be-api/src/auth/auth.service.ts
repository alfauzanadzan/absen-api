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
  // SEED USER DEFAULT
  // =======================
  async seedSuperAdmin() {
    const defaultPassword = await bcrypt.hash('123456', 10);

    // superadmin
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

    // admin
    await this.prisma.user.upsert({
      where: { username: 'admin1' },
      update: {
        password: defaultPassword,
        role: UserRole.ADMIN,
        name: 'Admin 1',
      },
      create: {
        username: 'admin1',
        password: defaultPassword,
        role: UserRole.ADMIN,
        email: 'admin1@example.com', // ✅ beda email
        name: 'Admin 1',
      },
    });

    // kaprog
    await this.prisma.user.upsert({
      where: { username: 'kaprog' },
      update: {
        password: defaultPassword,
        role: UserRole.KAPROG,
        name: 'Kaprogram',
      },
      create: {
        username: 'kaprog',
        password: defaultPassword,
        role: UserRole.KAPROG,
        email: 'kaprog@example.com', // ✅ beda email
        name: 'Kaprogram',
      },
    });

    // pekerja
    await this.prisma.user.upsert({
      where: { username: 'pekerja1' },
      update: {
        password: defaultPassword,
        role: UserRole.PEKERJA,
        name: 'Pekerja 1',
        position: 'Operator Mesin',
      },
      create: {
        username: 'pekerja1',
        password: defaultPassword,
        role: UserRole.PEKERJA,
        email: 'pekerja1@example.com', // ✅ beda email
        name: 'Pekerja 1',
        position: 'Operator Mesin',
      },
    });

    return { message: '✅ User seed berhasil (semua password = 123456)' };
  }
}
