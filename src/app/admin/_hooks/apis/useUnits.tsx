"use client";

import useSWR, { mutate } from "swr";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import {
  adminHttp,
  adminHttpSWR,
  BaseResponse,
  PaginationResponse,
} from "@/lib/http/admin-http";
import { GetUnitAdminDto } from "@/lib/http/apis/dtos/admin/question/get-unit.admin.dto";
import { toast } from "sonner";

export interface UseUnitsSearchParams {
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface CreateUnitPayload {
  name: string;
  examIds: number[];
}

const revalidateUnits = () =>
  mutate(key => typeof key === "string" && key.startsWith("/admin/units"));

export function useUnits(searchParams?: UseUnitsSearchParams) {
  const debouncedKeyword = useDebounce(searchParams?.keyword || "", 1000);

  const buildQueryString = (params: UseUnitsSearchParams): string => {
    const queryParams = new URLSearchParams();

    if (params.keyword) queryParams.append("keyword", params.keyword.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    return queryParams.toString();
  };

  const debouncedSearchParams = { ...searchParams, keyword: debouncedKeyword };
  const queryString = buildQueryString(debouncedSearchParams);
  const swrKey = queryString ? `/admin/units?${queryString}` : `/admin/units`;

  const { data, isLoading, error, mutate: refetch } = useSWR<
    BaseResponse<PaginationResponse<GetUnitAdminDto>>
  >(swrKey, adminHttpSWR, {
    revalidateOnFocus: false,
    dedupingInterval: 1000,
  });

  return {
    units: data?.data?.items ?? [],
    totalCount: data?.data?.totalCount ?? 0,
    isLoading,
    error,
    refetch,
  };
}

export const useCreateUnit = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (payload: CreateUnitPayload) => {
    try {
      setIsLoading(true);
      const { data } = await adminHttp.post<BaseResponse<GetUnitAdminDto>>(
        "/admin/units",
        payload
      );

      if (data.code !== 200) {
        throw new Error(data.message || "능력단위 등록에 실패했습니다.");
      }

      toast.success("능력단위가 등록되었습니다.");
      revalidateUnits();

      return data;
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleCreate,
    isLoading,
  };
};

export const useUnitUpdate = (unit: GetUnitAdminDto) => {
  const [updatedUnit, setUpdatedUnit] = useState<GetUnitAdminDto | null>(unit);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUpdatedUnit(unit);
  }, [unit]);

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const { data } = await adminHttp.put<BaseResponse<GetUnitAdminDto>>(
        `/admin/units/${updatedUnit?.id}`,
        {
          name: updatedUnit?.name,
          isDisplayed: updatedUnit?.isDisplayed,
          examIds: updatedUnit?.examIds ?? [],
        }
      );

      if (data.code !== 200) {
        throw new Error(data.message || "능력단위 수정에 실패했습니다.");
      }

      setUpdatedUnit(data.data);
      toast.success("능력단위가 수정되었습니다.");
      revalidateUnits();

      return data;
    } catch (error) {
      toast.error((error as Error).message);
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

export const useDeleteUnit = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (unitId: number) => {
    try {
      setIsLoading(true);
      const { data } = await adminHttp.delete<BaseResponse<boolean>>(
        `/admin/units/${unitId}`
      );

      if (data.code !== 200) {
        throw new Error(data.message || "능력단위 삭제에 실패했습니다.");
      }

      toast.success("능력단위가 삭제되었습니다.");
      revalidateUnits();

      return data;
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleDelete,
    isLoading,
  };
};
