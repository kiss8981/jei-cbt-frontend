"use server";

import { cookies } from "next/headers";
import { BaseResponse, http } from "../../http";
import { RefreshTokenResponseAuthAppDto } from "../dtos/app/auth/refresh-token-response.auth.dto";

export const refreshToken = async () => {
  const cookie = await cookies();

  const response = await http.post<
    BaseResponse<RefreshTokenResponseAuthAppDto>
  >("/auth/refresh", {
    refreshToken: cookie.get("refreshToken")?.value,
  });

  if (response.data.code !== 200) {
    throw new Error(response.data.message || "토큰 갱신에 실패했습니다.");
  }

  return response.data;
};

export const logout = async () => {
  const cookie = await cookies();
  cookie.delete("accessToken");
  cookie.delete("refreshToken");
};
