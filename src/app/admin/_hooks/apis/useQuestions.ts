"use client";
import useSWR from "swr";
import { useDebounce } from "@uidotdev/usehooks";
import { adminHttpSWR, BaseResponse } from "@/lib/http/admin-http";
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

  const { data, isLoading, error, mutate } = useSWR<BaseResponse<any>>(
    swrKey,
    adminHttpSWR,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000,
    }
  );

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
