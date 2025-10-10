import { MeUserAuthAppDto } from "@/lib/http/apis/dtos/app/auth/me.auth.dto";
import { http } from "@/lib/http/http";
import { create, createStore, StoreApi } from "zustand";

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

let authStoreInstance: StoreApi<AuthStore> | null = null;

export const getAuthStoreInstance = (): StoreApi<AuthStore> => {
  if (!authStoreInstance) {
    throw new Error(
      "AuthStore instance has not been initialized. Ensure AuthStoreProvider is mounted."
    );
  }
  return authStoreInstance;
};

export const createAuthStore = (initState: AuthState = initialAuthState) => {
  if (initState.accessToken) {
    http.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${initState.accessToken}`;
  }

  const store = createStore<AuthStore>(set => ({
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
  })); // 3. 스토어가 생성될 때 인스턴스를 전역 변수에 저장합니다.

  authStoreInstance = store;
  return store;
};
