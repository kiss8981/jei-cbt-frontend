"use client";

import { AnimatePresence, motion } from "framer-motion"; // motion 추가
import { Spinner } from "@/components/ui/spinner";
import QuestionSessionAnswer from "../QuestionSessionAnswer";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import AllQuestionSessionIndex from "./AllQuestionSessionIndex";
import { useSessionSegment } from "@/app/(app)/_hooks/useQuestionSessionSegment";
import { useEffect } from "react";
import { FixedElapsedTimeAndQuestionIndex } from "@/components/ui/question/FixedElapsedTimeAndQuestionIndex";

const AllQuestionSession = () => {
  const { isQuestionLoading, question, session } = useQuestionSessionStore(
    state => state
  );
  const { start, isRunning, elapsedMs } = useSessionSegment(session.id);

  useEffect(() => {
    if (question && !isRunning) {
      start();
    }
  }, [question]);

  // 렌더링할 컨텐츠와 고유 key를 반환하는 함수로 변경
  const getContent = () => {
    if (isQuestionLoading) {
      return {
        key: "loading",
        component: (
          <div className="h-full flex items-center justify-center w-full">
            <Spinner className="m-auto size-8" />
          </div>
        ),
      };
    } else if (!question) {
      return {
        key: "index",
        component: <AllQuestionSessionIndex />,
      };
    } else {
      return {
        key: "session-answer",
        component: <QuestionSessionAnswer />,
      };
    }
  };

  const { key, component } = getContent();

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={key} // key가 변경될 때 애니메이션 발생
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full"
        >
          {component}
        </motion.div>
      </AnimatePresence>

      {/* 고정 UI는 애니메이션 영역 밖으로 배치 */}
      {question && (
        <FixedElapsedTimeAndQuestionIndex
          ms={elapsedMs}
          currentIndex={
            session.totalQuestions - (question.nextQuestionCount || 0)
          }
          total={session.totalQuestions}
        />
      )}
    </>
  );
};

export default AllQuestionSession;
