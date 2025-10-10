"use client";
import useSWR from "swr";

import { adminHttpSWR, BaseResponse } from "@/lib/http/admin-http";

export const useQuestionByUnit = (unitId: number) => {
  const swrKey = `/questions/by-unit/${unitId}`;

  const { data, isLoading, error, mutate } = useSWR<BaseResponse<any>>(
    swrKey,
    adminHttpSWR,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000,
    }
  );

  const question = data?.data || null;

  return {
    question,
    isLoading,
    error,
    refetch: mutate,
  };
};
