import { Input } from "../input";
import { useEffect, useRef, useState } from "react";
import SubmitButton from "./SubmitButton";
import ResultDialog from "./ResultDialog";
import ResultDialogByWrong from "./ResultDialogByWrong";
import { QuestionPhoto, QuestionPrompt } from "./QuestionPrompt";

// 1. 상태 및 액션 타입 정의
interface QuestionState {
  isFirstQuestion: boolean;
  previousQuestion: () => void;
}

interface QuestionAnswerState {
  // 단답형은 문자열 하나를 보냄
  submit: (data: { answersForShortAnswer: string }) => Promise<any>;
  isLoading: boolean;
  isResultOpen: boolean;
  result: any;
  setIsResultOpen: (isOpen: boolean) => void;
}

interface QuestionShortAnswerProps {
  question: string;
  additionalText?: string | null;
  photos?: QuestionPhoto[] | null;
  initialUserAnswer?: string;
  // Hooks 대신 전달받을 상태 객체
  questionState: QuestionState;
  answerState: QuestionAnswerState;
  isSession: boolean;
}

export const QuestionShortAnswer = ({
  question,
  additionalText,
  photos,
  initialUserAnswer,
  questionState,
  answerState,
  isSession,
}: QuestionShortAnswerProps) => {
  // 2. Props에서 로직 분해 할당
  const { isFirstQuestion, previousQuestion } = questionState;

  const { submit, isLoading, isResultOpen, result, setIsResultOpen } =
    answerState;

  // 3. UI 로직 (포커스 및 스크롤) - UI 관련이므로 여기에 유지
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input.current) {
      input.current.focus();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [input]);

  // 4. 로컬 상태 관리
  const [answer, setAnswer] = useState(initialUserAnswer || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await submit({
      answersForShortAnswer: answer.trim(),
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
        <QuestionPrompt
          question={question}
          additionalText={additionalText}
          photos={photos}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Input
              ref={input}
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
            isSession={isSession}
          />
        </form>
      </div>
    </div>
  );
};
