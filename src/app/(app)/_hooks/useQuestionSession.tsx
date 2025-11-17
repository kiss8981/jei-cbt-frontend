"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { http, BaseResponse } from "@/lib/http/http";
import useAppRouter from "@/hooks/useAppRouter";
import { toast } from "sonner";
import {
  GetQuestionSessionAppDtoUnion,
  GetUnitQuestionSessionAppDto,
} from "@/lib/http/apis/dtos/app/question/get-question-session.app.dto";
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
import { GetQuestionSessionResultAppDto } from "@/lib/http/apis/dtos/app/question/get-question-session-result.app.dto";
import { QuestionType } from "@/lib/http/apis/dtos/common/question-type.enum";

export const useQuestionSessionByUnitId = () => {
  const [unitId, setUnitId] = useState<number | null>(null);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
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
      >(
        `/questions/sessions/by-unit/${unitId}?questionTypes=${
          questionTypes ? questionTypes.join(",") : ""
        }`
      );

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
    setUnitId,
    setQuestionTypes,
    unitId,
    questionTypes,
  };
};

export const useLastQuestionSession = () => {
  const [lastSession, setLastSession] =
    useState<GetQuestionSessionAppDtoUnion | null>(null);
  const { navigate } = useAppRouter();

  useEffect(() => {
    fetchLastSession();
  }, []);

  const LastSessionDialog = () => {
    return (
      <Dialog open={!!lastSession} onOpenChange={() => setLastSession(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-green-600">
              마지막으로 풀던 문제가 있습니다 🎉
            </DialogTitle>
            <DialogDescription>이어서 풀어보시겠어요?</DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-3 grid grid-cols-2">
            <Button
              variant="outline"
              onClick={() => {
                setLastSession(null);
              }}
            >
              취소
            </Button>
            <Button
              onClick={() => {
                navigate("push", `/questions/sessions/${lastSession?.id}`);
              }}
            >
              이어서 풀기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const fetchLastSession = async () => {
    try {
      const { data } = await http.get<
        BaseResponse<GetQuestionSessionAppDtoUnion>
      >(`/questions/sessions/latest`);

      if (data.code !== 200) {
        throw new Error(
          data.message || "마지막 문제 세션 불러오기에 실패했습니다."
        );
      }

      setLastSession(data.data);

      return data;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return {
    lastSession,
    LastSessionDialog,
  };
};

export const useQuestionSessionByAll = (unidIds: number[]) => {
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useAppRouter();

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      const { data } = await http.post<
        BaseResponse<GetUnitQuestionSessionAppDto>
      >(`/questions/sessions/by-all`, {
        unitIds: unidIds.map(id => Number(id)),
      });

      if (data.code !== 200) {
        throw new Error(data.message || "문제 세션 생성에 실패했습니다.");
      }

      navigate("push", `/questions/sessions/${data.data.id}`);

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

export const useQuestionSessionByMock = () => {
  const [count, setCount] = useState(20);
  const [unitIds, setUnitIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useAppRouter();

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      const { data } = await http.post<
        BaseResponse<GetUnitQuestionSessionAppDto>
      >(`/questions/sessions/by-mock`, {
        type: "UNIT",
        unitIds: unitIds.map(id => Number(id)),
        count,
      });

      if (data.code !== 200) {
        throw new Error(data.message || "문제 세션 생성에 실패했습니다.");
      }

      navigate("push", `/questions/sessions/${data.data.id}`);

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
    setUnitIds,
    setCount,
    count,
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

  const [mockEndDialogOpen, setMockEndDialogOpen] = useState(false);

  const [result, setResult] = useState<SubmissionAnswerResponseAppDto | null>(
    null
  );

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
          if (!hasMoreQuestions) {
            setIsResultOpen(true);
            break;
          }
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

  return {
    isLoading,
    submit,
    result,
    isResultOpen,
    setIsResultOpen,
  };
};

export const useQuestionSessionResult = (sessionId: number) => {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<GetQuestionSessionResultAppDto | null>(
    null
  );

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      setIsLoading(true);
      const { data } = await http.get<
        BaseResponse<GetQuestionSessionResultAppDto>
      >(`/questions/sessions/${sessionId}/result`);

      if (data.code !== 200) {
        throw new Error(
          data.message || "문제 세션 결과 불러오기에 실패했습니다."
        );
      }

      setResult(data.data);

      return data;
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    result,
    fetchResult,
  };
};
