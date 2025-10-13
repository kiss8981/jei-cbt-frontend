"use client";

import { useRouter } from "next/navigation";

const useAppRouter = () => {
  const router = useRouter();
  const isWebView =
    typeof window !== "undefined" && !!window.ReactNativeWebView;

  const navigate = (
    method: "push" | "replace" | "back" | "forward" | "reset",
    path?: string,
    screenName?: string,
    data?: Record<string, unknown>
  ) => {
    const nativeMethodMap = {
      push: "PUSH",
      replace: "REPLACE",
      back: "GO_BACK",
      forward: "GO_FORWARD",
      reset: "RESET",
    };

    if (isWebView) {
      return window.ReactNativeWebView?.postMessage(
        JSON.stringify({
          type: "ROUTER_EVENT",
          method: nativeMethodMap[method],
          path,
          screenName,
          data,
        })
      );
    } else {
      switch (method) {
        case "push":
          if (!path) throw new Error("path 설정 오류");
          return router.push(path);
        case "replace":
          if (!path) throw new Error("path 설정 오류");
          return router.replace(path);
        case "reset":
          if (!path) throw new Error("path 설정 오류");
          router.replace(path);
          router.refresh();
          return;
        case "back":
          return router.back();
        case "forward":
          return router.forward?.();
      }
    }
  };

  return { navigate };
};

export default useAppRouter;
