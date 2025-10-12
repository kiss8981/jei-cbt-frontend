import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UnitsFilterState {
  searchQuery: string;
  page: number;
  pageSize: number;

  setSearchQuery: (value: string) => void;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;
  clearAll: () => void;
}

const defaultState = {
  searchQuery: "",
  page: 1,
  pageSize: 10,
};

export const useUnitsFilterStore = create<UnitsFilterState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setSearchQuery: (value: string) => set({ searchQuery: value, page: 1 }),
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
      name: "units-filter-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        searchQuery: state.searchQuery,
        page: state.page,
        pageSize: state.pageSize,
      }),
    }
  )
);
