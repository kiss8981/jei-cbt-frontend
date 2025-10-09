import { Button } from "../button";
import { Separator } from "../separator";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { Checkbox } from "../checkbox"; // Checkbox 컴포넌트 추가
import { Label } from "../label";
import React, { useState } from "react";

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
}

export const QuestionMultipleChoice = ({
  question,
  isMultiple,
  options,
}: QuestionChoiceProps) => {
  const [singleSelection, setSingleSelection] = useState<number | null>(null); // 단일 선택 상태
  const [multipleSelections, setMultipleSelections] = useState<number[]>([]); // 복수 선택 상태

  // 단일 선택 핸들러 (isMultiple이 false일 때 사용)
  const handleSingleSelect = (id: number) => {
    console.log("단일 선택된 ID:", id);
    setSingleSelection(id);
  };

  // 복수 선택 핸들러 (isMultiple이 true일 때 사용)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      `제출된 ${isMultiple ? "복수" : "단일"} 답변 ID:`,
      isMultiple ? multipleSelections : singleSelection
    );
    // 실제 로직: API 호출
  };

  // 제출 버튼 비활성화 조건
  const isSubmitDisabled = isMultiple
    ? multipleSelections.length === 0 // 복수: 선택된 항목이 없으면 비활성화
    : singleSelection === null; // 단일: 선택된 항목이 없으면 비활성화

  return (
    <div className="p-4 bg-background max-w-xl mx-auto">
      {/* 1. 문제 제목 영역 */}
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
            options.map(optionItem => {
              const isChecked = (multipleSelections as number[]).includes(
                optionItem.id
              );
              return (
                <div
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
              {options.map(optionItem => {
                return (
                  <div className="flex items-center space-x-2">
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

        {/* 3. 제출 버튼 */}
        <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
          다음
        </Button>
      </form>
    </div>
  );
};
