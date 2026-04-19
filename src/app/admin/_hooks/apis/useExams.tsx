"use client";

import useSWR, { mutate } from "swr";
import {
  adminHttp,
  adminHttpSWR,
  BaseResponse,
  PaginationResponse,
} from "@/lib/http/admin-http";
import { GetExamAdminDto } from "@/lib/http/apis/dtos/admin/exam/get-exam.admin.dto";
import { CreateExamAdminDto } from "@/lib/http/apis/dtos/admin/exam/create-exam.admin.dto";
import { UpdateExamAdminDto } from "@/lib/http/apis/dtos/admin/exam/update-exam.admin.dto";
import { useState } from "react";
import { toast } from "sonner";

export interface UseExamsSearchParams {
  page?: number;
  limit?: number;
  keyword?: string;
  type?: string;
}

export function useExams(searchParams?: UseExamsSearchParams) {
  const params = new URLSearchParams();

  if (searchParams?.page) params.append("page", searchParams.page.toString());
  if (searchParams?.limit) params.append("limit", searchParams.limit.toString());
  if (searchParams?.keyword) params.append("keyword", searchParams.keyword);
  if (searchParams?.type) params.append("type", searchParams.type);

  const queryString = params.toString();
  const swrKey = queryString ? `/admin/exams?${queryString}` : "/admin/exams";

  const { data, isLoading, error, mutate: refetch } = useSWR<
    BaseResponse<PaginationResponse<GetExamAdminDto>>
  >(swrKey, adminHttpSWR, {
    revalidateOnFocus: false,
    dedupingInterval: 1000,
  });

  return {
    exams: data?.data?.items ?? [],
    totalCount: data?.data?.totalCount ?? 0,
    isLoading,
    error,
    refetch,
  };
}

export const useCreateExam = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (payload: CreateExamAdminDto) => {
    try {
      setIsLoading(true);
      const { data } = await adminHttp.post<BaseResponse<GetExamAdminDto>>(
        "/admin/exams",
        payload
      );

      if (data.code !== 200) {
        throw new Error(data.message || "시험 등록에 실패했습니다.");
      }

      toast.success("시험이 등록되었습니다.");
      mutate(key => typeof key === "string" && key.startsWith("/admin/exams"));
      mutate(key => typeof key === "string" && key.startsWith("/admin/units"));
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

export const useUpdateExam = (exam: GetExamAdminDto) => {
  const [updatedExam, setUpdatedExam] = useState<GetExamAdminDto>(exam);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (payload?: UpdateExamAdminDto) => {
    try {
      setIsLoading(true);
      const request = payload ?? {
        type: updatedExam.typeValue,
        title: updatedExam.title,
        isDisplayed: updatedExam.isDisplayed,
      };

      const { data } = await adminHttp.put<BaseResponse<GetExamAdminDto>>(
        `/admin/exams/${exam.id}`,
        request
      );

      if (data.code !== 200) {
        throw new Error(data.message || "시험 수정에 실패했습니다.");
      }

      toast.success("시험이 수정되었습니다.");
      mutate(key => typeof key === "string" && key.startsWith("/admin/exams"));
      mutate(key => typeof key === "string" && key.startsWith("/admin/units"));
      return data;
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updatedExam,
    setUpdatedExam,
    handleUpdate,
    isLoading,
  };
};
