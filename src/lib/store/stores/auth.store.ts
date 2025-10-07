import { MeUserAuthAppDto } from "@/lib/http/apis/dtos/app/auth/me.auth.dto";
import { http } from "@/lib/http/http";
import { create, createStore } from "zustand";

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: MeUserAuthAppDto | null;
}

interface AuthActions {
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: MeUserAuthAppDto | null) => void;
}

export const initialAuthState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

export type AuthStore = AuthState & AuthActions;

export const createAuthStore = (initState: AuthState = initialAuthState) => {
  if (initState.accessToken) {
    http.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${initState.accessToken}`;
  }

  return createStore<AuthStore>(set => ({
    ...initState,
    setTokens: (accessToken: string, refreshToken: string) => {
      set({
        accessToken,
        refreshToken,
      });
      http.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    },
    setUser: (user: MeUserAuthAppDto | null) => {
      set({ user });
    },
  }));
};
