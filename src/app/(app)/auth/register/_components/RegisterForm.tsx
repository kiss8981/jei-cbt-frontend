"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// Link 대신 useAppRouter의 navigate를 사용하므로 제거하거나 필요한 경우에만 유지합니다.
// import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// 스키마 및 타입 import (경로에 맞게 수정 필요)
import { signupSchema, SignupInput } from "@/schemas/app/auth";
// useAppRouter와 toast는 예시 코드에 없지만, 실제 환경에 맞게 추가했습니다.
import useAppRouter from "@/hooks/useAppRouter";
import { me, register } from "@/lib/http/apis/app/auth";
import { useAuthStore } from "@/lib/store/providers/auth.provider";
import { toast } from "sonner";

export function RegisterForm() {
  const { navigate } = useAppRouter();
  const { setTokens, setUser, user } = useAuthStore(state => state);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      phone: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  });

  async function onSubmit(values: SignupInput) {
    // 💡 실제 회원가입 API 호출 로직
    const { confirmPassword, ...dataToSend } = values; // 비밀번호 확인 필드는 제외

    try {
      const { data } = await register({
        name: dataToSend.name,
        phone: dataToSend.phone,
        password: dataToSend.password,
      });

      setTokens(data.accessToken, data.refreshToken);

      const user = await me(data.accessToken);

      setUser(user.data);

      navigate("replace", "/");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "회원가입에 실패했습니다.");
    }
  }

  return (
    <div className="w-full max-w-sm p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <Input
                    placeholder="홍길동"
                    type="text"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 1. 전화번호 필드 */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>전화번호</FormLabel>
                <FormControl>
                  <Input
                    placeholder="01012345678"
                    type="tel"
                    autoComplete="tel"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 2. 비밀번호 필드 */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>비밀번호</FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 3. 비밀번호 확인 필드 */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>비밀번호 확인</FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                {/* 비밀번호 일치 여부 에러 메시지는 이 위치에 표시됩니다. */}
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-6">
            회원가입
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        이미 계정이 있으신가요? {/* 버튼 클릭 시 로그인 페이지로 이동 */}
        <button
          onClick={() => {
            navigate("replace", "/auth/login");
          }}
          className="underline text-blue-600 ml-1"
        >
          로그인
        </button>
      </div>
    </div>
  );
}
