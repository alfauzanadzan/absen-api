import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =======================
  // LOGIN
  // =======================
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // =======================
  // SEED SUPERADMIN
  // =======================
  @Post('seed-superadmin')
  async seedSuperAdmin() {
    return this.authService.seedSuperAdmin();
  }
}
