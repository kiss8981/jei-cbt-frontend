import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePhotoMappingAdminDto {
  @IsString()
  key: string;

  @IsNumber()
  orderIndex: number;

  @IsOptional()
  @IsBoolean()
  delete?: boolean;
}
