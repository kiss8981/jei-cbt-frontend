import { useAuthStore } from "@/lib/store/providers/auth.provider";
import { BaseResponse, http } from "../../http";
import { RefreshTokenResponseAuthAppDto } from "../dtos/app/auth/refresh-token-response.auth.dto";
import { RegisterUserAuthAppDto } from "../dtos/app/auth/register-user.auth.dto";
import { RegisterUserResponseAuthAppDto } from "../dtos/app/auth/register-user-response.auth.dto";
import { LoginUserAuthAppDto } from "../dtos/app/auth/login-user.auth.dto";
import { LoginUserResponseAuthAppDto } from "../dtos/app/auth/login-user-response.auth.dto";
import { MeUserAuthAppDto } from "../dtos/app/auth/me.auth.dto";
import { getAuthStoreInstance } from "@/lib/store/stores/auth.store";

export const setAuth = async (accessToken: string, refreshToken: string) => {
  const { setTokens } = getAuthStoreInstance().getState();
  setTokens(accessToken, refreshToken);
};

export const getAuth = async () => {
  const { accessToken, refreshToken } = getAuthStoreInstance().getState();
  console.log("getAuth", { accessToken, refreshToken });
  return { accessToken, refreshToken };
};

export const refreshToken = async (refreshToken: string) => {
  const response = await http.post<
    BaseResponse<RefreshTokenResponseAuthAppDto>
  >("/auth/refresh", {
    refreshToken,
  });

  if (response.data.code !== 200) {
    throw new Error(response.data.message || "토큰 갱신에 실패했습니다.");
  }

  return response.data;
};

export const register = async (dto: RegisterUserAuthAppDto) => {
  const response = await http.post<
    BaseResponse<RegisterUserResponseAuthAppDto>
  >("/auth/register", dto);
  console.log("register response", response.data.data);
  if (response.data.code !== 200) {
    throw new Error(response.data.message || "회원가입에 실패했습니다.");
  }
  return response.data;
};

export const login = async (dto: LoginUserAuthAppDto) => {
  const response = await http.post<BaseResponse<LoginUserResponseAuthAppDto>>(
    "/auth/login",
    dto
  );
  if (response.data.code !== 200) {
    throw new Error(response.data.message || "로그인에 실패했습니다.");
  }
  return response.data;
};

export const me = async (accessToken?: string) => {
  const response = await http.get<BaseResponse<MeUserAuthAppDto>>("/auth/me", {
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : {},
  });

  if (response.data.code !== 200) {
    throw new Error(response.data.message);
  }
  return response.data;
};

export const signout = async () => {
  const response = await http.post<BaseResponse<boolean>>("/auth/signout");

  if (response.data.code !== 200) {
    throw new Error(response.data.message || "회원 탈퇴에 실패했습니다.");
  }

  return response.data;
};
