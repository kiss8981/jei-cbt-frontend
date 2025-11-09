"use client";

import { QuestionType } from "@/lib/http/apis/dtos/common/question-type.enum";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import { formatHMS } from "@/utils/formatHMS";

const bottomMarginQuestionTypes = [QuestionType.MULTIPLE_CHOICE];

export const FixedElapsedTime = ({ ms }: { ms: number }) => {
  const { question: questionMap, session } = useQuestionSessionStore(
    state => state
  );

  return (
    <div
      className="fixed left-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full px-4 py-2 shadow-md text-sm font-mono"
      style={{
        bottom: `calc(${
          bottomMarginQuestionTypes.includes(questionMap!.question?.type)
            ? 130
            : 70
        }px + ${
          session?.type === "MOCK" ? 30 : 0
        }px + var(--safe-area-inset-bottom, 0px))`,
        transition: "bottom 0.3s ease",
      }}
      key="elapsed-time"
    >
      {formatHMS(Math.round(ms / 1000))}
    </div>
  );
};
