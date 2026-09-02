"use client";

import { useEffect, useState } from "react";

export const NATIVE_BOTTOM_TABS_MIN_VERSION = "1.1.0";

interface AppRuntimeContext {
  version: string | null;
  platform: string;
  isWebView: boolean;
}

const compareVersions = (left: string, right: string) => {
  const leftParts = left.split(".").map(part => Number(part) || 0);
  const rightParts = right.split(".").map(part => Number(part) || 0);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }

  return 0;
};

export default function useAppVersion() {
  const [context, setContext] = useState<AppRuntimeContext | null>(null);

  useEffect(() => {
    let legacyFallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const readAppContext = () => {
      const isWebView = !!window.ReactNativeWebView;
      const appContext = window.__JEI_CBT_APP__;

      if (legacyFallbackTimer) {
        clearTimeout(legacyFallbackTimer);
        legacyFallbackTimer = null;
      }

      if (isWebView && !appContext) {
        legacyFallbackTimer = setTimeout(() => {
          setContext({ version: null, platform: "legacy", isWebView: true });
        }, 150);
        return;
      }

      setContext({
        version: isWebView ? (appContext?.version ?? null) : null,
        platform: isWebView ? (appContext?.platform ?? "legacy") : "web",
        isWebView,
      });
    };

    window.addEventListener("jei-cbt-app-context", readAppContext);
    readAppContext();

    return () => {
      window.removeEventListener("jei-cbt-app-context", readAppContext);
      if (legacyFallbackTimer) clearTimeout(legacyFallbackTimer);
    };
  }, []);

  const supportsNativeBottomTabs =
    !!context?.isWebView &&
    !!context.version &&
    compareVersions(context.version, NATIVE_BOTTOM_TABS_MIN_VERSION) >= 0;

  return {
    isReady: context !== null,
    isWebView: context?.isWebView ?? false,
    appVersion: context?.version ?? null,
    platform: context?.platform ?? "unknown",
    supportsNativeBottomTabs,
  };
}
