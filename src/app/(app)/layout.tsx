import type { Metadata } from "next";
import { AuthStoreProvider } from "@/lib/store/providers/auth.provider";
import { cookies } from "next/headers";
import { me } from "@/lib/http/apis/app/auth";

export const metadata: Metadata = {
  title: "홈",
};

export default async function AppRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = await cookies();
  const accessToken = cookie.get("accessToken")?.value ?? null;
  const refreshToken = cookie.get("refreshToken")?.value ?? null;
  const authMe = await me(accessToken ?? undefined).catch(() => null);

  return (
    <AuthStoreProvider
      initStore={{
        accessToken,
        refreshToken,
        user: authMe?.data ?? null,
      }}
    >
      {children}
    </AuthStoreProvider>
  );
}
