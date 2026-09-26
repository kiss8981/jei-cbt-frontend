import { QuestionType } from "../../common/question-type.enum";

export interface CreateQuestionAdminDto {
  unitId: number;
  type: QuestionType;
  title: string;
  explanation?: string;
  additionalText?: string;
  answersForCorrectAnswerForTrueFalse?: boolean;
  answersForMultipleChoice?: { content: string; isCorrect: boolean }[];
  answersForMatching?: { leftItem: string; rightItem: string }[];
  answersForShortAnswer?: string[];
  answersForMultipleShortAnswer?: {
    content: string;
    orderIndex: number;
  }[];
  answersForInterview?: string;
}

export interface CreateQuestionResponseAdminDto {
  questionId: number;
  message: string;
}
