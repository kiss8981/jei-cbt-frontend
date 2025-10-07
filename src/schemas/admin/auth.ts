import { z } from "zod";

// 로그인 스키마
export const adminLoginSchema = z.object({
  id: z.string().min(1, { message: "아이디를 입력해주세요." }),
  password: z
    .string()
    .min(1, { message: "비밀번호를 입력해주세요." })
    .min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
