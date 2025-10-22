import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Get('/barcode/:value')
  findByBarcode(@Param('value') value: string) {
    return this.departmentsService.findByBarcode(value);
  }

  @Post()
  create(
    @Body()
    body: { name: string; code: string; startTime: string; endTime: string },
  ) {
    return this.departmentsService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      code?: string;
      startTime?: string;
      endTime?: string;
    },
  ) {
    return this.departmentsService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.departmentsService.delete(id);
  }
}
