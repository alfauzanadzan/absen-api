import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UserRole } from '../common/types';

@Controller('users')
@UseGuards(JwtAuthGuard) // ✅ semua endpoint butuh login
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🔹 ambil semua user
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  // 🔹 bikin user baru (role creator diambil dari JWT)
  @Post()
  async create(@Body() data: CreateAdminDto, @Req() req: any) {
    const creatorRole = req.user.role as UserRole; // ✅ ambil dari payload JWT
    return this.usersService.create(data, creatorRole);
  }

  // 🔹 update user (opsional password)
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<CreateAdminDto>) {
    return this.usersService.update(id, data);
  }

  // 🔹 hapus user
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // 🔹 statistik jumlah user per role (buat dashboard superadmin)
  @Get('stats')
  async getStats() {
    return this.usersService.getStats();
  }
}
