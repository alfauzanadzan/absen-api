import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto';
import { UserRole } from '../../common/types';

export class UpdateUserDto extends PartialType(CreateAdminDto) {
  role?: UserRole;
}
