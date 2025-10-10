"use client";
import useSWR from "swr";
import { BaseResponse } from "@/lib/http/admin-http";
import { useDebounce } from "@uidotdev/usehooks";
import { httpSWR } from "@/lib/http/http";
import { GetUnitListQueryAppDto } from "@/lib/http/apis/dtos/app/unit/get-unit-list-query.app.dto";

export const useUnits = (searchParams: GetUnitListQueryAppDto) => {
  const debouncedKeyword = useDebounce(searchParams.keyword || "", 1500);
  const buildQueryString = (params: GetUnitListQueryAppDto): string => {
    const queryParams = new URLSearchParams();

    if (params.keyword)
      queryParams.append("keyword", params.keyword.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    return queryParams.toString();
  };

  const debouncedSearchParams = { ...searchParams, keyword: debouncedKeyword };
  const queryString = buildQueryString(debouncedSearchParams);
  const swrKey = queryString ? `/units?${queryString}` : `/units`;

  const { data, isLoading, error, mutate } = useSWR<BaseResponse<any>>(
    swrKey,
    httpSWR,
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
};
