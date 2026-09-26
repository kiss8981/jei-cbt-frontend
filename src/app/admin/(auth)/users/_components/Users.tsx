"use client";

import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationResultCount } from "@/components/ui/pagination";
import { useUsers } from "@/app/admin/_hooks/apis/useUsers";
import { useUsersFilterStore } from "@/lib/store/stores/users-store";
import { UsersFilter } from "./UsersFilter";
import { UsersTable } from "./UsersTable";

export default function Users() {
  const store = useUsersFilterStore();
  const params = useMemo(
    () => ({
      page: store.page,
      limit: store.pageSize,
      keyword: store.searchQuery.trim() || undefined,
    }),
    [store.page, store.pageSize, store.searchQuery]
  );
  const { users, totalCount, isLoading, error } = useUsers(params);

  return (
    <>
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg">회원 관리</Label>
          <Button
            type="button"
            onClick={store.clearAll}
            variant="ghost"
            className="rounded-xl bg-neutral-200 text-black hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            초기화
          </Button>
        </div>
        <UsersFilter />
      </div>
      <PaginationResultCount
        isLoading={isLoading}
        error={error}
        totalCount={totalCount}
        currentPage={store.page}
        pageSize={store.pageSize}
      />
      <UsersTable items={users} isLoading={isLoading} />
      <Pagination
        totalCount={totalCount}
        isLoading={isLoading}
        useStore={useUsersFilterStore}
      />
    </>
  );
}
