import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN) // ✅ hanya superadmin & admin bisa tambah akun
  async create(@Body() data: CreateUserDto, @Req() req: any) {
    return this.usersService.createUser(data, req.user);
  }

  @Put(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async update(@Param('id') id: string, @Body() data: Partial<CreateUserDto>, @Req() req: any) {
    return this.usersService.updateUser(id, data, req.user);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.usersService.removeUser(id, req.user);
  }
}
