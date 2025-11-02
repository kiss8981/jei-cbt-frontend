import { useState } from "react";
import { Separator } from "../separator";
import { Switch } from "../switch";
import SubmitButton from "./SubmitButton";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import { useQuestionSessionAnswer } from "@/app/(app)/_hooks/useQuestionSession";
import ResultDialog from "./ResultDialog";
import BottomKeypad from "./BottomKeypad";
import { YesNoSegment } from "./TrueFalseSegment";

export const QuestionTrueFalse = ({ question }: { question: string }) => {
  const {
    question: questionMap,
    isFirstQuestion,
    previousQuestion,
  } = useQuestionSessionStore(state => state);
  const { submit, isLoading, isResultOpen, result, setIsResultOpen } =
    useQuestionSessionAnswer();

  const [checked, setChecked] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await submit({
      answersForTrueFalse: checked,
    });
  };

  return (
    <>
      <ResultDialog
        result={result}
        isResultOpen={isResultOpen}
        setIsResultOpen={setIsResultOpen}
      />

      <div className="bg-background mx-auto w-full">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
          {question}
        </h2>

        <Separator className="mt-2 mb-3" />

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
          />
        </form>

        <BottomKeypad>
          <YesNoSegment
            value={checked}
            onChange={setChecked}
            disabled={isLoading}
          />
        </BottomKeypad>
      </div>
    </>
  );
};
