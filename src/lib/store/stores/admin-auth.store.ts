import { adminHttp } from "@/lib/http/admin-http";
import { MeUserAuthAdminDto } from "@/lib/http/apis/dtos/admin/auth/me-auth.admin.dto";
import { MeUserAuthAppDto } from "@/lib/http/apis/dtos/app/auth/me.auth.dto";
import { http } from "@/lib/http/http";
import { createStore } from "zustand";

export interface AdminAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: MeUserAuthAdminDto | null;
}

interface AdminAuthActions {
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: MeUserAuthAdminDto | null) => void;
}

export const initialAdminAuthState: AdminAuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

export type AdminAuthStore = AdminAuthState & AdminAuthActions;

export const createAdminAuthStore = (
  initState: AdminAuthState = initialAdminAuthState
) => {
  if (initState.accessToken) {
    adminHttp.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${initState.accessToken}`;
  }

  return createStore<AdminAuthStore>(set => ({
    ...initState,
    setTokens: (accessToken: string, refreshToken: string) => {
      set({
        accessToken,
        refreshToken,
      });
      adminHttp.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;
    },
    setUser: (user: MeUserAuthAdminDto | null) => {
      set({ user });
    },
  }));
};
