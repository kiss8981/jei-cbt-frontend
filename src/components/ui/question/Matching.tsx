import { Button } from "../button";
import { Separator } from "../separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { useState } from "react"; // 상태 관리를 위해 useState 추가
import SubmitButton from "./SubmitButton";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import { useQuestionSessionAnswer } from "@/app/(app)/_hooks/useQuestionSession";

interface MatchingItem {
  id: number;
  option: string;
}

interface QuestionMatchingProps {
  question: string; // 문제의 설명
  leftItems: MatchingItem[]; // 왼쪽 항목 (연결 대상)
  rightItems: MatchingItem[]; // 오른쪽 항목 (선택 옵션)
}

export const QuestionMatching = ({
  question = "다음 항목들을 바르게 연결하시오.", // 기본값 설정
  leftItems,
  rightItems,
}: QuestionMatchingProps) => {
  const {
    question: questionMap,
    isFirstQuestion,
    previousQuestion,
  } = useQuestionSessionStore(state => state);
  const { submit, isLoading, ResultDialog } = useQuestionSessionAnswer();

  const [selections, setSelections] = useState<{ [key: number]: number }>({});

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
    <>
      <ResultDialog />

      <div className="bg-background mx-auto w-full">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
          {question}
        </h2>

        <Separator className="mt-2 mb-3" />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 연결 항목 목록 */}
          <div className="grid gap-4 p-3 border rounded-lg bg-muted/20">
            {leftItems.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                {/* 왼쪽 항목 텍스트 */}
                <span className="w-1/3 font-semibold text-base">
                  {item.option}
                </span>

                {/* 오른쪽 항목을 선택하는 Select 드롭다운 */}
                <div className="w-2/3 ml-4">
                  <Select
                    onValueChange={value =>
                      handleSelectChange(item.id, Number(value))
                    }
                    value={selections[item.id]?.toString()} // 현재 선택된 값
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="항목 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* SelectItem은 오른쪽 항목(rightItems) 전체 목록을 제공 */}
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
          />
        </form>
      </div>
    </>
  );
};
