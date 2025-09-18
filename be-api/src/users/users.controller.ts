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
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard) // semua endpoint butuh login
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🔹 ambil semua user
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // 🔹 bikin user baru (cek role dari JWT)
  @Post()
  create(@Body() data: CreateAdminDto, @Req() req: any) {
    return this.usersService.create(data, req.user.role as Role);
  }

  // 🔹 update user (opsional password)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<CreateAdminDto>) {
    return this.usersService.update(id, data);
  }

  // 🔹 hapus user
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // 🔹 statistik jumlah user per role (buat dashboard superadmin)
  @Get('stats')
  getStats() {
    return this.usersService.getStats();
  }
}
