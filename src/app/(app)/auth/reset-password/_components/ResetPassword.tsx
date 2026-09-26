"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import {
  completePasswordReset,
  requestPasswordReset,
  verifyPasswordReset,
} from "@/lib/http/apis/app/auth";
import {
  PasswordResetCodeInput,
  PasswordResetCompleteInput,
  PasswordResetPhoneInput,
  passwordResetCodeSchema,
  passwordResetCompleteSchema,
  passwordResetPhoneSchema,
} from "@/schemas/app/auth";

type Step = "phone" | "code" | "password";

const ResetPassword = () => {
  const { navigate } = useAppRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [expiresIn, setExpiresIn] = useState(300);
  const [resendIn, setResendIn] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  const phoneForm = useForm<PasswordResetPhoneInput>({
    resolver: zodResolver(passwordResetPhoneSchema),
    defaultValues: { phone: "" },
  });
  const codeForm = useForm<PasswordResetCodeInput>({
    resolver: zodResolver(passwordResetCodeSchema),
    defaultValues: { code: "" },
  });
  const passwordForm = useForm<PasswordResetCompleteInput>({
    resolver: zodResolver(passwordResetCompleteSchema),
    defaultValues: { password: "", passwordConfirmation: "" },
  });

  useEffect(() => {
    if (step !== "code") return;

    const timer = window.setInterval(() => {
      setExpiresIn(value => Math.max(value - 1, 0));
      setResendIn(value => Math.max(value - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step]);

  const formatSeconds = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
  };

  const handleRequest = async ({ phone }: PasswordResetPhoneInput) => {
    setIsLoading(true);
    try {
      await requestPasswordReset({ phone });
      setPhone(phone);
      setExpiresIn(300);
      setResendIn(60);
      setStep("code");
      toast.success("인증번호를 전송했습니다.");
    } catch (error: any) {
      toast.error(error.message || "인증번호 발송에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await requestPasswordReset({ phone });
      codeForm.reset();
      setExpiresIn(300);
      setResendIn(60);
      toast.success("인증번호를 다시 전송했습니다.");
    } catch (error: any) {
      toast.error(error.message || "인증번호 재전송에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async ({ code }: PasswordResetCodeInput) => {
    setIsLoading(true);
    try {
      const response = await verifyPasswordReset({ phone, code });
      setResetToken(response.data.resetToken);
      setStep("password");
    } catch (error: any) {
      toast.error(error.message || "인증번호 확인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (values: PasswordResetCompleteInput) => {
    setIsLoading(true);
    try {
      await completePasswordReset({ resetToken, ...values });
      toast.success("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
      navigate("replace", "/auth/login");
    } catch (error: any) {
      toast.error(error.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">비밀번호 재설정</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === "phone" && "가입한 전화번호를 입력해주세요."}
          {step === "code" && `${phone}로 전송된 인증번호를 입력해주세요.`}
          {step === "password" && "새로운 비밀번호를 입력해주세요."}
        </p>
      </div>

      {step === "phone" && (
        <Form {...phoneForm}>
          <form
            onSubmit={phoneForm.handleSubmit(handleRequest)}
            className="space-y-4"
          >
            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>전화번호</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="01012345678"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              인증번호 받기
            </Button>
          </form>
        </Form>
      )}

      {step === "code" && (
        <Form {...codeForm}>
          <form
            onSubmit={codeForm.handleSubmit(handleVerify)}
            className="space-y-4"
          >
            <FormField
              control={codeForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>인증번호</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="one-time-code"
                      placeholder="6자리 숫자"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={expiresIn === 0 ? "text-destructive" : ""}>
                남은 시간 {formatSeconds(expiresIn)}
              </span>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0"
                disabled={resendIn > 0 || isLoading}
                onClick={handleResend}
              >
                {resendIn > 0 ? `재전송 (${resendIn}초)` : "인증번호 재전송"}
              </Button>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || expiresIn === 0}
            >
              인증하기
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setStep("phone")}
            >
              전화번호 다시 입력
            </Button>
          </form>
        </Form>
      )}

      {step === "password" && (
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(handleComplete)}
            className="space-y-4"
          >
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>새 비밀번호</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="6자 이상"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>새 비밀번호 확인</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              비밀번호 변경
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export { ResetPassword };
