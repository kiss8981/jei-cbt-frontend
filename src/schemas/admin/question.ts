import { z } from "zod";

export const adminUpdateQuestionSchema = z.object({
  title: z.string().min(1, { message: "질문을 입력해주세요." }),
  explanation: z.string().optional(),
  additionalText: z.string().optional(),
  images: z.array(z.string()).min(0),
});

export type AdminUpdateQuestionInput = z.infer<
  typeof adminUpdateQuestionSchema
>;
