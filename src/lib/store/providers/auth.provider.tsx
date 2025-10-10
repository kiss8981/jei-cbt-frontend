"use client";

import {
  type ReactNode,
  createContext,
  useRef,
  useContext,
  useEffect,
} from "react";
import { type StoreApi, useStore } from "zustand";
import {
  AuthState,
  AuthStore,
  createAuthStore,
  initialAuthState,
} from "../stores/auth.store";
import { me, refreshToken } from "@/lib/http/apis/app/auth";

export const AuthStoreContext = createContext<StoreApi<AuthStore> | null>(null);

export interface AuthStoreProviderProps {
  children: ReactNode;
  initStore?: AuthState;
}

export const AuthStoreProvider = ({
  children,
  initStore = initialAuthState,
}: AuthStoreProviderProps) => {
  const storeRef = useRef<StoreApi<AuthStore>>(null);
  if (!storeRef.current) {
    storeRef.current = createAuthStore(initStore);
  }

  useEffect(() => {
    setInterval(async () => {
      const user = await me();
    }, 30000);
  }, []);

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  );
};

export const useAuthStore = <T,>(selector: (auth: AuthStore) => T): T => {
  const authStoreContext = useContext(AuthStoreContext);

  if (!authStoreContext) {
    throw new Error(`useAuthStore must be use within AuthStoreProvider`);
  }

  return useStore(authStoreContext, selector);
};
