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
import { UpdateQuestionAdminDto } from "@/lib/http/apis/dtos/admin/question/update-question.admin.dto";
export interface UseQuestionsSearchParams {
  keyword?: string;
  page?: number;
  limit?: number;
  unitIds?: string;
  questionTypes?: string;
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
    if (params.questionTypes)
      queryParams.append("questionTypes", params.questionTypes);

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
export const useQuestionUpdate = (questionId: number) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { refetch } = useQuestion(questionId);

  const handleEdit = async (
    payload: UpdateQuestionAdminDto
  ): Promise<boolean> => {
    try {
      setIsUpdating(true);

      const { data } = await adminHttp.put<BaseResponse<any>>(
        `/admin/questions/${questionId}`,
        payload
      );

      if (data.code !== 200) {
        throw new Error(data.message || "문제 수정에 실패했습니다.");
      }

      // 데이터 갱신
      await refetch();

      toast.success("문제가 성공적으로 수정되었습니다.");
      return true; // 성공 시 true 반환
    } catch (error: any) {
      // 에러 메시지 추출 로직 강화
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "알 수 없는 오류가 발생했습니다.";
      toast.error(errorMessage);
      return false; // 실패 시 false 반환
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating, // isLoading 대신 구체적인 명칭 사용
    handleEdit,
  };
};
