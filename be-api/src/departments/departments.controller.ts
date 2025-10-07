import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { DepartmentsService } from './departments.service';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  // ✅ Ambil semua department
  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  // ✅ Ambil 1 department by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  // ✅ Ambil barcode by value (dipakai saat scan QR)
  @Get('barcode/:value')
  async findByBarcode(@Param('value') value: string) {
    const barcode = await this.departmentsService.findByBarcode(value);

    if (!barcode) {
      throw new NotFoundException('Barcode tidak ditemukan');
    }

    return barcode; // ✅ hasil sudah include department
  }
}
