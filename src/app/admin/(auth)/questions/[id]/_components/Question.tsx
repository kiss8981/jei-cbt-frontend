"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Hash,
  Mic,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
      answersForMatching: [],
      answersForMultipleChoice: [],
      answersForMultipleShortAnswer: [], // 빈칸 채우기 초기값
      answersForCorrectAnswerForTrueFalse: undefined,
    },
  });

  // --- Field Arrays ---

  // 1. 단답형 배열
  const {
    fields: shortAnswerFields,
    append: appendShort,
    remove: removeShort,
  } = useFieldArray({
    control: form.control,
    name: "answersForShortAnswers",
  });

  // 2. 연결형 배열
  const {
    fields: matchingFields,
    append: appendMatching,
    remove: removeMatching,
  } = useFieldArray({
    control: form.control,
    name: "answersForMatching",
  });

  // 3. 선다형 배열
  const {
    fields: multipleChoiceFields,
    append: appendMultipleChoice,
    remove: removeMultipleChoice,
  } = useFieldArray({
    control: form.control,
    name: "answersForMultipleChoice",
  });

  // 4. 빈칸 채우기 배열 👈 추가됨
  const {
    fields: multipleShortFields,
    append: appendMultipleShort,
    remove: removeMultipleShort,
  } = useFieldArray({
    control: form.control,
    name: "answersForMultipleShortAnswer",
  });

  const watchedTitle = useWatch({ control: form.control, name: "title" });

  useEffect(() => {
    if (question?.type !== QuestionType.MULTIPLE_SHORT_ANSWER) return;
    if (!watchedTitle) return;

    // 1. 제목에서 {숫자} 패턴 추출 (예: [0, 1])
    const matches = [...watchedTitle.matchAll(/\{(\d+)\}/g)].map(m =>
      parseInt(m[1])
    );
    const uniqueIndices = [...new Set(matches)].sort((a, b) => a - b);

    // 2. 현재 필드에 해당 orderIndex가 존재하는지 확인
    // (React Hook Form의 getValues를 사용하여 최신 상태 확인)
    const currentFields = form.getValues("answersForMultipleShortAnswer") || [];

    uniqueIndices.forEach(orderIndex => {
      const exists = currentFields.some(
        field => field.orderIndex === orderIndex
      );

      // 3. 존재하지 않으면 자동으로 빈 필드 추가
      if (!exists) {
        appendMultipleShort({
          id: null,
          content: "",
          orderIndex: orderIndex,
        });
      }
    });
  }, [watchedTitle, question?.type, appendMultipleShort, form]);

  const detectedIndices = useMemo(() => {
    if (!watchedTitle) return [];
    const matches = [...watchedTitle.matchAll(/\{(\d+)\}/g)].map(m =>
      parseInt(m[1])
    );
    return [...new Set(matches)].sort((a, b) => a - b);
  }, [watchedTitle]);

  const { isDirty } = form.formState;

  // --- Data Loading (Effect) ---
  useEffect(() => {
    if (question) {
      // 1. 단답형 매핑
      const shortAnswers =
        question.type === QuestionType.SHORT_ANSWER
          ? question.correctAnswers || []
          : [];

      // 2. 연결형 매핑
      const matchingAnswers =
        question.type === QuestionType.MATCHING && question.items
          ? question.items.map((item: any) => ({
              leftItemId: item.leftItem?.id ? Number(item.leftItem.id) : null,
              pairingItemId: item.rightItem?.id
                ? Number(item.rightItem.id)
                : null,
              leftItem: item.leftItem?.content || "",
              rightItem: item.rightItem?.content || "",
            }))
          : [];

      // 3. 진위형 매핑
      const trueFalseAnswer =
        question.type === QuestionType.TRUE_FALSE
          ? question.correctAnswer
          : undefined;

      // 4. 선다형 매핑
      const multipleChoiceAnswers =
        (question.type === QuestionType.MULTIPLE_CHOICE ||
          question.type === QuestionType.MULTIPLE_CHOICE_INPUT) &&
        question.choices
          ? question.choices.map((choice: any) => ({
              id: Number(choice.id),
              content: choice.content,
              isCorrect: choice.isCorrect,
            }))
          : [];

      // 5. 빈칸 채우기 매핑 👈 추가됨
      const multipleShortAnswers =
        question.type === QuestionType.MULTIPLE_SHORT_ANSWER &&
        question.correctAnswers
          ? question.correctAnswers
              .sort((a: any, b: any) => a.orderIndex - b.orderIndex) // 순서 보장
              .map((ans: any) => ({
                id: Number(ans.id),
                content: ans.content,
                orderIndex: ans.orderIndex,
              }))
          : [];
      const interviewAnswer =
        question.type === QuestionType.INTERVIEW ? question.answer || "" : "";

      form.reset({
        title: question.title,
        explanation: question.explanation || "",
        additionalText: question.additionalText || "",
        answersForShortAnswers: shortAnswers,
        answersForMatching: matchingAnswers,
        answersForCorrectAnswerForTrueFalse: trueFalseAnswer,
        answersForMultipleChoice: multipleChoiceAnswers,
        answersForMultipleShortAnswer: multipleShortAnswers,
        answersForInterview: interviewAnswer,
      });
    }
  }, [question, form]);

  // --- Submit Handler ---
  async function onSubmit(values: AdminUpdateQuestionInput) {
    const payload: UpdateQuestionAdminDto = {
      title: values.title,
      explanation: values.explanation,
      additionalText: values.additionalText,

      // 진위형
      answersForCorrectAnswerForTrueFalse:
        question?.type === QuestionType.TRUE_FALSE
          ? values.answersForCorrectAnswerForTrueFalse
          : undefined,

      // 단답형
      answersForShortAnswers:
        question?.type === QuestionType.SHORT_ANSWER
          ? values.answersForShortAnswers?.map(ans => ({
              id: ans.id ?? null,
              content: ans.content,
            })) || []
          : [],

      // 연결형
      answersForMatching:
        question?.type === QuestionType.MATCHING
          ? values.answersForMatching?.map(ans => ({
              leftItemId: ans.leftItemId ?? null,
              pairingItemId: ans.pairingItemId ?? null,
              leftItem: ans.leftItem,
              rightItem: ans.rightItem,
            })) || []
          : [],

      // 선다형
      answersForMultipleChoice:
        (question?.type === QuestionType.MULTIPLE_CHOICE ||
          question?.type === QuestionType.MULTIPLE_CHOICE_INPUT)
          ? values.answersForMultipleChoice?.map(ans => ({
              id: ans.id ?? null,
              content: ans.content,
              isCorrect: ans.isCorrect,
            })) || []
          : [],

      // 빈칸 채우기 👈 추가됨
      answersForMultipleShortAnswer:
        question?.type === QuestionType.MULTIPLE_SHORT_ANSWER
          ? values.answersForMultipleShortAnswer?.map((ans, index) => ({
              id: ans.id ?? null,
              content: ans.content,
              orderIndex: ans.orderIndex, // 배열 순서대로 index 부여 (0, 1, 2...)
            })) || []
          : [],

      answersForInterview:
        question?.type === QuestionType.INTERVIEW
          ? values.answersForInterview
          : undefined,
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
            {question.type === QuestionType.INTERVIEW &&
              "면접 질문과 모범 답안을 관리합니다."}
            {question.type === QuestionType.MULTIPLE_SHORT_ANSWER &&
              "빈칸 채우기 문제의 질문과 정답을 관리합니다."}
            {(question.type === QuestionType.MULTIPLE_CHOICE ||
              question.type === QuestionType.MULTIPLE_CHOICE_INPUT) &&
              "선다형 문제의 보기와 정답을 관리합니다."}
            {question.type === QuestionType.TRUE_FALSE &&
              "진위형(O/X) 문제의 정답을 설정합니다."}
            {question.type === QuestionType.MATCHING &&
              "연결형 문제의 보기 쌍을 관리합니다."}
            {question.type === QuestionType.SHORT_ANSWER &&
              "단답형 문제의 정답을 관리합니다."}
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
          {/* 1. 기본 정보 카드 (공통) */}
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
                    {/* 빈칸 채우기일 때만 안내 메시지 표시 */}
                    {question.type === QuestionType.MULTIPLE_SHORT_ANSWER && (
                      <FormDescription className="text-amber-600">
                        💡 빈칸 채우기 문제는{" "}
                        <strong>
                          {"{0}"}, {"{1}"}
                        </strong>
                        과 같이 중괄호와 숫자를 사용하여 빈칸 위치를
                        표시해주세요.
                        <br />
                        예: 대한민국의 수도는 <strong>{"{0}"}</strong>이고,
                        미국의 수도는 <strong>{"{1}"}</strong>이다.
                      </FormDescription>
                    )}
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

          {question.type === QuestionType.INTERVIEW && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="size-5 text-sky-600" />
                  모범 답안 (가이드)
                </CardTitle>
                <CardDescription>
                  학습자가 확인할 수 있는 모범 답안을 작성해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="answersForInterview"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="모범 답안 내용을 입력하세요. (예: 저의 장점은 꼼꼼함이며, 이를 통해 프로젝트의 완성도를 높인 경험이 있습니다...)"
                          className="min-h-[200px] resize-none text-base leading-relaxed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {question.type === QuestionType.MULTIPLE_SHORT_ANSWER && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle>빈칸 정답 관리</CardTitle>
                <CardDescription>
                  제목의 빈칸 번호에 맞춰 정답을 입력해주세요. 같은 번호에 여러
                  정답(유의어)을 추가할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {detectedIndices.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-md border border-dashed">
                    <p>
                      제목에 {"{0}"}, {"{1}"} 형식을 입력하면
                    </p>
                    <p>자동으로 정답 입력란이 나타납니다.</p>
                  </div>
                )}

                {/* 감지된 인덱스별로 그룹화하여 렌더링 */}
                {detectedIndices.map(groupIndex => (
                  <div
                    key={groupIndex}
                    className="rounded-lg border bg-slate-50/50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-10 rounded-md bg-sky-100 text-sky-700 font-bold text-sm border border-sky-200">
                          {"{"}
                          {groupIndex}
                          {"}"}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          번 빈칸 정답
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-sky-600"
                        onClick={() =>
                          appendMultipleShort({
                            id: null,
                            content: "",
                            orderIndex: Number(groupIndex), // 현재 그룹 인덱스로 추가
                          })
                        }
                      >
                        <Plus className="size-3 mr-1" />
                        유의어 추가
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {multipleShortFields.map((field, index) => {
                        // 현재 그룹(orderIndex)에 해당하는 필드만 렌더링
                        if (field.orderIndex !== groupIndex) return null;

                        return (
                          <div
                            key={field.id}
                            className="flex items-center gap-2"
                          >
                            <FormField
                              control={form.control}
                              name={`answersForMultipleShortAnswer.${index}.content`}
                              render={({ field }) => (
                                <FormItem className="flex-1 space-y-0">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="정답 입력"
                                      className="bg-white"
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
                              className="h-9 w-9 text-muted-foreground hover:text-red-500"
                              onClick={() => removeMultipleShort(index)}
                              // 최소 1개는 유지하고 싶다면 disabled 조건 추가 가능
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        );
                      })}
                      {/* 필드가 하나도 없을 때 (삭제했을 경우 등) 메시지 */}
                      {multipleShortFields.filter(
                        f => f.orderIndex === groupIndex
                      ).length === 0 && (
                        <div className="text-xs text-red-500 pl-1">
                          * 정답을 최소 하나 이상 입력해주세요.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 3. 선다형(객관식) UI */}
          {(question.type === QuestionType.MULTIPLE_CHOICE ||
            question.type === QuestionType.MULTIPLE_CHOICE_INPUT) && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex flex-col gap-1">
                  <CardTitle>보기 관리 (선다형)</CardTitle>
                  <CardDescription>
                    보기를 추가하고, <strong>정답인 항목을 체크</strong>
                    해주세요.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    appendMultipleChoice({
                      id: null,
                      content: "",
                      isCorrect: false,
                    })
                  }
                >
                  <Plus className="size-4" /> 보기 추가
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {multipleChoiceFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3">
                    <FormField
                      control={form.control}
                      name={`answersForMultipleChoice.${index}.isCorrect`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-y-0">
                          <FormControl>
                            <div className="flex items-center justify-center w-10 h-10">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="size-5 border-gray-400 data-[state=checked]:bg-green-600"
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`answersForMultipleChoice.${index}.content`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={`보기 ${index + 1}`}
                                className={
                                  form.watch(
                                    `answersForMultipleChoice.${index}.isCorrect`
                                  )
                                    ? "border-green-500 ring-green-500/20 bg-green-50/30"
                                    : ""
                                }
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
                      onClick={() => removeMultipleChoice(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 4. 진위형(True/False) UI */}
          {question.type === QuestionType.TRUE_FALSE && (
            <Card>
              <CardHeader>
                <CardTitle>정답 설정 (진위형)</CardTitle>
                <CardDescription>
                  {"정답이 '참(True)'인지 '거짓(False)'인지 선택해주세요."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="answersForCorrectAnswerForTrueFalse"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={val => field.onChange(val === "true")}
                          value={
                            field.value === true
                              ? "true"
                              : field.value === false
                              ? "false"
                              : undefined
                          }
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                            <FormControl>
                              <RadioGroupItem value="true" />
                            </FormControl>
                            <Label className="font-normal flex items-center gap-2 cursor-pointer w-full">
                              <CheckCircle2 className="text-green-600 size-5" />
                              <span className="font-semibold text-green-700">
                                O (참/True)
                              </span>
                            </Label>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                            <FormControl>
                              <RadioGroupItem value="false" />
                            </FormControl>
                            <Label className="font-normal flex items-center gap-2 cursor-pointer w-full">
                              <XCircle className="text-red-600 size-5" />
                              <span className="font-semibold text-red-700">
                                X (거짓/False)
                              </span>
                            </Label>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* 5. 단답형 UI */}
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

          {/* 6. 연결형 UI */}
          {question.type === QuestionType.MATCHING && (
            <Card>
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
                  <Plus className="size-4" /> 보기 쌍 추가
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {matchingFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col md:flex-row gap-3 p-3 bg-slate-50 rounded-lg md:bg-transparent"
                  >
                    <span className="flex h-10 w-8 shrink-0 items-center justify-center text-sm font-medium bg-white rounded-md border md:border-none shadow-sm md:shadow-none">
                      {index + 1}
                    </span>
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-3 relative">
                      <div className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-50 p-1 rounded-full border">
                        <ArrowRightLeft className="size-3 text-muted-foreground" />
                      </div>
                      <FormField
                        control={form.control}
                        name={`answersForMatching.${index}.leftItem`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} placeholder="왼쪽 항목" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`answersForMatching.${index}.rightItem`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} placeholder="오른쪽 항목" />
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
                      onClick={() => removeMatching(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <UnsavedChangesBar
            isDirty={isDirty}
            onSave={form.handleSubmit(onSubmit, errors =>
              console.log("❌ Validation Error:", errors)
            )}
            onReset={() => form.reset()}
            isSaving={isUpdating}
          />
        </form>
      </Form>

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
