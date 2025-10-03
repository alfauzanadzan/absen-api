import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../common/types'; // enum: SUPERADMIN | ADMIN | KAPROG | PEKERJA

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
      include: { department: true } // 🔥 include department relation
    });
    if (!user) throw new UnauthorizedException('Login gagal, periksa username/password');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Login gagal, periksa username/password');

    // 🔥 Tentukan departmentName untuk KAPROG
    let departmentName = user.departmentName?.trim();
    if (user.role === UserRole.KAPROG) {
      if (!departmentName && user.department) {
        departmentName = user.department.name; // Ambil dari relasi department
      }
      if (!departmentName) {
        departmentName = this.detectDepartment(user); // fallback logic
      }
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
        departmentName, // ✅ attach departmentName
      },
    };
  }

  // =======================
  // DETECT DEPARTMENT DEFAULT
  // =======================
  detectDepartment(user: any): string {
    const username = user.username.toLowerCase();
    const email = (user.email || '').toLowerCase();

    if (username.includes('marketing') || username.includes('mkt') || username.includes('mia')) return 'Marketing';
    if (username.includes('it') || username.includes('tech') || username.includes('hizam')) return 'IT';
    if (email.includes('marketing') || email.includes('mkt') || email.includes('almia')) return 'Marketing';
    if (email.includes('it') || email.includes('tech') || email.includes('alhizam')) return 'IT';

    if (username === 'mia' || username === 'almia') return 'Marketing';
    if (username === 'alhizam') return 'IT';

    return 'IT'; // fallback default
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
