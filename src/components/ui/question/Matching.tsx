import { Button } from "../button";
import { Separator } from "../separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { useState } from "react";
import SubmitButton from "./SubmitButton";
import ResultDialog from "./ResultDialog";
import { SubmissionAnswersForMatchingAppDto } from "@/lib/http/apis/dtos/app/question/submission-answer-request.app.dto";
import ResultDialogByWrong from "./ResultDialogByWrong";

interface MatchingItem {
  id: number;
  option: string;
}

// 1. 상태 및 액션 타입을 정의 (이전과 동일한 패턴)
interface QuestionState {
  isFirstQuestion: boolean;
  previousQuestion: () => void;
}

interface QuestionAnswerState {
  submit: (data: { answersForMatching: any[] }) => Promise<any>;
  isLoading: boolean;
  isResultOpen: boolean;
  result: any;
  setIsResultOpen: (isOpen: boolean) => void;
}

interface QuestionMatchingProps {
  question?: string;
  leftItems: MatchingItem[];
  rightItems: MatchingItem[];
  initialUserAnswer?: SubmissionAnswersForMatchingAppDto[];
  // 2. 훅 대신 받을 Props 추가
  questionState: QuestionState;
  answerState: QuestionAnswerState;
  isSession: boolean;
}

export const QuestionMatching = ({
  question = "다음 항목들을 바르게 연결하시오.",
  leftItems,
  rightItems,
  initialUserAnswer,
  questionState,
  answerState,
  isSession,
}: QuestionMatchingProps) => {
  // 3. Props에서 로직 분해 할당
  const { isFirstQuestion, previousQuestion } = questionState;

  const { submit, isLoading, isResultOpen, result, setIsResultOpen } =
    answerState;

  // 4. UI 로컬 상태 (선택값 관리)는 그대로 유지
  const [selections, setSelections] = useState<{ [key: number]: number }>(
    () => {
      const initialSelections: { [key: number]: number } = {};
      if (initialUserAnswer) {
        initialUserAnswer.forEach(answer => {
          initialSelections[answer.leftItemId] = answer.rightItemId;
        });
      }
      return initialSelections;
    }
  );

  const handleSelectChange = (itemId: number, value: number) => {
    setSelections(prev => ({
      ...prev,
      [itemId]: Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await submit({
      answersForMatching: Object.entries(selections).map(
        ([leftId, rightId]) => ({
          leftItemId: Number(leftId),
          rightItemId: Number(rightId),
        })
      ),
    });
  };

  const isSubmitDisabled = Object.keys(selections).length !== leftItems.length;

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
          <div className="grid gap-6 p-3 border rounded-lg bg-muted/20">
            {leftItems.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="w-1/3 font-semibold text-base">
                  • {item.option}
                </span>

                <div className="w-2/3 ml-4">
                  <Select
                    onValueChange={value =>
                      handleSelectChange(item.id, Number(value))
                    }
                    value={selections[item.id]?.toString()}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="항목 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {rightItems.map(option => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          <SubmitButton
            isFirst={isFirstQuestion}
            onPrevious={previousQuestion}
            disabledSubmit={isSubmitDisabled}
            loadingSubmit={isLoading}
            isSession={isSession}
          />
        </form>
      </div>
    </div>
  );
};
