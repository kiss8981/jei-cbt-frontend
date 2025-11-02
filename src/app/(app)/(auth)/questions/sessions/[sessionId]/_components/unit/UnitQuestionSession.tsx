"use client";

import UnitQuestionSessionIndex from "./UnitQuestionSessionIndex";
import { AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import UnitQuestionSessionAnswer from "../QuestionSessionAnswer";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import { useSessionSegment } from "@/app/(app)/_hooks/useQuestionSessionSegment";
import { useEffect } from "react";
import { FixedElapsedTime } from "@/components/ui/question/FixedElapsedTime";

const UnitQuestionSession = () => {
  const { isQuestionLoading, question, session } = useQuestionSessionStore(
    state => state
  );
  const { start, isRunning, elapsedMs } = useSessionSegment(session.id);

  useEffect(() => {
    if (question && !isRunning) {
      start();
    }
  }, [question]);

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
      {question && <FixedElapsedTime ms={elapsedMs} />}
    </AnimatePresence>
  );
};

export default UnitQuestionSession;
