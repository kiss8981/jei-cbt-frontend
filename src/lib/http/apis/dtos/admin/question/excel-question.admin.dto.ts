import { QuestionType } from "../../common/question-type.enum";

export interface QuestionExcelFieldDiffAdminDto {
  field: string;
  currentValue: string | number | boolean | null;
  uploadedValue: string | number | boolean | null;
}

export interface QuestionExcelChildDiffAdminDto {
  kind: "create" | "update" | "delete" | "reorder" | "conflict" | "unchanged";
  itemId?: number | null;
  label: string;
  currentValue?: string | number | boolean | null;
  uploadedValue?: string | number | boolean | null;
}

export interface ParsedQuestionExcelChoiceAdminDto {
  id?: number | null;
  content: string;
  isCorrect?: boolean;
  orderIndex?: number;
}

export interface ParsedQuestionExcelMatchingAdminDto {
  leftItemId?: number | null;
  pairingItemId?: number | null;
  leftItem: string;
  rightItem: string;
  orderIndex: number;
}

export interface ParsedQuestionExcelRowAdminDto {
  sheetName: string;
  rowNumber: number;
  questionId?: number | null;
  unitId: number;
  type: QuestionType;
  title: string;
  explanation?: string | null;
  additionalText?: string | null;
  answersForCorrectAnswerForTrueFalse?: boolean;
  answersForInterview?: string;
  answersForShortAnswers?: ParsedQuestionExcelChoiceAdminDto[];
  answersForMultipleShortAnswer?: ParsedQuestionExcelChoiceAdminDto[];
  answersForMultipleChoice?: ParsedQuestionExcelChoiceAdminDto[];
  answersForMatching?: ParsedQuestionExcelMatchingAdminDto[];
}

export interface PreviewQuestionExcelItemAdminDto {
  sheetName: string;
  rowNumber: number;
  questionId?: number | null;
  title: string;
  type: QuestionType;
  status: "create" | "update" | "unchanged" | "conflict";
  fieldDiffs: QuestionExcelFieldDiffAdminDto[];
  childDiffs: QuestionExcelChildDiffAdminDto[];
  conflicts: string[];
  parsedData: ParsedQuestionExcelRowAdminDto;
  selectedAction?: "APPLY" | "SKIP";
}

export interface PreviewQuestionExcelResponseAdminDto {
  summary: {
    totalCount: number;
    createCount: number;
    updateCount: number;
    unchangedCount: number;
    conflictCount: number;
  };
  items: PreviewQuestionExcelItemAdminDto[];
}

export interface CommitQuestionExcelAdminDto {
  items: PreviewQuestionExcelItemAdminDto[];
}
