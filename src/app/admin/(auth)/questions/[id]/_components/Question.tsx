"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Hooks & Components
import {
  useQuestion,
  useQuestionUpdate,
} from "@/app/admin/_hooks/apis/useQuestions";
import { PhotoDialog } from "@/app/admin/_components/PhotoDialog";
import UnsavedChangesBar from "@/app/admin/_components/UnsavedChangesBar";

// Types
import {
  adminUpdateQuestionSchema,
  AdminUpdateQuestionInput,
} from "@/schemas/admin/question";
import { UpdateQuestionAdminDto } from "@/lib/http/apis/dtos/admin/question/update-question.admin.dto";
import { QuestionType } from "@/lib/http/apis/dtos/common/question-type.enum";

const Question = ({ questionId }: { questionId: number }) => {
  // 1. 데이터 조회 Hook
  const { question, isLoading: isFetching, refetch } = useQuestion(questionId);

  // 2. 데이터 수정 Hook
  const { handleEdit, isUpdating } = useQuestionUpdate(questionId);

  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);

  const form = useForm<AdminUpdateQuestionInput>({
    resolver: zodResolver(adminUpdateQuestionSchema),
    defaultValues: {
      title: "",
      explanation: "",
      additionalText: "",
      answersForShortAnswers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "answersForShortAnswers",
  });

  const { isDirty } = form.formState;

  // 초기 데이터 로드
  useEffect(() => {
    if (question) {
      form.reset({
        title: question.title,
        explanation: question.explanation || "",
        additionalText: question.additionalText || "",
        // 타입이 단답형일 때만 정답 데이터를 폼에 바인딩
        answersForShortAnswers:
          question.type === QuestionType.SHORT_ANSWER
            ? question.correctAnswers // DTO에 따라 필드명이 다를 수 있음 (answersForShortAnswers 확인 필요)
            : [],
      });
    }
  }, [question, form]);

  // 3. 폼 제출 핸들러
  async function onSubmit(values: AdminUpdateQuestionInput) {
    // DTO 변환
    const payload: UpdateQuestionAdminDto = {
      title: values.title,
      explanation: values.explanation,
      additionalText: values.additionalText,
      // 단답형일 때만 정답 목록을 보냄 (다른 유형일 경우 빈 배열)
      answersForShortAnswers:
        question?.type === QuestionType.SHORT_ANSWER
          ? values.answersForShortAnswers?.map(ans => ({
              id: ans.id ?? null,
              content: ans.content,
            })) || []
          : [],
    };

    // API 호출
    const isSuccess = await handleEdit(payload);

    if (isSuccess) {
      form.reset(values);
    }
  }

  // 로딩 상태 처리
  if (isFetching || !question) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">문제 수정</h1>
          <p className="text-muted-foreground">
            {question.type === QuestionType.SHORT_ANSWER
              ? "단답형 문제의 정답과 내용을 관리합니다."
              : "문제의 기본 정보를 수정합니다."}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsPhotoDialogOpen(true)}
          className="gap-2"
        >
          <ImageIcon className="size-4" />
          사진 관리 ({question.photos?.length || 0})
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={e => e.preventDefault()} className="space-y-6">
          {/* 1. 기본 정보 카드 (모든 유형 공통) */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>질문과 해설을 입력해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      문제 제목 (질문) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="예: 대한민국의 수도는?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>문제 해설</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="정답에 대한 해설"
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
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
                      <FormLabel>추가 설명</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="문제 하단 힌트"
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* 2. 정답 관리 카드: [단답형]일 때만 표시 👈 핵심 수정 사항 */}
          {question.type === QuestionType.SHORT_ANSWER && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex flex-col gap-1">
                  <CardTitle>정답 관리 (단답형)</CardTitle>
                  <CardDescription>
                    인정되는 모든 정답을 입력해주세요.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => append({ id: null, content: "" })}
                >
                  <Plus className="size-4" />
                  정답 추가
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {fields.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-md border border-dashed">
                    <p>등록된 정답이 없습니다.</p>
                  </div>
                )}
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-3">
                    <span className="flex h-10 w-8 shrink-0 items-center justify-center text-sm font-medium text-muted-foreground bg-muted rounded-md">
                      {index + 1}
                    </span>
                    <FormField
                      control={form.control}
                      name={`answersForShortAnswers.${index}.content`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={`정답 ${index + 1}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 hover:text-red-500 hover:bg-red-50"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 추후 다른 유형(객관식 등)이 추가될 자리 */}
          {question.type !== QuestionType.SHORT_ANSWER && (
            <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <p>현재 단답형 문제 수정만 지원됩니다.</p>
                <p className="text-sm">
                  ({question.type} 유형의 정답 수정 UI는 준비 중입니다)
                </p>
              </CardContent>
            </Card>
          )}

          {/* 변경 사항 저장 바 연결 */}
          <UnsavedChangesBar
            isDirty={isDirty}
            onSave={form.handleSubmit(onSubmit)}
            onReset={() => form.reset()}
            isSaving={isUpdating}
          />
        </form>
      </Form>

      {/* 사진 모달 */}
      {isPhotoDialogOpen && (
        <PhotoDialog
          photos={question.photos}
          endpoint={`/admin/questions/${question.id}/photos`}
          onClose={() => {
            setIsPhotoDialogOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default Question;
