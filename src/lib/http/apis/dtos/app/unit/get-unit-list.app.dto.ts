import { Expose } from 'class-transformer';
import { QuestionType } from '../../common/question-type.enum';

export class GetUnitListAppDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  examIds: number[];

  @Expose()
  questionTypes: QuestionType[];
}
