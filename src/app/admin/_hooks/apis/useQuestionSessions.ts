"use client";
import useSWR from "swr";
import { useDebounce } from "@uidotdev/usehooks";
import {
  adminHttpSWR,
  BaseResponse,
  PaginationResponse,
} from "@/lib/http/admin-http";
import { GetQuestionSessionListAdminDto } from "@/lib/http/apis/dtos/admin/question/get-question-session-list.admin.dto";
export interface UseQuestionSessionsSearchParams {
  keyword?: string;
  page?: number;
  limit?: number;
}

export function useQuestionSessions(
  searchParams: UseQuestionSessionsSearchParams
) {
  const debouncedKeyword = useDebounce(searchParams.keyword || "", 1500);
  const buildQueryString = (
    params: UseQuestionSessionsSearchParams
  ): string => {
    const queryParams = new URLSearchParams();

    if (params.keyword)
      queryParams.append("keyword", params.keyword.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    return queryParams.toString();
  };

  // SWR로 데이터 페칭
  const debouncedSearchParams = { ...searchParams, keyword: debouncedKeyword };
  const queryString = buildQueryString(debouncedSearchParams);
  const swrKey = queryString
    ? `/admin/questions/sessions?${queryString}`
    : null;

  const { data, isLoading, error, mutate } = useSWR<
    BaseResponse<PaginationResponse<GetQuestionSessionListAdminDto>>
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
