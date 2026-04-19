"use client";

import { useEffect } from "react";
import useAppRouter from "@/hooks/useAppRouter";
import { useSelectedExamStore } from "@/lib/store/stores/selected-exam-store";

export const useSelectedExamGuard = () => {
  const { navigate } = useAppRouter();
  const examId = useSelectedExamStore(state => state.examId);
  const hydrated = useSelectedExamStore(state => state.hydrated);

  useEffect(() => {
    if (hydrated && !examId) {
      navigate("replace", "/");
    }
  }, [examId, hydrated, navigate]);

  return {
    examId,
    hydrated,
    hasSelectedExam: !!examId,
  };
};
