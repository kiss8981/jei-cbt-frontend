"use client";

import { useQuestionSession } from "@/app/(app)/_hooks/useQuestionSession";
import { GetUnitQuestionSessionAppDto } from "@/lib/http/apis/dtos/app/question/get-question-session.app.dto";
import UnitQuestionSessionIndex from "./UnitQuestionSessionIndex";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import UnitQuestionSessionAnswer from "./UnitQuestionSessionAnswer";

const UnitQuestionSession = ({
  session,
}: {
  session: GetUnitQuestionSessionAppDto;
}) => {
  const { question, nextQuestion, currentQuestion, isLoading } =
    useQuestionSession(session.id);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center w-full">
          <Spinner className="m-auto size-8" />;
        </div>
      );
    } else if (!question) {
      return (
        <UnitQuestionSessionIndex
          session={session}
          onClickStart={nextQuestion}
        />
      );
    } else {
      return (
        <UnitQuestionSessionAnswer
          question={question.question}
          nextQuestion={nextQuestion}
        />
      );
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={() => null}>
      {renderContent()}
    </AnimatePresence>
  );
};

export default UnitQuestionSession;
