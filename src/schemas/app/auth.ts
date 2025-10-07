// src/schemas/auth.ts

import { z } from "zod";

// 전화번호 형식 (간단 예시: 숫자만 10~11자리)
const phoneRegex = new RegExp(/^(\d{10,11})$/);

// 로그인 스키마
export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, { message: "전화번호를 입력해주세요." })
    .regex(phoneRegex, { message: "올바른 전화번호 형식이 아닙니다." }),
  password: z
    .string()
    .min(1, { message: "비밀번호를 입력해주세요." })
    .min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    phone: z
      .string()
      .min(1, { message: "전화번호를 입력해주세요." })
      .regex(phoneRegex, { message: "올바른 전화번호 형식이 아닙니다." }),
    password: z
      .string()
      .min(1, { message: "비밀번호를 입력해주세요." })
      .min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
    confirmPassword: z
      .string()
      .min(1, { message: "비밀번호를 다시 입력해주세요." }),
    name: z.string().min(1, { message: "이름을 입력해주세요." }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"], // 에러 메시지를 confirmPassword 필드에 표시
  });

export type SignupInput = z.infer<typeof signupSchema>;
