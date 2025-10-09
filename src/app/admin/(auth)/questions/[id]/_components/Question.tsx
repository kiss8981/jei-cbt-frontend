"use client";

import { useQuestion } from "@/app/admin/_hooks/apis/useQuestions";
import { Pagination, PaginationResultCount } from "@/components/ui/pagination";
import { useQuestionsFilterStore } from "@/lib/store/stores/questions-store";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { QuestionTrueFalse } from "@/components/ui/question/TrueFalse";
import { GetQuestionAdminUnionDto } from "@/lib/http/apis/dtos/admin/question/get-question.admin.dto";
import { QuestionInterview } from "@/components/ui/question/Interview";
import { QuestionMultipleShort } from "@/components/ui/question/MultipleShort";
import { QuestionShortAnswer } from "@/components/ui/question/ShortAnswer";
import { QuestionMatching } from "@/components/ui/question/Matching";
import { QuestionMultipleChoice } from "@/components/ui/question/MultipleChoice";
import { AdminQuestionTrueFalse } from "@/components/ui/question/admin/AdminTrueFalse";

const Question = ({ questionId }: { questionId: number }) => {
  const { question, isLoading, error } = useQuestion(questionId);

  if (isLoading || !question) {
    return <Spinner className="size-8" />;
  }

  console.log(question);

  const renderQuestionEdit = (question: GetQuestionAdminUnionDto) => {
    switch (question.type) {
      case "TRUE_FALSE":
        return (
          <AdminQuestionTrueFalse
            initialQuestionTitle={question.question}
            initialCorrectAnswer={question.correctAnswer}
          />
        );
      default:
        return (
          <div className="text-sm text-red-500">
            지원하지 않는 문제 유형입니다.
          </div>
        );
    }
  };

  const renderQuestionPreview = (question: GetQuestionAdminUnionDto) => {
    switch (question.type) {
      case "INTERVIEW":
        return <QuestionInterview question={question.question} />;
      case "MULTIPLE_SHORT_ANSWER":
        return <QuestionMultipleShort question={question.question} />;
      case "TRUE_FALSE":
        return <QuestionTrueFalse question={question.question} />;
      case "SHORT_ANSWER":
        return <QuestionShortAnswer question={question.question} />;
      case "MATCHING":
        return (
          <QuestionMatching
            question={question.title}
            leftItems={question.leftItems}
            rightItems={question.rightItems}
          />
        );
      case "MULTIPLE_CHOICE":
        return (
          <QuestionMultipleChoice
            question={question.question}
            options={question.choices}
            isMultiple={question.isMultipleAnswer}
          />
        );
      default:
        return (
          <div className="text-sm text-red-500">
            지원하지 않는 문제 유형입니다.
          </div>
        );
    }
  };

  return (
    <>
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg">문제 관리</Label>
        </div>
      </div>

      {/* <div className="flex flex-col">
        <Label className="text-lg">문제 수정</Label>
        <div className="mt-2 w-full flex flex-col items-start justify-start">
          {renderQuestionEdit(question)}
        </div>
      </div> */}

      <div className="flex flex-col">
        <Label className="text-lg">미리보기 (저장 후 확인 가능)</Label>
        <Card className="mt-2 w-full border-2 border-dashed border-gray-300 bg-gray-50 p-4">
          {renderQuestionPreview(question)}
        </Card>
      </div>
    </>
  );
};

export default Question;
