import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { UserRole } from '@prisma/client'

export class CreateUserDto {
  @IsString()
  username!: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @MinLength(6)
  password!: string

  @IsEnum(UserRole)
  role!: UserRole

  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  departmentName?: string

  @IsString()
  @IsOptional()
  position?: string

  @IsString()
  @IsOptional()
  departmentId?: string // kalau backend lo udah link ke tabel departments
}
