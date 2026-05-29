import { useState } from "react";
import { Switch } from "../switch";
import SubmitButton from "./SubmitButton";
import ResultDialog from "./ResultDialog";
import BottomKeypad from "./BottomKeypad";
import { YesNoSegment } from "./TrueFalseSegment";
import ResultDialogByWrong from "./ResultDialogByWrong";
import { QuestionPhoto, QuestionPrompt } from "./QuestionPrompt";

// 1. 상태 및 액션 타입 정의 (공통 패턴)
interface QuestionState {
  isFirstQuestion: boolean;
  previousQuestion: () => void;
}

interface QuestionAnswerState {
  submit: (data: { answersForTrueFalse: boolean }) => Promise<any>;
  isLoading: boolean;
  isResultOpen: boolean;
  result: any;
  setIsResultOpen: (isOpen: boolean) => void;
}

interface QuestionTrueFalseProps {
  question: string;
  additionalText?: string | null;
  photos?: QuestionPhoto[] | null;
  initialUserAnswer?: boolean;
  // Hooks 대신 전달받을 상태 객체
  questionState: QuestionState;
  answerState: QuestionAnswerState;
  isSession: boolean;
}

export const QuestionTrueFalse = ({
  question,
  additionalText,
  photos,
  initialUserAnswer,
  questionState,
  answerState,
  isSession,
}: QuestionTrueFalseProps) => {
  // 2. Props에서 로직 분해 할당
  const { isFirstQuestion, previousQuestion } = questionState;

  const { submit, isLoading, isResultOpen, result, setIsResultOpen } =
    answerState;

  // 3. 로컬 상태 관리 (UI 선택값)
  const [checked, setChecked] = useState<boolean>(initialUserAnswer || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await submit({
      answersForTrueFalse: checked,
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

        <form onSubmit={handleSubmit}>
          <div className="p-4 border rounded-lg bg-muted/20 flex items-center justify-between">
            <div className="flex items-center space-x-2 w-full justify-center">
              <span className="text-sm font-medium text-gray-500">아니요</span>
              <Switch
                id="true-false-switch"
                checked={checked}
                onCheckedChange={state => setChecked(state as boolean)}
              />
              <span className="text-sm font-medium text-primary">예</span>
            </div>
          </div>

          <SubmitButton
            isFirst={isFirstQuestion}
            onPrevious={previousQuestion}
            loadingSubmit={isLoading}
            isSession={isSession}
          />
        </form>

        <BottomKeypad isSession={isSession}>
          <YesNoSegment
            value={checked}
            onChange={setChecked}
            disabled={isLoading}
          />
        </BottomKeypad>
      </div>
    </div>
  );
};
