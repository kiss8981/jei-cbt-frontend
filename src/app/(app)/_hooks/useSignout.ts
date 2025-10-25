import useAppRouter from "@/hooks/useAppRouter";
import { signout } from "@/lib/http/apis/app/auth";
import { useState } from "react";
import { toast } from "sonner";

export const useSignout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useAppRouter();

  const handleSignout = async () => {
    setIsLoading(true);
    try {
      await signout();

      toast.success("회원 탈퇴가 완료되었습니다.");

      navigate("reset", "/auth/login", "webview");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  return { handleSignout, isLoading };
};
