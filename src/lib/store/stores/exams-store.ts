import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ExamsFilterState {
  searchQuery: string;
  typeFilter: string;
  page: number;
  pageSize: number;
  setSearchQuery: (value: string) => void;
  setTypeFilter: (value: string) => void;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;
  clearAll: () => void;
}

const defaultState = {
  searchQuery: "",
  typeFilter: "ALL",
  page: 1,
  pageSize: 10,
};

export const useExamsFilterStore = create<ExamsFilterState>()(
  persist(
    (set, get) => ({
      ...defaultState,
      setSearchQuery: value => set({ searchQuery: value, page: 1 }),
      setTypeFilter: value => set({ typeFilter: value, page: 1 }),
      setPage: newPage => {
        const currentPage = get().page;
        if (currentPage !== newPage) {
          set({ page: newPage });
        }
      },
      setPageSize: newPageSize => {
        const current = get();
        if (current.pageSize !== newPageSize) {
          set({ pageSize: newPageSize, page: 1 });
        }
      },
      clearAll: () => set({ ...defaultState }),
    }),
    {
      name: "exams-filter-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        searchQuery: state.searchQuery,
        typeFilter: state.typeFilter,
        page: state.page,
        pageSize: state.pageSize,
      }),
    }
  )
);
