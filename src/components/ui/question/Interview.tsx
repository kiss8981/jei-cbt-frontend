import { Textarea } from "../textarea";
import { Separator } from "../separator";
import SubmitButton from "./SubmitButton";
import ResultDialog from "./ResultDialog";
import { useState } from "react";
import ResultDialogByWrong from "./ResultDialogByWrong";

// 1. Props 타입을 정의합니다.
// (실제 프로젝트의 타입 정의에 맞춰 any 등을 구체적인 타입으로 변경해주세요)
interface QuestionState {
  isFirstQuestion: boolean;
  previousQuestion: () => void;
}

interface QuestionAnswerState {
  submit: (data: { answersForInterview: string }) => Promise<any>;
  isLoading: boolean;
  isResultOpen: boolean;
  result: any;
  setIsResultOpen: (isOpen: boolean) => void;
}

interface QuestionInterviewProps {
  question: string;
  initialUserAnswer?: string;
  // 두 훅의 데이터를 객체 형태로 받습니다.
  questionState: QuestionState;
  answerState: QuestionAnswerState;
  isSession: boolean;
}

export const QuestionInterview = ({
  question,
  initialUserAnswer,
  questionState,
  answerState,
  isSession,
}: QuestionInterviewProps) => {
  // 2. Props에서 필요한 데이터 구조분해 할당
  const { isFirstQuestion, previousQuestion } = questionState;

  const { submit, isLoading, isResultOpen, result, setIsResultOpen } =
    answerState;

  const [answer, setAnswer] = useState(initialUserAnswer || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      answersForInterview: answer.trim(),
    });
  };

  return (
    <div className="w-full h-full relative">
      {isSession
        ? isResultOpen && (
            <ResultDialog
              result={result}
              isResultOpen={isResultOpen}
              setIsResultOpen={setIsResultOpen}
            />
          )
        : isResultOpen && (
            <ResultDialogByWrong
              result={result}
              isResultOpen={isResultOpen}
              setIsResultOpen={setIsResultOpen}
            />
          )}

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
            isSession={isSession}
          />
        </form>
      </div>
    </div>
  );
};
