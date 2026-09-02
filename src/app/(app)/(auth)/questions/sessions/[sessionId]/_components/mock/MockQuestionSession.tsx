"use client";

import { AnimatePresence, motion } from "framer-motion"; // motion 추가
import { Spinner } from "@/components/ui/spinner";
import QuestionSessionAnswer from "../QuestionSessionAnswer";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import MockQuestionSessionIndex from "./MockQuestionSessionIndex";
import { useSessionSegment } from "@/app/(app)/_hooks/useQuestionSessionSegment";
import { useEffect } from "react";
import { FixedElapsedTimeAndQuestionIndex } from "@/components/ui/question/FixedElapsedTimeAndQuestionIndex";

const MockQuestionSession = () => {
  const { isQuestionLoading, question, session } = useQuestionSessionStore(
    state => state
  );
  const { start, isRunning, elapsedMs } = useSessionSegment(session.id);

  useEffect(() => {
    if (question && !isRunning) {
      start();
    }
  }, [question]);

  // 현재 렌더링해야 할 컨텐츠와 그에 맞는 key를 결정
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
        component: <MockQuestionSessionIndex />,
      };
    } else {
      return {
        key: "session-answer", // QuestionSessionAnswer 내부에서 개별 문제 전환 처리
        component: <QuestionSessionAnswer />,
      };
    }
  };

  const { key, component } = getContent();

  return (
    <>
      {/* 1. AnimatePresence는 '교체되는 컨텐츠'만 감쌉니다. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={key} // 2. 핵심: key가 변경될 때마다 애니메이션이 트리거됩니다.
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full"
        >
          {component}
        </motion.div>
      </AnimatePresence>

      {/* 3. 고정 요소는 AnimatePresence 밖으로 뺍니다. */}
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

export default MockQuestionSession;
