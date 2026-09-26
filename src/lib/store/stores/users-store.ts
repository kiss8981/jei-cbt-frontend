import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UsersFilterState {
  searchQuery: string;
  page: number;
  pageSize: number;
  setSearchQuery: (value: string) => void;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;
  clearAll: () => void;
}

const initialState = { searchQuery: "", page: 1, pageSize: 10 };

export const useUsersFilterStore = create<UsersFilterState>()(
  persist(
    set => ({
      ...initialState,
      setSearchQuery: searchQuery => set({ searchQuery, page: 1 }),
      setPage: page => set({ page }),
      setPageSize: pageSize => set({ pageSize, page: 1 }),
      clearAll: () => set(initialState),
    }),
    {
      name: "users-filter-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
