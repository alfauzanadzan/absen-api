import { Injectable, NotFoundException } from '@nestjs/common';

export type Department = {
  id: string;
  name: string;
};

@Injectable()
export class DepartmentsService {
  private departments: Department[] = [
    { id: '1', name: 'IT' },
    { id: '2', name: 'Marketing' },
  ];

  findAll(): Department[] {
    return this.departments;
  }

  findById(id: string): Department {
    const department = this.departments.find(dept => dept.id === id);
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  findByName(name: string): Department {
    const department = this.departments.find(dept => dept.name === name);
    if (!department) {
      throw new NotFoundException(`Department with name ${name} not found`);
    }
    return department;
  }
}