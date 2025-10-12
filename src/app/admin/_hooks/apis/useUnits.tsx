"use client";
import useSWR from "swr";
import { useDebounce } from "@uidotdev/usehooks";
import {
  adminHttp,
  adminHttpSWR,
  BaseResponse,
  PaginationResponse,
} from "@/lib/http/admin-http";
import { useCallback, useState } from "react";
import { GetUnitAdminDto } from "@/lib/http/apis/dtos/admin/question/get-unit.admin.dto";
import { mutate } from "swr";

import { toast } from "sonner";
export interface UseUnitsSearchParams {
  keyword?: string;
  page?: number;
  limit?: number;
}

export function useUnits(searchParams?: UseUnitsSearchParams) {
  const debouncedKeyword = useDebounce(searchParams?.keyword || "", 1000);
  const buildQueryString = (params: UseUnitsSearchParams): string => {
    const queryParams = new URLSearchParams();

    if (params.keyword)
      queryParams.append("keyword", params.keyword.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    return queryParams.toString();
  };

  const debouncedSearchParams = { ...searchParams, keyword: debouncedKeyword };
  const queryString = buildQueryString(debouncedSearchParams);
  const swrKey = queryString ? `/admin/units?${queryString}` : `/admin/units`;

  const { data, isLoading, error, mutate } = useSWR<
    BaseResponse<PaginationResponse<GetUnitAdminDto>>
  >(swrKey, adminHttpSWR, {
    revalidateOnFocus: false,
    dedupingInterval: 1000,
  });

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

export const uesUnitUpdate = (unit: GetUnitAdminDto) => {
  const [updatedUnit, setUpdatedUnit] = useState<GetUnitAdminDto | null>(unit);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const { data } = await adminHttp.put<BaseResponse<GetUnitAdminDto>>(
        `/admin/units/${updatedUnit?.id}`,
        {
          name: updatedUnit?.name,
          isDisplayed: updatedUnit?.isDisplayed,
        }
      );

      if (data.code !== 200) {
        throw new Error(data.message || "능력 단위 수정에 실패했습니다.");
      }

      toast.success("능력 단위가 수정되었습니다.");
      mutate(key => typeof key === "string" && key.startsWith("/admin/units"));

      return data;
    } catch (error) {
      toast.error((error as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleUpdate,
    updatedUnit,
    setUpdatedUnit,
    isLoading,
  };
};
