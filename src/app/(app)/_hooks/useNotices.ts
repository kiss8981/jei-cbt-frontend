"use client";

import useSWR from "swr";
import { BaseResponse, httpSWR } from "@/lib/http/http";
import { PaginationResponse } from "@/lib/http/admin-http";
import { NoticeDetail, NoticeSummary } from "@/types/notice";

export function useNotices(params: { page: number; limit: number; keyword?: string }) {
  const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.keyword) query.set("keyword", params.keyword);
  const { data, error, isLoading } = useSWR<
    BaseResponse<PaginationResponse<NoticeSummary>>
  >(`/notices?${query}`, httpSWR);
  return {
    notices: data?.data?.items ?? [], totalCount: data?.data?.totalCount ?? 0,
    error: error ?? (data && data.code !== 200 ? new Error(data.message) : null),
    isLoading,
  };
}

export function useNotice(id: number) {
  const { data, error, isLoading } = useSWR<BaseResponse<NoticeDetail>>(
    Number.isFinite(id) ? `/notices/${id}` : null,
    httpSWR
  );
  return {
    notice: data?.code === 200 ? data.data : null,
    error: error ?? (data && data.code !== 200 ? new Error(data.message) : null),
    isLoading,
  };
}
