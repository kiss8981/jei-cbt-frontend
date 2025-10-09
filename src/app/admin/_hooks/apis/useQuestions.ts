"use client";
import useSWR from "swr";
import { useDebounce } from "@uidotdev/usehooks";
import {
  adminHttp,
  adminHttpSWR,
  BaseResponse,
  PaginationResponse,
} from "@/lib/http/admin-http";
import { GetQuestionListAdminDto } from "@/lib/http/apis/dtos/admin/question/get-question-list.admin.dto";
import { GetQuestionAdminUnionDto } from "@/lib/http/apis/dtos/admin/question/get-question.admin.dto";
import { useState } from "react";
import { toast } from "sonner";
export interface UseQuestionsSearchParams {
  keyword?: string;
  page?: number;
  limit?: number;
  unitIds?: string;
}

export function useQuestions(searchParams: UseQuestionsSearchParams) {
  const debouncedKeyword = useDebounce(searchParams.keyword || "", 1500);
  const buildQueryString = (params: UseQuestionsSearchParams): string => {
    const queryParams = new URLSearchParams();

    if (params.keyword)
      queryParams.append("keyword", params.keyword.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.unitIds) queryParams.append("unitIds", params.unitIds);

    return queryParams.toString();
  };

  // SWR로 데이터 페칭
  const debouncedSearchParams = { ...searchParams, keyword: debouncedKeyword };
  const queryString = buildQueryString(debouncedSearchParams);
  const swrKey = queryString ? `/admin/questions?${queryString}` : null;

  const { data, isLoading, error, mutate } = useSWR<
    BaseResponse<PaginationResponse<GetQuestionListAdminDto>>
  >(swrKey, adminHttpSWR, {
    revalidateOnFocus: false,
    dedupingInterval: 1000,
  });

  const questions = data?.data?.items || [];
  const totalCount = data?.data?.totalCount || 0;

  return {
    questions,
    totalCount,
    isLoading,
    error,
    refetch: mutate,
  };
}

export const useQuestion = (questionId: number) => {
  const swrKey = questionId ? `/admin/questions/${questionId}` : null;

  const { data, isLoading, error, mutate } = useSWR<
    BaseResponse<GetQuestionAdminUnionDto>
  >(swrKey, adminHttpSWR, {
    revalidateOnFocus: false,
    dedupingInterval: 1000,
  });

  const question = data?.data || null;

  return {
    question,
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useQuestionForEdit = (questionId: number) => {
  const [isLoading, setIsLoading] = useState(false);
  const { refetch } = useQuestion(questionId);

  const handleEdit = async (payload: any) => {
    try {
      setIsLoading(true);
      const { data } = await adminHttp.post<BaseResponse<any>>(
        `/admin/questions/${questionId}/edit`,
        payload
      );

      if (data.code !== 200) {
        throw new Error(data.message || "문제 수정에 실패했습니다.");
      }
      await refetch();

      toast.success("문제가 성공적으로 수정되었습니다.");

      return data;
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleEdit,
  };
};
