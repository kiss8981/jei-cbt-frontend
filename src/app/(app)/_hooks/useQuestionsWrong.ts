import { PaginationResponse } from "@/lib/http/admin-http";
import { GetWrongQuestionListQueryAppDto } from "@/lib/http/apis/dtos/app/question/get-wrong-question-list-query.app.dto";
import { GetWrongQuestionListAppDto } from "@/lib/http/apis/dtos/app/question/get-wrong-question-list.app.dto";
import { GetWrongQuestionAppDto } from "@/lib/http/apis/dtos/app/question/get-wrong-question.app.dto";
import { SubmissionAnswerRequestAppDto } from "@/lib/http/apis/dtos/app/question/submission-answer-request.app.dto";
import { SubmissionAnswerResponseAppDto } from "@/lib/http/apis/dtos/app/question/submission-answer-response.app.dto";
import { BaseResponse, http, httpSWR } from "@/lib/http/http";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

export const useQuestionsWrong = (
  searchParams: GetWrongQuestionListQueryAppDto
) => {
  const buildQueryString = (
    params: GetWrongQuestionListQueryAppDto
  ): string => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.sortType)
      queryParams.append("sortType", params.sortType.toString());

    return queryParams.toString();
  };
  const queryString = buildQueryString(searchParams);
  const swrKey = `/questions/wrongs?${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    BaseResponse<PaginationResponse<GetWrongQuestionListAppDto>>
  >(swrKey, httpSWR, {
    refreshInterval: 5,
  });

  const wrongQuestions = data?.data?.items || [];
  const totalCount = data?.data?.totalCount || 0;

  return {
    wrongQuestions,
    totalCount,
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useQuestionWrong = (id: number) => {
  const swrKey = `/questions/wrongs/${id}`;

  const { data, error, isLoading, mutate } = useSWR<
    BaseResponse<GetWrongQuestionAppDto>
  >(swrKey, httpSWR);

  const wrongQuestion = data?.data || null;

  return {
    wrongQuestion,
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useQuestionWrongAnswer = (wrongId: number) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [result, setResult] = useState<SubmissionAnswerResponseAppDto | null>(
    null
  );
  const { mutate } = useSWRConfig();

  const submit = async (payload: SubmissionAnswerRequestAppDto) => {
    try {
      setIsLoading(true);
      const { data } = await http.post<
        BaseResponse<SubmissionAnswerResponseAppDto>
      >(`/questions/wrongs/${wrongId}/review`, payload);

      if (data.code !== 200) {
        throw new Error(data.message || "문제 답변 제출에 실패했습니다.");
      }
      mutate(
        key =>
          typeof key === "string" && key.startsWith("/questions/wrongs?page=1"),
        undefined,
        { revalidate: true }
      );
      setResult(data.data);
      setIsResultOpen(true);

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
