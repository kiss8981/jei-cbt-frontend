import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SelectedExamState {
  examTypeValue: string | null;
  examTypeLabel: string | null;
  examId: number | null;
  examTitle: string | null;
  hydrated: boolean;
  setExamType: (payload: { value: string; label: string }) => void;
  setExam: (payload: { id: number; title: string }) => void;
  clearSelection: () => void;
  setHydrated: (value: boolean) => void;
}

const defaultState = {
  examTypeValue: null,
  examTypeLabel: null,
  examId: null,
  examTitle: null,
  hydrated: false,
};

export const useSelectedExamStore = create<SelectedExamState>()(
  persist(
    set => ({
      ...defaultState,
      setExamType: payload =>
        set({
          examTypeValue: payload.value,
          examTypeLabel: payload.label,
          examId: null,
          examTitle: null,
        }),
      setExam: payload =>
        set({
          examId: payload.id,
          examTitle: payload.title,
        }),
      clearSelection: () =>
        set({
          examTypeValue: null,
          examTypeLabel: null,
          examId: null,
          examTitle: null,
        }),
      setHydrated: value => set({ hydrated: value }),
    }),
    {
      name: "selected-exam-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        examTypeValue: state.examTypeValue,
        examTypeLabel: state.examTypeLabel,
        examId: state.examId,
        examTitle: state.examTitle,
      }),
      onRehydrateStorage: () => state => {
        state?.setHydrated(true);
      },
    }
  )
);
