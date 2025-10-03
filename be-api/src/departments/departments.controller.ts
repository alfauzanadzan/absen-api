import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DepartmentsService, Department } from './departments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('departments')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  findAll(): Department[] {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Department {
    return this.departmentsService.findById(id);
  }
}