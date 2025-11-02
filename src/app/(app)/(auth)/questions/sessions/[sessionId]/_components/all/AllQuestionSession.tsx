"use client";

import { AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import QuestionSessionAnswer from "../QuestionSessionAnswer";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import AllQuestionSessionIndex from "./AllQuestionSessionIndex";
import { useSessionSegment } from "@/app/(app)/_hooks/useQuestionSessionSegment";
import { useEffect } from "react";
import { formatHMS } from "@/utils/formatHMS";
import { FixedElapsedTime } from "@/components/ui/question/FixedElapsedTime";

const AllQuestionSession = () => {
  const { isQuestionLoading, question, session } = useQuestionSessionStore(
    state => state
  );
  const { start, stop, isRunning, elapsedMs } = useSessionSegment(session.id);

  useEffect(() => {
    if (question && !isRunning) {
      start();
    }
  }, []);

  const renderContent = () => {
    if (isQuestionLoading) {
      return (
        <div className="h-full flex items-center justify-center w-full">
          <Spinner className="m-auto size-8" />;
        </div>
      );
    } else if (!question) {
      return <AllQuestionSessionIndex />;
    } else {
      return <QuestionSessionAnswer />;
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {renderContent()}
      {question && <FixedElapsedTime ms={elapsedMs} />}
    </AnimatePresence>
  );
};

export default AllQuestionSession;
