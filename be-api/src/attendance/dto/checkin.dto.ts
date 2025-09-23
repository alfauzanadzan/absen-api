import { IsString, IsUUID, IsIn } from 'class-validator';

export class CheckinDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsIn(['PEKERJA', 'KAPROG'])
  role: string;

  @IsString()
  qrValue: string;
}
