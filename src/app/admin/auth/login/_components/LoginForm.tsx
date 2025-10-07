"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import useAppRouter from "@/hooks/useAppRouter";
import { login, me } from "@/lib/http/apis/admin/auth";
import { toast } from "sonner";
import { useAdminAuthStore } from "@/lib/store/providers/admin-auth.provider";
import { AdminLoginInput, adminLoginSchema } from "@/schemas/admin/auth";

export function AdminLoginForm() {
  const { navigate } = useAppRouter();
  const { setTokens, setUser, user } = useAdminAuthStore(state => state);

  const form = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      id: "",
      password: "",
    },
  });

  async function onSubmit(values: AdminLoginInput) {
    try {
      const { data } = await login({
        id: values.id,
        password: values.password,
      });

      setTokens(data.accessToken, data.refreshToken);

      const user = await me(data.accessToken);

      setUser(user.data);

      navigate("reset", "/admin", "index");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "로그인중 오류가 발생했습니다.");
    }
  }

  return (
    <div className="w-full max-w-sm p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* 전화번호 필드 */}
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>아이디</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
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
    </div>
  );
}
