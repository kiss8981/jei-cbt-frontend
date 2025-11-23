"use client";

import { useQuestionSessions } from "@/app/admin/_hooks/apis/useQuestionSessions";
import { Pagination, PaginationResultCount } from "@/components/ui/pagination";
import { useQuestionsFilterStore } from "@/lib/store/stores/questions-store";
import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import LearnRecordsFilter from "./LearnRecordsFilter";
import { UseQuestionSessionsSearchParams } from "@/app/admin/_hooks/apis/useQuestionSessions";
import { LearnRecordsTable } from "./LearnRecordsTable";

const Questions = () => {
  const store = useQuestionsFilterStore();

  const apiParams = useMemo(() => {
    const params: UseQuestionSessionsSearchParams = {
      page: store.page,
      limit: store.pageSize,
    };

    if (store.searchQuery.trim()) {
      params.keyword = store.searchQuery.trim();
    }

    return params;
  }, [store.searchQuery, store.unitFilter, store.page, store.pageSize]);

  const { questions, totalCount, isLoading, error } =
    useQuestionSessions(apiParams);

  return (
    <>
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg">학습 관리</Label>
          <div className="flex ml-auto gap-2">
            <Button
              type="button"
              size="default"
              onClick={store.clearAll}
              variant="ghost"
              className="rounded-xl bg-neutral-200 text-black hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              초기화
            </Button>
          </div>
        </div>

        <LearnRecordsFilter />
      </div>

      <PaginationResultCount
        isLoading={isLoading}
        error={error}
        totalCount={totalCount}
        currentPage={store.page}
        pageSize={store.pageSize}
      />

      <LearnRecordsTable
        items={questions}
        isLoading={isLoading}
        pageNum={store.page}
        perPage={store.pageSize}
      />

      <Pagination
        totalCount={totalCount}
        isLoading={isLoading}
        useStore={useQuestionsFilterStore}
      />
    </>
  );
};

export default Questions;
