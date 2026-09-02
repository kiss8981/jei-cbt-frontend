import { RadioGroup, RadioGroupItem } from "../radio-group";
import { Checkbox } from "../checkbox";
import { Label } from "../label";
import React, { useState } from "react";
import SubmitButton from "./SubmitButton";
import ResultDialog from "./ResultDialog";
import BottomKeypad from "./BottomKeypad";
import { MultipleChoiceSegment } from "./MultipleChoiceSegment";
import ResultDialogByWrong from "./ResultDialogByWrong";
import { QuestionPhoto, QuestionPrompt } from "./QuestionPrompt";

// 1. 옵션 타입
interface OptionItem {
  id: number;
  option: string;
}

// 2. 상태 및 액션 타입 정의 (공통 패턴)
interface QuestionState {
  isFirstQuestion: boolean;
  previousQuestion: () => void;
}

interface QuestionAnswerState {
  submit: (data: { answersForMultipleChoice: number[] }) => Promise<any>;
  isLoading: boolean;
  isResultOpen: boolean;
  result: any;
  setIsResultOpen: (isOpen: boolean) => void;
}

// 3. 컴포넌트 Prop 타입 수정
interface QuestionChoiceProps {
  question: string;
  additionalText?: string | null;
  photos?: QuestionPhoto[] | null;
  isMultiple: boolean;
  options: OptionItem[];
  initialUserAnswer?: number[];
  // Hooks 대신 전달받을 상태 객체
  questionState: QuestionState;
  answerState: QuestionAnswerState;
  isSession: boolean;
}

export const QuestionMultipleChoice = ({
  question,
  additionalText,
  photos,
  isMultiple,
  options,
  initialUserAnswer,
  questionState,
  answerState,
  isSession,
}: QuestionChoiceProps) => {
  // 4. Props에서 로직 분해 할당
  const { isFirstQuestion, previousQuestion } = questionState;

  const { submit, isLoading, isResultOpen, result, setIsResultOpen } =
    answerState;

  // 5. 로컬 상태 관리 (UI 선택값)
  const [singleSelection, setSingleSelection] = useState<number | null>(() => {
    // 복수 선택 모드이거나 초기값이 여러 개면 단일 선택은 null
    if (isMultiple && initialUserAnswer && initialUserAnswer.length > 0)
      return null;
    // 단일 선택 모드이고 초기값이 있으면 첫 번째 값 사용
    if (initialUserAnswer && initialUserAnswer.length > 0)
      return initialUserAnswer[0];
    return null;
  });

  const [multipleSelections, setMultipleSelections] = useState<number[]>(
    initialUserAnswer || []
  );

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
    ? multipleSelections.length === 0
    : singleSelection === null;

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
        >
          {isMultiple && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (복수 선택 가능)
            </span>
          )}
        </QuestionPrompt>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {isMultiple ? (
              options.map((optionItem, key) => {
                const isChecked = multipleSelections.includes(optionItem.id);
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
            isSession={isSession}
          />
        </form>

        {!isMultiple && (
          <BottomKeypad isSession={isSession}>
            <MultipleChoiceSegment
              multiple={isMultiple}
              maxSelected={isMultiple ? options.length : 1}
              values={options.map((item, idx) => idx + 1)}
              value={
                options.findIndex(
                  item => item.id === (singleSelection as number)
                ) + 1
              }
              valuesControlled={multipleSelections}
              onChange={idx => {
                if (isMultiple) {
                  // BottomKeypad의 복수 선택 로직이 필요할 경우 구현
                  // 현재 UI에서는 !isMultiple 조건 때문에 단일 선택 로직만 타게 됩니다.
                  const selectedIdxes = idx as number[];
                  const selectedIds = selectedIdxes.map(i => options[i - 1].id);
                  setMultipleSelections(selectedIds);
                } else {
                  handleSingleSelect(options[(idx as number) - 1].id);
                }
              }}
              disabled={isLoading}
            />
          </BottomKeypad>
        )}
      </div>
    </div>
  );
};
