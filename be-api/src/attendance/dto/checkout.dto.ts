import { IsString, IsUUID, IsIn } from 'class-validator';

export class CheckoutDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsIn(['PEKERJA', 'KAPROG'])
  role: string;

  @IsString()
  qrValue: string;
}
