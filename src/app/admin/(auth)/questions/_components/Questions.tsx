"use client";

import {
  useQuestions,
  UseQuestionsSearchParams,
} from "@/app/admin/_hooks/apis/useQuestions";
import { Pagination, PaginationResultCount } from "@/components/ui/pagination";
import { useQuestionsFilterStore } from "@/lib/store/stores/questions-store";
import { useMemo } from "react";
import { QuestionsFilter } from "./QuestionsFilter";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { QuestionsTable } from "./QuestionsTable";

const Questions = () => {
  const store = useQuestionsFilterStore();

  const apiParams = useMemo(() => {
    const params: UseQuestionsSearchParams = {
      page: store.page,
      limit: store.pageSize,
    };

    if (store.searchQuery.trim()) {
      params.keyword = store.searchQuery.trim();
    }

    if (!store.unitFilter.includes("ALL") && store.unitFilter.length > 0) {
      const unitIds = store.unitFilter.join(",");
      params.unitIds = unitIds;
    }

    return params;
  }, [store.searchQuery, store.unitFilter, store.page, store.pageSize]);

  const { questions, totalCount, isLoading, error } = useQuestions(apiParams);

  return (
    <>
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg">문제 관리</Label>
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

        <QuestionsFilter />
      </div>

      <PaginationResultCount
        isLoading={isLoading}
        error={error}
        totalCount={totalCount}
        currentPage={store.page}
        pageSize={store.pageSize}
      />

      <QuestionsTable
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
