import type { Metadata } from "next";
import { AuthStoreProvider } from "@/lib/store/providers/auth.provider";
import { cookies } from "next/headers";
import { me } from "@/lib/http/apis/app/auth";
import SafeArea from "@/components/SafeArea";

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
      <div
        dangerouslySetInnerHTML={{
          __html: `
        `,
        }}
      ></div>

      <SafeArea>{children}</SafeArea>
    </AuthStoreProvider>
  );
}
