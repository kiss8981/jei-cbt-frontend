"use client";
import useSWR from "swr";

import { http, BaseResponse } from "@/lib/http/http";

export const useQuestionByUnit = (unitId: number) => {
  const swrKey = `/questions/by-unit/${unitId}`;

  const { data, isLoading, error, mutate } = useSWR<BaseResponse<any>>(
    swrKey,
    http,
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
