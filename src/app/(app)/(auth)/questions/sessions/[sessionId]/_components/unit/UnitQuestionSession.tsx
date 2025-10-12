"use client";

import UnitQuestionSessionIndex from "./UnitQuestionSessionIndex";
import { AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import UnitQuestionSessionAnswer from "./UnitQuestionSessionAnswer";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";

const UnitQuestionSession = () => {
  const { isQuestionLoading, question } = useQuestionSessionStore(
    state => state
  );
  const renderContent = () => {
    if (isQuestionLoading) {
      return (
        <div className="h-full flex items-center justify-center w-full">
          <Spinner className="m-auto size-8" />;
        </div>
      );
    } else if (!question) {
      return <UnitQuestionSessionIndex />;
    } else {
      return <UnitQuestionSessionAnswer />;
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {renderContent()}
    </AnimatePresence>
  );
};

export default UnitQuestionSession;
