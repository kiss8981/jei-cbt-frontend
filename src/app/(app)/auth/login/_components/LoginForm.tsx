"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";

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

import { loginSchema, LoginInput } from "@/schemas/app/auth";
import useAppRouter from "@/hooks/useAppRouter";
import { login, me } from "@/lib/http/apis/app/auth";
import { useAuthStore } from "@/lib/store/providers/auth.provider";
import { toast } from "sonner";

export function LoginForm() {
  const { navigate } = useAppRouter();
  const { setTokens, setUser, user } = useAuthStore(state => state);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    try {
      const { data } = await login({
        phone: values.phone,
        password: values.password,
      });

      setTokens(data.accessToken, data.refreshToken);

      const user = await me(data.accessToken);

      setUser(user.data);

      navigate("reset", "/", "index");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "로그인중 오류가 발생했습니다.");
    }
  }

  // Card 컴포넌트 없이, 순수 div와 shadcn/ui 폼 요소만 사용
  return (
    <div className="w-full max-w-sm p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* 전화번호 필드 */}
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
                    autoComplete="tel" // 웹뷰 접근성 및 자동 완성 지원
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 비밀번호 필드 */}
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
                    autoComplete="current-password" // 자동 완성 지원
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-6">
            로그인
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        아직 계정이 없으신가요?{" "}
        <button
          onClick={() => {
            navigate("replace", "/auth/register");
          }}
          className="underline text-blue-600 ml-1"
        >
          회원가입
        </button>
      </div>
    </div>
  );
}
