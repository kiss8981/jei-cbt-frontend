"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, Plus, Trash2, ArrowRightLeft } from "lucide-react";

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
  const { question, isLoading: isFetching, refetch } = useQuestion(questionId);
  const { handleEdit, isUpdating } = useQuestionUpdate(questionId);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);

  const form = useForm<AdminUpdateQuestionInput>({
    resolver: zodResolver(adminUpdateQuestionSchema),
    defaultValues: {
      title: "",
      explanation: "",
      additionalText: "",
      answersForShortAnswers: [],
      answersForMatching: [], // 연결형 초기값
    },
  });

  // [Hook 1] 단답형 필드 배열
  const {
    fields: shortAnswerFields,
    append: appendShort,
    remove: removeShort,
  } = useFieldArray({
    control: form.control,
    name: "answersForShortAnswers",
  });

  // [Hook 2] 연결형 필드 배열 👈 추가됨
  const {
    fields: matchingFields,
    append: appendMatching,
    remove: removeMatching,
  } = useFieldArray({
    control: form.control,
    name: "answersForMatching",
  });

  const { isDirty } = form.formState;

  // 초기 데이터 로드 및 매핑
  useEffect(() => {
    if (question) {
      // 1. 단답형 데이터 매핑
      const shortAnswers =
        question.type === QuestionType.SHORT_ANSWER
          ? question.correctAnswers || []
          : [];

      // 2. 연결형 데이터 매핑 👈 (GET DTO -> Form DTO 변환)
      // GET DTO는 items: { leftItem: {id, content}, rightItem: {id, content} }[] 구조라고 가정
      const matchingAnswers =
        question.type === QuestionType.MATCHING && question.items
          ? question.items.map(item => {
              return {
                leftItemId: Number(item.leftItem.id),
                pairingItemId: Number(item.rightItem.id),
                leftItem: item.leftItem.content,
                rightItem: item.rightItem.content,
              };
            })
          : [];

      form.reset({
        title: question.title,
        explanation: question.explanation || "",
        additionalText: question.additionalText || "",
        answersForShortAnswers: shortAnswers,
        answersForMatching: matchingAnswers,
      });
    }
  }, [question, form]);

  async function onSubmit(values: AdminUpdateQuestionInput) {
    console.log(values.answersForMatching);
    const payload: UpdateQuestionAdminDto = {
      title: values.title,
      explanation: values.explanation,
      additionalText: values.additionalText,

      // 단답형 처리
      answersForShortAnswers:
        question?.type === QuestionType.SHORT_ANSWER
          ? values.answersForShortAnswers?.map(ans => ({
              id: ans.id ?? null,
              content: ans.content,
            })) || []
          : [],

      // 연결형 처리 👈 (Form DTO -> POST DTO)
      answersForMatching:
        question?.type === QuestionType.MATCHING
          ? values.answersForMatching?.map(ans => ({
              leftItemId: ans.leftItemId ?? null,
              pairingItemId: ans.pairingItemId ?? null,
              leftItem: ans.leftItem,
              rightItem: ans.rightItem,
            }))
          : [],
    };

    const isSuccess = await handleEdit(payload);

    if (isSuccess) {
      form.reset(values);
    }
  }

  if (isFetching || !question) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 pb-24">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">문제 수정</h1>
          <p className="text-muted-foreground">
            {question.type === QuestionType.MATCHING &&
              "연결형 문제의 보기 쌍을 관리합니다."}
            {question.type === QuestionType.SHORT_ANSWER &&
              "단답형 문제의 정답을 관리합니다."}
            {question.type !== QuestionType.MATCHING &&
              question.type !== QuestionType.SHORT_ANSWER &&
              "문제 정보를 수정합니다."}
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
          {/* 1. 기본 정보 카드 */}
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
                      <Input placeholder="질문 내용을 입력하세요" {...field} />
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
                          placeholder="해설 입력"
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
                          placeholder="힌트 입력"
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

          {/* 2. 단답형 UI (기존 코드) */}
          {question.type === QuestionType.SHORT_ANSWER && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex flex-col gap-1">
                  <CardTitle>정답 관리 (단답형)</CardTitle>
                  <CardDescription>
                    인정되는 정답을 입력해주세요.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => appendShort({ id: null, content: "" })}
                >
                  <Plus className="size-4" /> 정답 추가
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {shortAnswerFields.map((field, index) => (
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeShort(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 3. 연결형 UI 👈 (새로 추가됨) */}
          {question.type === QuestionType.MATCHING && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex flex-col gap-1">
                  <CardTitle>보기 쌍 관리 (연결형)</CardTitle>
                  <CardDescription>
                    왼쪽 항목과 올바르게 연결될 오른쪽 항목을 입력해주세요.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    appendMatching({
                      leftItemId: null,
                      pairingItemId: null,
                      leftItem: "",
                      rightItem: "",
                    })
                  }
                >
                  <Plus className="size-4" />
                  보기 쌍 추가
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {matchingFields.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-md border border-dashed">
                    <p>등록된 보기 쌍이 없습니다.</p>
                  </div>
                )}

                {/* 헤더 (PC 화면에서만 표시) */}
                {matchingFields.length > 0 && (
                  <div className="hidden md:flex gap-4 px-10 mb-2 text-sm font-medium text-muted-foreground">
                    <div className="flex-1">왼쪽 항목</div>
                    <div className="flex-1">오른쪽 항목 (정답)</div>
                  </div>
                )}

                {matchingFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col md:flex-row items-start md:items-start gap-3 p-3 md:p-0 rounded-lg bg-slate-50 md:bg-transparent dark:bg-slate-900/50 md:dark:bg-transparent"
                  >
                    {/* 순서 번호 */}
                    <span className="flex h-10 w-8 shrink-0 items-center justify-center text-sm font-medium text-muted-foreground bg-white md:bg-muted rounded-md border md:border-none shadow-sm md:shadow-none">
                      {index + 1}
                    </span>

                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 relative">
                      {/* 모바일용 연결 아이콘 */}
                      <div className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-50 dark:bg-slate-900 p-1 rounded-full border">
                        <ArrowRightLeft className="size-3 text-muted-foreground" />
                      </div>

                      {/* 왼쪽 항목 */}
                      <FormField
                        control={form.control}
                        name={`answersForMatching.${index}.leftItem`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} placeholder="왼쪽 항목 입력" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 오른쪽 항목 */}
                      <FormField
                        control={form.control}
                        name={`answersForMatching.${index}.rightItem`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="오른쪽 항목 입력"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 hover:text-red-500 hover:bg-red-50 self-end md:self-auto"
                      onClick={() => removeMatching(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 그 외 유형 안내 */}
          {![QuestionType.SHORT_ANSWER, QuestionType.MATCHING].includes(
            question.type
          ) && (
            <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <p>현재 단답형 및 연결형 문제 수정만 지원됩니다.</p>
              </CardContent>
            </Card>
          )}

          <UnsavedChangesBar
            isDirty={isDirty}
            onSave={form.handleSubmit(onSubmit, errors =>
              console.log("❌ 유효성 검사 실패:", errors)
            )}
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
