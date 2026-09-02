"use client";

import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import { formatHMS } from "@/utils/formatHMS";

export const FixedElapsedTimeAndQuestionIndex = ({
  ms,
  currentIndex,
  total,
}: {
  ms: number;
  currentIndex?: number;
  total?: number;
}) => {
  const sessionType = useQuestionSessionStore(state => state.session?.type);

  return (
    <div
      className="fixed left-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full px-4 py-2 shadow-md text-sm font-mono"
      style={{
        bottom: `calc(130px + ${
          sessionType === "MOCK" ? 30 : 0
        }px + var(--safe-area-inset-bottom, 0px))`,
      }}
      key="elapsed-time"
    >
      {formatHMS(Math.round(ms / 1000))}{" "}
      {currentIndex !== undefined && total !== undefined ? (
        <span className="ml-2 text-gray-500 dark:text-gray-400">
          {currentIndex}번 / {total} 문제
        </span>
      ) : (
        ""
      )}
    </div>
  );
};
