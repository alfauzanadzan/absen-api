import { IsString } from 'class-validator';
import { UserRole } from '../../common/types';

export class CheckOutDto {   // ⬅️ tetap CheckOutDto (huruf O besar)
  @IsString()
  userId: string;

  role: UserRole;

  @IsString()
  qrValue: string;
}
