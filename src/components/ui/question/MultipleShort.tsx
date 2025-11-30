import { Input } from "../input";
import { Separator } from "../separator";
import { useState, useMemo } from "react"; // useMemo 추가
import SubmitButton from "./SubmitButton";
import { useQuestionSessionAnswer } from "@/app/(app)/_hooks/useQuestionSession";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import ResultDialog from "./ResultDialog";

export const QuestionMultipleShort = ({ question }: { question: string }) => {
  const {
    question: questionMap,
    isFirstQuestion,
    previousQuestion,
  } = useQuestionSessionStore(state => state);
  const { submit, isLoading, isResultOpen, result, setIsResultOpen } =
    useQuestionSessionAnswer();

  // 정규식 매칭 결과
  const placeholders = useMemo(
    () => [...question.matchAll(/\{(\d+)\}/g)],
    [question]
  );

  // [수정 1] 문제에 포함된 모든 인덱스 추출 및 최대 인덱스 계산
  const indices = useMemo(
    () => placeholders.map(match => parseInt(match[1])),
    [placeholders]
  );
  const maxIndex = indices.length > 0 ? Math.max(...indices) : -1;

  // [수정 2] 배열 크기를 (최대 인덱스 + 1)로 설정
  // 예: {0} {0} 이면 maxIndex는 0이므로 배열 길이는 1
  const [answers, setAnswers] = useState(
    Array.from({ length: maxIndex + 1 }, () => "")
  );

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
      // 값이 있는 항목만 필터링하거나, 백엔드 로직에 맞춰 그대로 전송
      // 여기서는 인덱스 순서를 유지하며 전송
      answersForMultipleShortAnswer: answers.map((ans, idx) => ({
        orderIndex: Number(idx),
        content: ans.trim(),
      })),
    });
  };

  // [수정 3] 유효성 검사 로직 변경
  // answers 배열 전체가 아니라, '실제로 문제에 존재하는 인덱스(indices)'만 값이 채워졌는지 확인
  const isFormValid = indices.every(
    index => answers[index] && answers[index].trim() !== ""
  );

  const renderQuestionWithInputs = () => {
    const parts = [];
    let lastIndex = 0;

    placeholders.forEach(match => {
      const placeholderIndex = parseInt(match[1]);
      const matchIndex = match.index;

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
          // key를 유니크하게 만들기 위해 matchIndex를 포함 (같은 인덱스가 여러번 나올 수 있으므로)
          key={`input-${placeholderIndex}-${matchIndex}`}
          id={`answer-${placeholderIndex}`}
          type="text"
          value={answers[placeholderIndex] || ""} // undefined 방지
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
    <>
      <ResultDialog
        result={result}
        isResultOpen={isResultOpen}
        setIsResultOpen={setIsResultOpen}
      />
      <div className="bg-background mx-auto w-full">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          다음 빈칸에 알맞은 말을 넣으세요.
        </h2>

        <Separator className="mt-2 mb-3" />

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
          />
        </form>
      </div>
    </>
  );
};
