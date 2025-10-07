"use client";
import useSWR from "swr";
import { useDebounce } from "@uidotdev/usehooks";
import { adminHttpSWR, BaseResponse } from "@/lib/http/admin-http";
export interface UseUnitsSearchParams {
  keyword?: string;
  page?: number;
  limit?: number;
}

export function useUnits(keyword?: string) {
  const debouncedKeyword = useDebounce(keyword || "", 1500);
  const buildQueryString = (params: UseUnitsSearchParams): string => {
    const queryParams = new URLSearchParams();

    if (params.keyword)
      queryParams.append("keyword", params.keyword.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    return queryParams.toString();
  };

  const debouncedSearchParams = { keyword: debouncedKeyword };
  const queryString = buildQueryString(debouncedSearchParams);
  const swrKey = queryString ? `/admin/units?${queryString}` : null;

  const { data, isLoading, error, mutate } = useSWR<BaseResponse<any>>(
    swrKey,
    adminHttpSWR,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000,
    }
  );

  const units = data?.data?.items || [];
  const totalCount = data?.data?.totalCount || 0;

  return {
    units,
    totalCount,
    isLoading,
    error,
    refetch: mutate,
  };
}
