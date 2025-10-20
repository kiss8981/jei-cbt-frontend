"use client";

import { useQuestion } from "@/app/admin/_hooks/apis/useQuestions";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { QuestionTrueFalse } from "@/components/ui/question/TrueFalse";
import { GetQuestionAdminUnionDto } from "@/lib/http/apis/dtos/admin/question/get-question.admin.dto";
import { QuestionInterview } from "@/components/ui/question/Interview";
import { QuestionMultipleShort } from "@/components/ui/question/MultipleShort";
import { QuestionShortAnswer } from "@/components/ui/question/ShortAnswer";
import { QuestionMatching } from "@/components/ui/question/Matching";
import { QuestionMultipleChoice } from "@/components/ui/question/MultipleChoice";
import { AdminQuestionTrueFalse } from "@/components/ui/question/admin/AdminTrueFalse";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AdminUpdateQuestionInput,
  adminUpdateQuestionSchema,
} from "@/schemas/admin/question";
import { PhotoDialog } from "@/app/admin/_components/PhotoDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";
import UnsavedChangesBar from "@/app/admin/_components/UnsavedChangesBar";
import { Button } from "@/components/ui/button";

const Question = ({ questionId }: { questionId: number }) => {
  const { question, isLoading, error, refetch } = useQuestion(questionId);
  const form = useForm<AdminUpdateQuestionInput>({
    resolver: zodResolver(adminUpdateQuestionSchema),
    defaultValues: {
      title: question?.title,
      explanation: question?.explanation || "",
      additionalText: question?.additionalText || "",
    },
  });
  const { isDirty } = form.formState;

  useEffect(() => {
    if (question) {
      form.reset({
        title: question.title,
        explanation: question.explanation || "",
        additionalText: question.additionalText || "",
      });
    }
  }, [question, form]);

  async function onSubmit(values: AdminUpdateQuestionInput) {
    console.log("저장된 값:", values);
  }

  if (isLoading || !question) {
    return <Spinner className="size-8" />;
  }

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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>문제 제목(질문)</FormLabel>
                <FormControl>
                  <Input placeholder="문제 제목을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="explanation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>문제 해설</FormLabel>
                <FormControl>
                  <Input placeholder="문제 해설을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>추가 설명 (문제 하단 표시)</FormLabel>
                <FormControl>
                  <Input placeholder="추가 설명을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-4" disabled={!isDirty}>
            저장하기
          </Button>

          <UnsavedChangesBar
            isDirty={isDirty}
            onSave={() => {
              form.handleSubmit(onSubmit);
              console.log(1123);
            }}
            onReset={() => form.reset()}
            // 저장 중 상태
            isSaving={false}
          />
        </form>
      </Form>

      <PhotoDialog
        photos={question.photos}
        endpoint={`/admin/questions/${question.id}/photos`}
        onClose={refetch}
      />

      {/* <div className="flex flex-col">
        <Label className="text-lg">문제 수정</Label>
        <div className="mt-2 w-full flex flex-col items-start justify-start">
          {renderQuestionEdit(question)}
        </div>
      </div> */}

      {/* <div className="flex flex-col">
        <Label className="text-lg">미리보기 (저장 후 확인 가능)</Label>
        <Card className="mt-2 w-full border-2 border-dashed border-gray-300 bg-gray-50 p-4">
          {renderQuestionPreview(question)}
        </Card>
      </div> */}
    </>
  );
};

export default Question;
