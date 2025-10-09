import { Button } from "../button";
import { Input } from "../input";
import { Separator } from "../separator"; // Separator 추가
import { useState } from "react";

export const QuestionMultipleShort = ({ question }: { question: string }) => {
  const placeholders = [...question.matchAll(/\{(\d+)\}/g)];
  const numInputs = placeholders.length;

  const [answers, setAnswers] = useState(
    Array.from({ length: numInputs }, () => "")
  );

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[index] = value;
      return newAnswers;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("제출된 답변:", answers);
  };

  const renderQuestionWithInputs = () => {
    let parts = [];
    let lastIndex = 0;

    placeholders.forEach(match => {
      const placeholderIndex = parseInt(match[1]); // {0}에서 0 추출
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

      // 2. 빈칸 (Input 컴포넌트)
      parts.push(
        <Input
          key={`input-${placeholderIndex}`}
          id={`answer-${placeholderIndex}`}
          type="text"
          value={answers[placeholderIndex]}
          onChange={e => handleAnswerChange(placeholderIndex, e.target.value)}
          // 웹뷰 최적화 스타일 적용: 너비를 유연하게, 경계를 깔끔하게
          className="inline-block h-8 min-w-[100px] w-auto mx-1 border-1 border-primary focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-center text-base"
          placeholder={`답변 ${placeholderIndex + 1}`}
        />
      );

      lastIndex = matchIndex + match[0].length;
    });

    // 3. 마지막 빈칸 뒤의 일반 텍스트
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
    // Card 대신 베이스 템플릿의 div 구조를 사용
    <div className="p-4 bg-background max-w-xl mx-auto">
      {/* 문제 제목 */}
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        다음 빈칸에 알맞은 말을 넣으세요.
      </h2>

      <Separator className="mt-2 mb-3" />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 문제 영역: Textarea 대신 Input을 포함한 문제 텍스트를 렌더링 */}
        <div
          id="question-area"
          // 문제 텍스트를 감싸는 영역에 깔끔한 스타일 적용
          className="p-3 leading-relaxed text-lg border-l-4 border-l-muted-foreground/50 bg-muted/20 rounded-md flex flex-wrap items-center"
        >
          {renderQuestionWithInputs()}
        </div>

        {/* 제출 버튼 */}
        <Button type="submit" className="w-full">
          다음
        </Button>
      </form>
    </div>
  );
};
