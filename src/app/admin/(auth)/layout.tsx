import { cookies } from "next/headers";
import { me } from "@/lib/http/apis/app/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "../_components/sidebar/Sidebar";

export default async function AdminAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = await cookies();
  const accessToken = cookie.get("accessToken-admin")?.value ?? null;

  if (!accessToken) {
    return redirect("/admin/auth/login");
  }

  const authMe = await me(accessToken).catch(() => null);

  if (!authMe) {
    return redirect("/admin/auth/login");
  }

  return <AdminSidebar>{children}</AdminSidebar>;
}
