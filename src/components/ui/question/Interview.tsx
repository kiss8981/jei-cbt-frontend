import { Textarea } from "../textarea";
import { Separator } from "../separator";
import SubmitButton from "./SubmitButton";
import { useQuestionSessionAnswer } from "@/app/(app)/_hooks/useQuestionSession";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import { useState } from "react";
export const QuestionInterview = ({ question }: { question: string }) => {
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
      answersForInterview: answer.trim(),
    });
  };

  return (
    <>
      <ResultDialog />
      <div className="bg-background mx-auto w-full">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {question}
        </h2>

        <Separator className="mt-2 mb-3" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Textarea
              id="answer-input"
              placeholder=""
              rows={8}
              autoFocus
              className="resize-y min-h-[150px]"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
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
