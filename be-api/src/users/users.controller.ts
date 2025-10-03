import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
// @UseGuards(JwtAuthGuard) // COMMENT DULU UNTUK TESTING
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<CreateUserDto>) {
    return this.usersService.updateUser(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}