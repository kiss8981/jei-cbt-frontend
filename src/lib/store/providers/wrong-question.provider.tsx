"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { type StoreApi, useStore } from "zustand";
import {
  createWrongQuestionStore,
  initialWrongQuestionState,
  WrongQuestionState,
  WrongQuestionStore,
} from "../stores/wrong-question-store";

export const WrongQuestionStoreContext =
  createContext<StoreApi<WrongQuestionStore> | null>(null);

export interface WrongQuestionProviderProps {
  children: ReactNode;
  initStore?: WrongQuestionState;
}

export const WrongQuestionProvider = ({
  children,
  initStore = initialWrongQuestionState,
}: WrongQuestionProviderProps) => {
  const storeRef = useRef<StoreApi<WrongQuestionStore>>(null);
  if (!storeRef.current) {
    storeRef.current = createWrongQuestionStore(initStore);
  }

  return (
    <WrongQuestionStoreContext.Provider value={storeRef.current}>
      {children}
    </WrongQuestionStoreContext.Provider>
  );
};

export const useWrongQuestionStore = <T,>(
  selector: (wrongQuestion: WrongQuestionStore) => T
): T => {
  const wrongQuestionStoreContext = useContext(WrongQuestionStoreContext);

  if (!wrongQuestionStoreContext) {
    throw new Error(
      `useWrongQuestionStore must be use within WrongQuestionProvider`
    );
  }

  return useStore(wrongQuestionStoreContext, selector);
};
