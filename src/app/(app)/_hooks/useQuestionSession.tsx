"use client";

import { useEffect, useState, useTransition } from "react";
import { http, BaseResponse } from "@/lib/http/http";
import useAppRouter from "@/hooks/useAppRouter";
import { toast } from "sonner";
import { GetUnitQuestionSessionAppDto } from "@/lib/http/apis/dtos/app/question/get-question-session.app.dto";
import { GetQuestionWithStepAppDto } from "@/lib/http/apis/dtos/app/question/get-question-with-step.app.dto";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import { SubmissionAnswerRequestAppDto } from "@/lib/http/apis/dtos/app/question/submission-answer-request.app.dto";
import { SubmissionAnswerResponseAppDto } from "@/lib/http/apis/dtos/app/question/submission-answer-response.app.dto";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const useQuestionSessionByUnitId = (unitId: number) => {
  const [isLoading, setIsLoading] = useState(false);
  const [questionSession, setQuestionSession] =
    useState<GetUnitQuestionSessionAppDto | null>(null);
  const { navigate } = useAppRouter();

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isPending && questionSession) {
      setIsLoading(false);
    }
  }, [isPending]);

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      const { data } = await http.post<
        BaseResponse<GetUnitQuestionSessionAppDto>
      >(`/questions/sessions/by-unit/${unitId}`);

      if (data.code !== 200) {
        throw new Error(data.message || "문제 세션 생성에 실패했습니다.");
      }

      setQuestionSession(data.data);

      startTransition(() => {
        navigate("push", `/questions/sessions/${data.data.id}`);
      });

      return data;
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleCreate,
  };
};

export const useQuestionSession = (sessionId: number) => {
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState<GetQuestionWithStepAppDto | null>(
    null
  );

  const previousQuestion = async () => {
    const searchParams = new URLSearchParams();
    if (question?.questionMapId) {
      searchParams.append(
        "currentQuestionMapId",
        question?.questionMapId.toString()
      );
    }

    try {
      setIsLoading(true);
      const { data } = await http.get<BaseResponse<GetQuestionWithStepAppDto>>(
        `/questions/sessions/${sessionId}/previous?${searchParams.toString()}`
      );

      if (data.code !== 200) {
        throw new Error(data.message || "이전 문제 불러오기에 실패했습니다.");
      }

      setQuestion(data.data);

      return data;
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const nextQuestion = async () => {
    const searchParams = new URLSearchParams();
    if (question?.questionMapId) {
      searchParams.append(
        "currentQuestionMapId",
        question?.questionMapId.toString()
      );
    }

    try {
      setIsLoading(true);
      const { data } = await http.get<BaseResponse<GetQuestionWithStepAppDto>>(
        `/questions/sessions/${sessionId}/next?${searchParams.toString()}`
      );

      if (data.code !== 200) {
        throw new Error(data.message || "다음 문제 불러오기에 실패했습니다.");
      }

      setQuestion(data.data);

      return data;
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = async () => {
    try {
      setIsLoading(true);
      const { data } = await http.get<BaseResponse<GetQuestionWithStepAppDto>>(
        `/questions/sessions/${sessionId}/current`
      );

      if (data.code !== 200) {
        throw new Error(data.message || "현재 문제 불러오기에 실패했습니다.");
      }

      setQuestion(data.data);

      return data;
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    question,
    nextQuestion,
    currentQuestion,
    previousQuestion,
  };
};

export const useQuestionSessionAnswer = () => {
  const { navigate } = useAppRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    question: questionMap,
    session,
    isFirstQuestion,
    previousQuestion,
    nextQuestion,
    hasMoreQuestions,
  } = useQuestionSessionStore(state => state);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [result, setResult] = useState<SubmissionAnswerResponseAppDto | null>(
    null
  );

  const handleNext = async () => {
    setIsResultOpen(false);
    nextQuestion();
  };

  const submit = async (payload: SubmissionAnswerRequestAppDto) => {
    try {
      setIsLoading(true);
      const { data } = await http.post<
        BaseResponse<SubmissionAnswerResponseAppDto>
      >(
        `/questions/sessions/${session.id}/submit/${questionMap?.questionMapId}`,
        payload
      );

      if (data.code !== 200) {
        throw new Error(data.message || "문제 답변 제출에 실패했습니다.");
      }

      switch (session.type) {
        case "UNIT":
        case "ALL":
          setResult(data.data);
          setIsResultOpen(true);
          break;
        case "MOCK":
          nextQuestion();
          break;
        default:
          throw new Error("알 수 없는 세션 타입입니다.");
      }

      return data;
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const ResultDialog = () => {
    const correct = result?.isCorrect ?? false;

    return (
      <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle
              className={correct ? "text-green-600" : "text-red-600"}
            >
              {correct ? "정답입니다 🎉" : "오답입니다 😥"}
            </DialogTitle>
            <DialogDescription>
              {correct
                ? "잘하셨어요! 아래 해설을 확인해보세요."
                : "아쉽지만, 다음 기회에 도전해보세요!"}
            </DialogDescription>
          </DialogHeader>

          {/* 정오표 및 해설 블록 */}
          <div className="space-y-4">
            {result?.answer && (
              <div className="rounded-xl border p-3 text-sm">
                {result?.answer && (
                  <>
                    <div className="items-start justify-between flex flex-col">
                      <span className="text-muted-foreground">정답</span>
                      <span className="font-semibold mt-1 break-keep">
                        {result.answer}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {result?.explanation && (
              <div className="rounded-xl bg-muted p-4 text-sm leading-relaxed">
                <div className="font-semibold mb-1">해설</div>
                <p className="whitespace-pre-wrap">{result.explanation}</p>
              </div>
            )}
          </div>

          {!hasMoreQuestions && (
            <div className="text-sm text-muted-foreground text-center mt-2">
              마지막 문제입니다. 첫 화면으로 돌아갑니다.
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-3">
            {!hasMoreQuestions ? (
              <Button
                variant="outline"
                onClick={() => {
                  navigate("reset", "/", "(tabs)");
                }}
              >
                홈으로 돌아가기
              </Button>
            ) : (
              <Button onClick={handleNext}>다음 문제</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return {
    isLoading,
    submit,
    ResultDialog,
  };
};
