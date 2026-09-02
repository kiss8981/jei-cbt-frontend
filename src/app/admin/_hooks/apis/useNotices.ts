"use client";

import useSWR from "swr";
import {
  adminHttp,
  adminHttpSWR,
  BaseResponse,
  PaginationResponse,
} from "@/lib/http/admin-http";
import {
  NoticeDetail,
  NoticeSummary,
  NoticeWritePayload,
} from "@/types/notice";

export function useAdminNotices(params: {
  page: number;
  limit: number;
  keyword?: string;
  isPublished?: boolean;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.keyword) query.set("keyword", params.keyword);
  if (typeof params.isPublished === "boolean") {
    query.set("isPublished", String(params.isPublished));
  }
  const key = `/admin/notices?${query}`;
  const { data, error, isLoading, mutate } = useSWR<
    BaseResponse<PaginationResponse<NoticeSummary>>
  >(key, adminHttpSWR);

  return {
    notices: data?.data?.items ?? [],
    totalCount: data?.data?.totalCount ?? 0,
    error: error ?? (data && data.code !== 200 ? new Error(data.message) : null),
    isLoading,
    mutate,
  };
}

export async function getAdminNotice(id: number) {
  const { data } = await adminHttp.get<BaseResponse<NoticeDetail>>(
    `/admin/notices/${id}`
  );
  if (data.code !== 200) throw new Error(data.message);
  return data.data;
}

export async function createAdminNotice(payload: NoticeWritePayload) {
  const { data } = await adminHttp.post<BaseResponse<NoticeDetail>>(
    "/admin/notices",
    payload
  );
  if (data.code !== 200) throw new Error(data.message);
  return data.data;
}

export async function updateAdminNotice(
  id: number,
  payload: NoticeWritePayload
) {
  const { data } = await adminHttp.put<BaseResponse<NoticeDetail>>(
    `/admin/notices/${id}`,
    payload
  );
  if (data.code !== 200) throw new Error(data.message);
  return data.data;
}

export async function deleteAdminNotice(id: number) {
  const { data } = await adminHttp.delete<BaseResponse<{ success: boolean }>>(
    `/admin/notices/${id}`
  );
  if (data.code !== 200) throw new Error(data.message);
  return data.data;
}
