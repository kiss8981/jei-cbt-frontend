import { Button } from "../button";
import { Separator } from "../separator"; // Separator 추가
import { Input } from "../input";
import { useState } from "react";
import SubmitButton from "./SubmitButton";
import { useQuestionSessionAnswer } from "@/app/(app)/_hooks/useQuestionSession";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";

export const QuestionShortAnswer = ({ question }: { question: string }) => {
  const {
    question: questionMap,
    isFirstQuestion,
    previousQuestion,
  } = useQuestionSessionStore(state => state);
  const { submit, isLoading, ResultDialog } = useQuestionSessionAnswer();

  const [answer, setAnswer] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await submit({
      answersForShortAnswer: answer.trim(),
    });
  };

  return (
    <>
      <ResultDialog />
      <div className="bg-background mx-auto w-full">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
          {question}
        </h2>

        <Separator className="mt-2 mb-3" />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 2. 답변 입력 영역 */}
          <div className="grid w-full gap-1.5">
            <Input
              type="text"
              id="answer-input"
              className="text-base"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="답변"
              autoFocus
            />
          </div>
          <SubmitButton
            isFirst={isFirstQuestion}
            onPrevious={previousQuestion}
            disabledSubmit={answer.trim() === ""}
            loadingSubmit={isLoading}
          />
        </form>
      </div>
    </>
  );
};
