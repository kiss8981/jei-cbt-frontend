import { BaseResponse, adminHttp } from "../../admin-http";
import { useAdminAuthStore } from "@/lib/store/providers/admin-auth.provider";
import { RefreshAuthTokenResponseAdminDto } from "../dtos/admin/auth/refresh-token-response.auth.dto";
import { LoginAuthUserResponseAdminDto } from "../dtos/admin/auth/login-auth-user-response.admin.dto";
import { LoginAuthUserAdminDto } from "../dtos/admin/auth/login-auth-user.admin.dto";
import { MeAuthAdminDto } from "../dtos/admin/auth/me-auth.admin.dto";

export const setAuth = async (accessToken: string, refreshToken: string) => {
  const { setTokens } = useAdminAuthStore(state => state);
  setTokens(accessToken, refreshToken);
};

export const getAuth = async () => {
  const { accessToken, refreshToken } = useAdminAuthStore(state => state);
  return { accessToken, refreshToken };
};

export const refreshToken = async (refreshToken: string) => {
  const response = await adminHttp.post<
    BaseResponse<RefreshAuthTokenResponseAdminDto>
  >("/admin/auth/refresh", {
    refreshToken,
  });

  if (response.data.code !== 200) {
    throw new Error(response.data.message || "토큰 갱신에 실패했습니다.");
  }

  return response.data;
};

export const login = async (dto: LoginAuthUserAdminDto) => {
  const response = await adminHttp.post<
    BaseResponse<LoginAuthUserResponseAdminDto>
  >("/admin/auth/login", dto);
  if (response.data.code !== 200) {
    throw new Error(response.data.message || "로그인에 실패했습니다.");
  }
  return response.data;
};

export const me = async (accessToken?: string) => {
  const response = await adminHttp.get<BaseResponse<MeAuthAdminDto>>(
    "/admin/auth/me",
    {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    }
  );

  if (response.data.code !== 200) {
    throw new Error(response.data.message);
  }
  return response.data;
};
