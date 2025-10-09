import { Button } from "../button";
import { Separator } from "../separator"; // Separator 추가
import { Input } from "../input";
import { useState } from "react";

export const QuestionShortAnswer = ({ question }: { question: string }) => {
  const [answer, setAnswer] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("단답형 답변 제출 시도");
  };

  return (
    <div className="p-4 bg-background max-w-xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
        {question}
      </h2>

      <Separator className="mt-2 mb-3" />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 2. 답변 입력 영역 */}
        <div className="grid w-full gap-1.5">
          <Input
            type="text"
            id="answer-input"
            className="text-base"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="답변"
          />
        </div>

        {/* 3. 제출 버튼 */}
        <Button type="submit" className="w-full">
          다음
        </Button>
      </form>
    </div>
  );
};
