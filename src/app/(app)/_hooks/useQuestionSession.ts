"use client";

import { useEffect, useState, useTransition } from "react";
import { http, BaseResponse } from "@/lib/http/http";
import useAppRouter from "@/hooks/useAppRouter";
import { toast } from "sonner";
import { GetUnitQuestionSessionAppDto } from "@/lib/http/apis/dtos/app/question/get-question-session.app.dto";
import { GetQuestionWithStepAppDto } from "@/lib/http/apis/dtos/app/question/get-question-with-step.app.dto";

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
  };
};

export const useQuestionSessionAnswer = (
  sessionId: number,
  questionSesstionMapId: number
) => {
  const [isLoading, setIsLoading] = useState(false);

  const answer = async (payload: { answer: string }) => {
    try {
      setIsLoading(true);
      const { data } = await http.post<BaseResponse<any>>(
        `/questions/sessions/${sessionId}/submit/${questionSesstionMapId}`,
        payload
      );

      if (data.code !== 200) {
        throw new Error(data.message || "문제 답변 제출에 실패했습니다.");
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
    answer,
  };
};
