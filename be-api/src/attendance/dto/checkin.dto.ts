import { IsString, IsEnum } from 'class-validator';
import { UserRole } from '../../common/types';

export class CheckinDto {
  @IsString()
  userId: string;

 @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  qrValue: string;
}
