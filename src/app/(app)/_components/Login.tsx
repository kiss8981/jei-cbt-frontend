"use client";

import useAppRouter from "@/hooks/useAppRouter";
import { refreshToken } from "@/lib/http/apis/app/auth.server";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const Login = () => {
  const { navigate } = useAppRouter();
  const pathname = usePathname();

  useEffect(() => {
    navigate("reset", "/auth/login?redirect=" + encodeURIComponent(pathname));
  }, []);

  return null;
};

export default Login;
