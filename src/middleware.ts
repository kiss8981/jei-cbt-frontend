import { NextRequest, NextResponse } from "next/server";
import { refreshToken } from "./lib/http/apis/app/auth";

function base64UrlDecode(input: string) {
  // base64url → base64
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = input.length % 4;
  if (pad) input += "=".repeat(4 - pad);
  // atob는 Edge 런타임에서 사용 가능
  return atob(input);
}

function parseExpFromJWT(token?: string | null): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

function willExpireSoon(token?: string | null, seconds = 60) {
  const exp = parseExpFromJWT(token);
  if (!exp) return false;
  return exp * 1000 - Date.now() <= seconds * 1000;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessTokenValue = req.cookies.get("accessToken")?.value ?? null;
  const refreshTokenValue = req.cookies.get("refreshToken")?.value ?? null;

  // 액세스 토큰이 유효하고, 만료 임박이 아니면 그냥 통과
  if (accessTokenValue && !willExpireSoon(accessTokenValue, 60)) {
    return NextResponse.next();
  }

  // 리프레시 토큰 없으면 로그인으로
  if (!refreshTokenValue) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    url.searchParams.set("ssr", "1");
    return NextResponse.redirect(url);
  }

  try {
    const refreshRes = await refreshToken(refreshTokenValue);

    if (refreshRes.code !== 200 || !refreshRes.data?.accessToken) {
      throw new Error(refreshRes.message || "토큰 갱신 실패");
    }

    // 새 토큰을 쿠키에 심고 계속 진행
    const res = NextResponse.next();

    // 보안 옵션은 환경/도메인에 맞게 조정
    res.cookies.set("accessToken", refreshRes.data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      domain: process.env.NEXT_PUBLIC_DOMAIN,
    });
    res.cookies.set("refreshToken", refreshRes.data.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      domain: process.env.NEXT_PUBLIC_DOMAIN,
    });

    return res;
  } catch {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("redirect", pathname);
    url.searchParams.set("ssr", "1");
    const res = NextResponse.redirect(url);
    res.cookies.delete("accessToken");
    res.cookies.delete("refreshToken");
    return res;
  }
}

export const config = {
  matcher: ["/auth/me/:path*", "/learn/:path*", "/questions/:path*", "/"],
};
