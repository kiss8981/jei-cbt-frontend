import { IsNumberString, IsOptional, IsString } from "class-validator";

export class GetQuestionListQueryAdminDto {
  @IsOptional()
  @IsNumberString()
  page: number = 1;

  @IsOptional()
  @IsNumberString()
  limit: number = 40;

  @IsOptional()
  @IsString({ each: true })
  unitIds?: number[];

  @IsOptional()
  @IsString()
  keyword?: string;
}
