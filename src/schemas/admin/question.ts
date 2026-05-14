import { z } from "zod";

export const adminUpdateQuestionSchema = z.object({
  unitId: z.number().optional(),
  title: z.string().min(1, { message: "문제 제목은 필수입니다." }),
  explanation: z.string().optional(),
  additionalText: z.string().optional(),
  // 단답형 정답 리스트 추가
  answersForShortAnswers: z
    .array(
      z.object({
        id: z.number().nullable().optional(), // 기존 정답은 ID 있음, 새 정답은 null/undefined
        content: z.string().min(1, { message: "정답 내용을 입력해주세요." }),
      })
    )
    .optional(),
  answersForMatching: z
    .array(
      z.object({
        leftItemId: z.number().nullable().optional(), // 기존 ID (없으면 null)
        pairingItemId: z.number().nullable().optional(), // 기존 ID (없으면 null)
        leftItem: z.string().min(1, { message: "왼쪽 항목은 필수입니다." }),
        rightItem: z.string().min(1, { message: "오른쪽 항목은 필수입니다." }),
      })
    )
    .optional(),

  answersForCorrectAnswerForTrueFalse: z.boolean().optional(),

  answersForMultipleChoice: z
    .array(
      z.object({
        id: z.number().nullable().optional(), // 기존 ID (없으면 null)
        content: z.string().min(1, { message: "보기 내용을 입력해주세요." }),
        isCorrect: z.boolean(), // 정답 여부
      })
    )
    .optional(),

  answersForMultipleShortAnswer: z
    .array(
      z.object({
        id: z.number().nullable().optional(),
        content: z.string().min(1, { message: "빈칸 정답을 입력해주세요." }),
        orderIndex: z.number(), // 순서 (0부터 시작)
      })
    )
    .optional(),

  answersForInterview: z.string().optional(),
});

export type AdminUpdateQuestionInput = z.infer<
  typeof adminUpdateQuestionSchema
>;
