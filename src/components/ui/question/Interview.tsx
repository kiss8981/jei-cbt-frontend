import { Button } from "../button";
import { Textarea } from "../textarea";
import { Separator } from "../separator";
export const QuestionInterview = ({ question }: { question: string }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("면접형 답변 제출 시도");
  };

  return (
    <div className="p-4 bg-background max-w-xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        {question}
      </h2>

      <Separator className="mt-2 mb-3" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid w-full gap-1.5">
          <Textarea
            id="answer-input"
            placeholder=""
            rows={8}
            className="resize-y min-h-[150px]"
          />
        </div>

        <Button type="submit" className="w-full">
          다음
        </Button>
      </form>
    </div>
  );
};
