"use client";

import { AnimatePresence, motion } from "framer-motion"; // motion 추가
import { Spinner } from "@/components/ui/spinner";
import UnitQuestionSessionAnswer from "../QuestionSessionAnswer";
import UnitQuestionSessionIndex from "./UnitQuestionSessionIndex";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import { useSessionSegment } from "@/app/(app)/_hooks/useQuestionSessionSegment";
import { useEffect } from "react";
import { FixedElapsedTimeAndQuestionIndex } from "@/components/ui/question/FixedElapsedTimeAndQuestionIndex";

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

  // 컨텐츠와 고유 key를 반환하는 구조로 변경
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
        component: <UnitQuestionSessionIndex />,
      };
    } else {
      return {
        key: "session-answer",
        component: <UnitQuestionSessionAnswer />,
      };
    }
  };

  const { key, component } = getContent();

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={key} // 상태(key)가 바뀔 때만 애니메이션 실행
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full"
        >
          {component}
        </motion.div>
      </AnimatePresence>

      {/* 고정 UI (타이머 등)는 애니메이션 영향 받지 않도록 외부로 분리 */}
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

export default UnitQuestionSession;
