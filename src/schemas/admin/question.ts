import { z } from "zod";

export const adminUpdateQuestionSchema = z.object({
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
});

export type AdminUpdateQuestionInput = z.infer<
  typeof adminUpdateQuestionSchema
>;
