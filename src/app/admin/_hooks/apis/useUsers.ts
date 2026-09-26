"use client";

import useSWR from "swr";
import { useDebounce } from "@uidotdev/usehooks";
import {
  adminHttpSWR,
  BaseResponse,
  PaginationResponse,
} from "@/lib/http/admin-http";
import { GetUserListAdminDto } from "@/lib/http/apis/dtos/admin/user/get-user-list.admin.dto";

export interface UseUsersSearchParams {
  keyword?: string;
  page?: number;
  limit?: number;
}

export function useUsers(searchParams: UseUsersSearchParams) {
  const keyword = useDebounce(searchParams.keyword || "", 700);
  const params = new URLSearchParams();
  if (keyword) params.set("keyword", keyword);
  if (searchParams.page) params.set("page", String(searchParams.page));
  if (searchParams.limit) params.set("limit", String(searchParams.limit));
  const key = `/admin/users?${params.toString()}`;
  const { data, isLoading, error } = useSWR<
    BaseResponse<PaginationResponse<GetUserListAdminDto>>
  >(key, adminHttpSWR, { revalidateOnFocus: false });

  return {
    users: data?.data?.items ?? [],
    totalCount: data?.data?.totalCount ?? 0,
    isLoading,
    error,
  };
}
