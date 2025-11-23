import { IsNumberString, IsOptional, IsString } from "class-validator";

export class GetQuestionSessionListQueryAdminDto {
  @IsOptional()
  @IsNumberString()
  page: number = 1;

  @IsOptional()
  @IsNumberString()
  limit: number = 40;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString({ each: true })
  userIds?: number[];
}
