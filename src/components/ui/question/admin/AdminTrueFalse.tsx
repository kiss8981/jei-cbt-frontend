import React, { useState } from "react";
import { Separator } from "../../separator";
import { Label } from "../../label";
import { Switch } from "../../switch";
import { Button } from "../../button";
import { Input } from "../../input";
import { useQuestionForEdit } from "@/app/admin/_hooks/apis/useQuestions";

interface AdminTrueFalseProps {
  initialQuestionTitle?: string;
  // DTO: answersForCorrectAnswerForTrueFalse
  initialCorrectAnswer?: boolean;

  questionId?: number;
}

export const AdminQuestionTrueFalse = ({
  questionId,
  initialQuestionTitle,
  initialCorrectAnswer = false,
}: AdminTrueFalseProps) => {
  // 정답 상태 관리: true (참) 또는 false (거짓)
  const [correctAnswer, setCorrectAnswer] =
    useState<boolean>(initialCorrectAnswer);
  const [questionTitle, setQuestionTitle] = useState<string>(
    initialQuestionTitle || ""
  );
  const { handleEdit } = useQuestionForEdit(questionId!);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      // DTO에 맞춘 정답 데이터 구조
      type: "TRUE_FALSE",
      title: questionTitle,
      answersForCorrectAnswerForTrueFalse: correctAnswer,
    };

    await handleEdit(data);
  };

  return (
    <div className="p-4 bg-background max-w-xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
        문제 유형 -진위형
      </h2>
      <p className="text-sm text-muted-foreground mb-4 mt-2">
        <Input
          value={questionTitle}
          onChange={e => setQuestionTitle(e.target.value)}
          placeholder="문제 제목을 입력하세요"
          className="w-full"
        />
      </p>

      <Separator className="mt-2 mb-3" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 border rounded-lg bg-primary/10 flex items-center justify-between">
          <Label
            htmlFor="correct-answer-switch"
            className="text-base font-medium flex-1 mr-4"
          >
            정답이 참(O)이면 스위치를 켜주세요.
          </Label>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-500">거짓 (X)</span>
            <Switch
              id="correct-answer-switch"
              checked={correctAnswer}
              onCheckedChange={setCorrectAnswer}
            />
            <span className="text-sm font-medium text-primary">참 (O)</span>
          </div>
        </div>

        <Button type="submit" className="w-full">
          저장
        </Button>
      </form>
    </div>
  );
};
