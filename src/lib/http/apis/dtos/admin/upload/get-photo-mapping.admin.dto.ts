import { IsNumber, IsString } from 'class-validator';

export class GetPhotoMappingAdminDto {
  @IsNumber()
  id: number;

  @IsString()
  key: string;

  @IsString()
  originalFileName: string;

  @IsNumber()
  orderIndex: number;
}
