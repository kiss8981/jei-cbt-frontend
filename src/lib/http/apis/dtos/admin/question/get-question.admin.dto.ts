import { Expose } from "class-transformer";
import { QuestionType } from "../../common/question-type.enum";

export class GetQuestionAdminDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  explanation: string;

  @Expose()
  additionalText: string;

  @Expose()
  unitId: number;

  @Expose()
  unitName: string;

  @Expose()
  createdAt: Date;
}
export type GetQuestionAdminUnionDto =
  | GetTrueFalseQuestionAdminDto
  | GetMultipleChoiceQuestionAdminDto
  | GetMatchingQuestionAdminDto
  | GetShortAnswerQuestionAdminDto
  | GetCompletionQuestionAdminDto
  | GetMultipleShortAnswerQuestionAdminDto
  | GetInterviewQuestionAdminDto;

export class GetTrueFalseQuestionAdminDto extends GetQuestionAdminDto {
  @Expose()
  type: QuestionType.TRUE_FALSE;

  @Expose()
  question: string;

  @Expose()
  correctAnswer: boolean;
}

export class GetMultipleChoiceQuestionAdminDto extends GetQuestionAdminDto {
  @Expose()
  type: QuestionType.MULTIPLE_CHOICE;

  @Expose()
  question: string;

  @Expose()
  choices: { id: number; option: string }[];

  @Expose()
  isMultipleAnswer: boolean;
}

export class GetMatchingQuestionAdminDto extends GetQuestionAdminDto {
  @Expose()
  type: QuestionType.MATCHING;

  @Expose()
  leftItems: {
    id: number;
    option: string;
  }[];

  @Expose()
  rightItems: {
    id: number;
    option: string;
  }[];
}

export class GetShortAnswerQuestionAdminDto extends GetQuestionAdminDto {
  @Expose()
  type: QuestionType.SHORT_ANSWER;

  @Expose()
  question: string;
}

export class GetCompletionQuestionAdminDto extends GetQuestionAdminDto {
  @Expose()
  type: QuestionType.COMPLETION;

  @Expose()
  question: string; // 네덜란드의 수도는 {0}이고, 프랑스의 수도는 {1}이다.
}

export class GetMultipleShortAnswerQuestionAdminDto extends GetQuestionAdminDto {
  @Expose()
  type: QuestionType.MULTIPLE_SHORT_ANSWER;

  @Expose()
  question: string; // 네덜란드의 수도는 {0}이고, 프랑스의 수도는 {1}이다.
}

export class GetInterviewQuestionAdminDto extends GetQuestionAdminDto {
  @Expose()
  type: QuestionType.INTERVIEW;

  @Expose()
  question: string; // 면접 질문 내용
}
