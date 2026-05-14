import { IsOptional, IsString } from "class-validator";
import { QuestionType } from "../../common/question-type.enum";

export class ExportQuestionListQueryAdminDto {
  @IsOptional()
  @IsString({ each: true })
  unitIds?: number[];

  @IsOptional()
  @IsString({ each: true })
  questionTypes?: QuestionType[];

  @IsOptional()
  @IsString()
  keyword?: string;
}
