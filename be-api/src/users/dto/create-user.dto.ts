import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { Role } from '../../auth/roles.enum';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  position?: string; // ✅ khusus pekerja

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  departmentId?: string; // ✅ khusus kaprog
}
