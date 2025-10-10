import { useState } from "react";
import { Button, FixedButton } from "../button";
import { Separator } from "../separator";
import { Switch } from "../switch";

export const QuestionTrueFalse = ({ question }: { question: string }) => {
  const [checked, setChecked] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("제출된 답변:", checked ? "예" : "아니요");
  };

  return (
    <div className="bg-background mx-auto w-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
        {question}
      </h2>

      <Separator className="mt-2 mb-3" />

      <form onSubmit={handleSubmit}>
        <div className="p-4 border rounded-lg bg-muted/20 flex items-center justify-between">
          <div className="flex items-center space-x-2 w-full justify-center">
            <span className="text-sm font-medium text-gray-500">아니요</span>
            <Switch
              id="true-false-switch"
              checked={checked}
              onCheckedChange={state => setChecked(state as boolean)}
            />
            <span className="text-sm font-medium text-primary">예</span>
          </div>
        </div>

        <FixedButton type="submit">제출</FixedButton>
      </form>
    </div>
  );
};
