import { QuestionType } from "@/lib/http/apis/dtos/common/question-type.enum";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface QuestionsFilterState {
  searchQuery: string;
  unitFilter: string[];
  questionTypeFilter?: QuestionType[];
  page: number;
  pageSize: number;

  setSearchQuery: (value: string) => void;
  setUnitFilter: (value: string[]) => void;
  setQuestionTypeFilter: (value: QuestionType[]) => void;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;
  clearAll: () => void;
}

const defaultState = {
  searchQuery: "",
  unitFilter: ["ALL"],
  questionTypeFilter: undefined,
  page: 1,
  pageSize: 10,
};

export const useQuestionsFilterStore = create<QuestionsFilterState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setSearchQuery: (value: string) => set({ searchQuery: value, page: 1 }),
      setUnitFilter: (value: string[]) => set({ unitFilter: value, page: 1 }),
      setQuestionTypeFilter: (value: QuestionType[]) =>
        set({ questionTypeFilter: value, page: 1 }),
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
      name: "questions-filter-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        searchQuery: state.searchQuery,
        unitFilter: state.unitFilter,
        questionTypeFilter: state.questionTypeFilter,
        page: state.page,
        pageSize: state.pageSize,
      }),
    }
  )
);
