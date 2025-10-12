"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { type StoreApi, useStore } from "zustand";
import {
  createQuestionSessionStore,
  initialQuestionSessionState,
  QuestionSessionState,
  QuestionSessionStore,
} from "../stores/question-session-store";

export const QuestionSessionStoreContext =
  createContext<StoreApi<QuestionSessionStore> | null>(null);

export interface QuestionSessionProviderProps {
  children: ReactNode;
  initStore?: QuestionSessionState;
}

export const QuestionSessionProvider = ({
  children,
  initStore = initialQuestionSessionState,
}: QuestionSessionProviderProps) => {
  const storeRef = useRef<StoreApi<QuestionSessionStore>>(null);
  if (!storeRef.current) {
    storeRef.current = createQuestionSessionStore(initStore);
  }

  return (
    <QuestionSessionStoreContext.Provider value={storeRef.current}>
      {children}
    </QuestionSessionStoreContext.Provider>
  );
};

export const useQuestionSessionStore = <T,>(
  selector: (uestionSession: QuestionSessionStore) => T
): T => {
  const questionSessionStoreContext = useContext(QuestionSessionStoreContext);

  if (!questionSessionStoreContext) {
    throw new Error(
      `useQuestionSessionStore must be use within QuestionSessionProvider`
    );
  }

  return useStore(questionSessionStoreContext, selector);
};
