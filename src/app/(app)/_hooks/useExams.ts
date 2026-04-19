"use client";

import useSWR from "swr";
import { BaseResponse, httpSWR } from "@/lib/http/http";
import { GetExamTypeAppDto } from "@/lib/http/apis/dtos/app/exam/get-exam-type.app.dto";
import { GetExamAppDto } from "@/lib/http/apis/dtos/app/exam/get-exam.app.dto";

export const useExamTypes = () => {
  const { data, isLoading, error, mutate } = useSWR<
    BaseResponse<GetExamTypeAppDto[]>
  >("/exam-types", httpSWR, {
    revalidateOnFocus: false,
    dedupingInterval: 1000,
  });

  return {
    examTypes: data?.data ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useExams = (type?: string | null) => {
  const swrKey = type ? `/exams?type=${type}` : null;

  const { data, isLoading, error, mutate } = useSWR<BaseResponse<GetExamAppDto[]>>(
    swrKey,
    httpSWR,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000,
    }
  );

  return {
    exams: data?.data ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};
