import { Button } from "../button";
import { Separator } from "../separator";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { Checkbox } from "../checkbox"; // Checkbox 컴포넌트 추가
import { Label } from "../label";
import React, { useState } from "react";
import SubmitButton from "./SubmitButton";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import { useQuestionSessionAnswer } from "@/app/(app)/_hooks/useQuestionSession";

// 옵션 타입
interface OptionItem {
  id: number;
  option: string;
}

// 컴포넌트 Prop 타입
interface QuestionChoiceProps {
  question: string;
  isMultiple: boolean; // 복수 선택 여부 플래그
  options: OptionItem[];
  isFirst?: boolean;
  onClickPrevious?: () => void;
  onClickNext?: () => void;
}

export const QuestionMultipleChoice = ({
  question,
  isMultiple,
  options,
}: QuestionChoiceProps) => {
  const {
    question: questionMap,
    isFirstQuestion,
    previousQuestion,
  } = useQuestionSessionStore(state => state);
  const { submit, isLoading, ResultDialog } = useQuestionSessionAnswer();

  const [singleSelection, setSingleSelection] = useState<number | null>(null); // 단일 선택 상태
  const [multipleSelections, setMultipleSelections] = useState<number[]>([]); // 복수 선택 상태

  const handleSingleSelect = (id: number) => {
    setSingleSelection(id);
  };

  const handleMultipleSelect = (id: number, isChecked: boolean) => {
    setMultipleSelections(prev => {
      const currentSelections = (prev as number[]) || [];
      if (isChecked) {
        return [...currentSelections, id];
      } else {
        return currentSelections.filter(selectedId => selectedId !== id);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await submit({
      answersForMultipleChoice: isMultiple
        ? multipleSelections.map(Number)
        : singleSelection !== null
        ? [Number(singleSelection)]
        : [],
    });
  };

  const isSubmitDisabled = isMultiple
    ? multipleSelections.length === 0 // 복수: 선택된 항목이 없으면 비활성화
    : singleSelection === null; // 단일: 선택된 항목이 없으면 비활성화

  return (
    <>
      <ResultDialog />

      <div className="bg-background mx-auto w-full">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
          {question}
          {isMultiple && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (복수 선택 가능)
            </span>
          )}
        </h2>

        <Separator className="mt-2 mb-3" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {isMultiple ? (
              options.map((optionItem, key) => {
                const isChecked = (multipleSelections as number[]).includes(
                  optionItem.id
                );
                return (
                  <div
                    key={key}
                    id={`${optionItem.id}`}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`option-${optionItem.id}`}
                      checked={isChecked}
                      className="mt-1"
                      onCheckedChange={checked =>
                        handleMultipleSelect(optionItem.id, !!checked)
                      }
                    />
                    <Label
                      htmlFor={`option-${optionItem.id}`}
                      className="text-base flex-1 ml-3 leading-relaxed cursor-pointer"
                    >
                      {optionItem.option}
                    </Label>
                  </div>
                );
              })
            ) : (
              <RadioGroup
                onValueChange={value => handleSingleSelect(Number(value))}
                value={singleSelection ? String(singleSelection) : ""}
                className="space-y-3"
              >
                {options.map((optionItem, key) => {
                  return (
                    <div className="flex items-center space-x-2" key={key}>
                      <RadioGroupItem
                        value={String(optionItem.id)}
                        id={`option-${optionItem.id}`}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={`option-${optionItem.id}`}
                        className="text-base flex-1 ml-3 leading-relaxed cursor-pointer"
                      >
                        {optionItem.option}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            )}
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
