import type { Metadata } from "next";
import { cookies } from "next/headers";
import { me } from "@/lib/http/apis/admin/auth";
import { AdminAuthStoreProvider } from "@/lib/store/providers/admin-auth.provider";

export const metadata: Metadata = {
  title: "관리자",
};

export default async function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = await cookies();
  const accessToken = cookie.get("accessToken-admin")?.value ?? null;
  const refreshToken = cookie.get("refreshToken-admin")?.value ?? null;
  const authMe = await me(accessToken ?? undefined).catch(() => null);

  return (
    <AdminAuthStoreProvider
      initStore={{
        accessToken,
        refreshToken,
        user: authMe?.data ?? null,
      }}
    >
      {children}
    </AdminAuthStoreProvider>
  );
}
