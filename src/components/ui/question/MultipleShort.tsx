import { Input } from "../input";
import { useState, useMemo } from "react";
import SubmitButton from "./SubmitButton";
import ResultDialog from "./ResultDialog";
import ResultDialogByWrong from "./ResultDialogByWrong";
import { QuestionPhoto, QuestionPrompt } from "./QuestionPrompt";

// 1. 상태 및 액션 타입 정의 (공통 패턴)
interface QuestionState {
  isFirstQuestion: boolean;
  previousQuestion: () => void;
}

interface QuestionAnswerState {
  submit: (data: {
    answersForMultipleShortAnswer: { orderIndex: number; content: string }[];
  }) => Promise<any>;
  isLoading: boolean;
  isResultOpen: boolean;
  result: any;
  setIsResultOpen: (isOpen: boolean) => void;
}

// 2. 초기 답변 타입 정의 (백엔드 구조에 맞춤)
interface ShortAnswerItem {
  orderIndex: number;
  content: string;
}

interface QuestionMultipleShortProps {
  question: string;
  additionalText?: string | null;
  photos?: QuestionPhoto[] | null;
  initialUserAnswer?: ShortAnswerItem[]; // 초기값 지원을 위해 추가
  // Hooks 대신 전달받을 상태 객체
  questionState: QuestionState;
  answerState: QuestionAnswerState;
  isSession: boolean;
}

export const QuestionMultipleShort = ({
  question,
  additionalText,
  photos,
  initialUserAnswer,
  questionState,
  answerState,
  isSession,
}: QuestionMultipleShortProps) => {
  // 3. Props에서 로직 분해 할당
  const { isFirstQuestion, previousQuestion } = questionState;

  const { submit, isLoading, isResultOpen, result, setIsResultOpen } =
    answerState;

  // 4. 정규식 매칭 및 인덱스 계산 (UI 로직이므로 컴포넌트 내 유지)
  const placeholders = useMemo(
    () => [...question.matchAll(/\{(\d+)\}/g)],
    [question]
  );

  const indices = useMemo(
    () => placeholders.map(match => parseInt(match[1])),
    [placeholders]
  );

  const maxIndex = indices.length > 0 ? Math.max(...indices) : -1;

  // 5. 로컬 상태 관리
  const [answers, setAnswers] = useState<string[]>(() => {
    // 배열 크기 설정
    const arr = Array.from({ length: maxIndex + 1 }, () => "");

    // 초기값이 있다면 매핑 (기존 코드 개선: 초기값 반영 로직 추가)
    if (initialUserAnswer && initialUserAnswer.length > 0) {
      initialUserAnswer.forEach(item => {
        if (item.orderIndex <= maxIndex) {
          arr[item.orderIndex] = item.content;
        }
      });
    }
    return arr;
  });

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[index] = value;
      return newAnswers;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await submit({
      answersForMultipleShortAnswer: answers.map((ans, idx) => ({
        orderIndex: Number(idx),
        content: ans.trim(),
      })),
    });
  };

  const isFormValid = indices.every(
    index => answers[index] && answers[index].trim() !== ""
  );

  // 6. 렌더링 로직 (UI 파싱 로직 유지)
  const renderQuestionWithInputs = () => {
    const parts = [];
    let lastIndex = 0;

    placeholders.forEach(match => {
      const placeholderIndex = parseInt(match[1]);
      const matchIndex = match.index!; // match.index는 undefined일 수 없으므로 단언

      if (matchIndex > lastIndex) {
        parts.push(
          <span
            key={`text-${lastIndex}`}
            className="whitespace-pre-wrap leading-10"
          >
            {question.substring(lastIndex, matchIndex)}
          </span>
        );
      }

      parts.push(
        <Input
          key={`input-${placeholderIndex}-${matchIndex}`}
          id={`answer-${placeholderIndex}`}
          type="text"
          value={answers[placeholderIndex] || ""}
          onChange={e => handleAnswerChange(placeholderIndex, e.target.value)}
          className="inline-block h-8 min-w-[100px] w-auto mx-1 border-1 border-primary focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-center text-base"
          placeholder={`답변 ${placeholderIndex + 1}`}
        />
      );

      lastIndex = matchIndex + match[0].length;
    });

    if (lastIndex < question.length) {
      parts.push(
        <span
          key={`text-${lastIndex}`}
          className="whitespace-pre-wrap line-clamp-"
        >
          {question.substring(lastIndex)}
        </span>
      );
    }

    return parts;
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
          question="다음 빈칸에 알맞은 말을 넣으세요."
          additionalText={additionalText}
          photos={photos}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            id="question-area"
            className="p-3 leading-relaxed text-lg border-l-4 border-l-muted-foreground/50 bg-muted/20 rounded-md flex flex-wrap items-center"
          >
            {renderQuestionWithInputs()}
          </div>

          <SubmitButton
            isFirst={isFirstQuestion}
            onPrevious={previousQuestion}
            disabledSubmit={!isFormValid}
            loadingSubmit={isLoading}
            isSession={isSession}
          />
        </form>
      </div>
    </div>
  );
};
