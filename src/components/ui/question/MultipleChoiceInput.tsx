import { Separator } from "../separator";
import { Input } from "../input";
import { useEffect, useRef, useState } from "react";
import SubmitButton from "./SubmitButton";
import ResultDialog from "./ResultDialog";
import ResultDialogByWrong from "./ResultDialogByWrong";

interface OptionItem {
  id: number;
  option: string;
}

interface QuestionState {
  isFirstQuestion: boolean;
  previousQuestion: () => void;
}

interface QuestionAnswerState {
  submit: (data: { answersForShortAnswer: string }) => Promise<any>;
  isLoading: boolean;
  isResultOpen: boolean;
  result: any;
  setIsResultOpen: (isOpen: boolean) => void;
}

interface QuestionMultipleChoiceInputProps {
  question: string;
  options: OptionItem[];
  isMultiple: boolean;
  initialUserAnswer?: string;
  questionState: QuestionState;
  answerState: QuestionAnswerState;
  isSession: boolean;
}

export const QuestionMultipleChoiceInput = ({
  question,
  options,
  isMultiple,
  initialUserAnswer,
  questionState,
  answerState,
  isSession,
}: QuestionMultipleChoiceInputProps) => {
  const { isFirstQuestion, previousQuestion } = questionState;
  const { submit, isLoading, isResultOpen, result, setIsResultOpen } =
    answerState;

  const input = useRef<HTMLInputElement>(null);
  const [answer, setAnswer] = useState(initialUserAnswer || "");

  useEffect(() => {
    if (input.current) {
      input.current.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

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
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
          {question}
        </h2>

        <Separator className="mt-2 mb-3" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl border bg-slate-50/80 p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              보기에 있는 정답을 직접 입력해 주세요.
              {isMultiple ? " 복수 정답은 쉼표(,)로 구분해서 입력합니다." : ""}
            </p>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div
                  key={option.id}
                  className="flex items-start gap-3 rounded-lg bg-white px-3 py-2 border"
                >
                  <span className="text-sm font-semibold text-slate-500 pt-0.5">
                    {index + 1}.
                  </span>
                  <span className="text-base leading-relaxed text-slate-800">
                    {option.option}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid w-full gap-1.5">
            <Input
              ref={input}
              type="text"
              id="multiple-choice-input-answer"
              className="text-base"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder={
                isMultiple ? "예: 보기1, 보기2" : "정답 보기를 입력해 주세요"
              }
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
