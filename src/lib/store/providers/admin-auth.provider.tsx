"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { type StoreApi, useStore } from "zustand";
import {
  AdminAuthState,
  AdminAuthStore,
  createAdminAuthStore,
  initialAdminAuthState,
} from "../stores/admin-auth.store";

export const AdminAuthStoreContext =
  createContext<StoreApi<AdminAuthStore> | null>(null);

export interface AdminAuthStoreProviderProps {
  children: ReactNode;
  initStore?: AdminAuthState;
}

export const AdminAuthStoreProvider = ({
  children,
  initStore = initialAdminAuthState,
}: AdminAuthStoreProviderProps) => {
  const storeRef = useRef<StoreApi<AdminAuthStore>>(null);
  if (!storeRef.current) {
    storeRef.current = createAdminAuthStore(initStore);
  }

  return (
    <AdminAuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AdminAuthStoreContext.Provider>
  );
};

export const useAdminAuthStore = <T,>(
  selector: (auth: AdminAuthStore) => T
): T => {
  const authStoreContext = useContext(AdminAuthStoreContext);

  if (!authStoreContext) {
    throw new Error(
      `useAdminAuthStore must be use within AdminAuthStoreProvider`
    );
  }

  return useStore(authStoreContext, selector);
};
