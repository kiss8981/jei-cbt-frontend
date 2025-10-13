import { cookies } from "next/headers";
import { me } from "@/lib/http/apis/app/auth";
import Login from "../_components/Login";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = await cookies();
  const accessToken = cookie.get("accessToken")?.value ?? null;

  if (!accessToken) {
    return <Login />;
  }

  const authMe = await me(accessToken).catch(() => null);

  if (!authMe) {
    return <Login />;
  }

  return children;
}
