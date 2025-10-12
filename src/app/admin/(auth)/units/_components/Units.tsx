"use client";

import {
  useQuestions,
  UseQuestionsSearchParams,
} from "@/app/admin/_hooks/apis/useQuestions";
import { Pagination, PaginationResultCount } from "@/components/ui/pagination";
import { useMemo } from "react";
import { UnitsFilter } from "./UnitsFilter";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UnitsTable } from "./UnitsTable";
import { useUnitsFilterStore } from "@/lib/store/stores/units-store";
import { useUnits } from "@/app/admin/_hooks/apis/useUnits";

const Units = () => {
  const store = useUnitsFilterStore();

  const apiParams = useMemo(() => {
    const params: UseQuestionsSearchParams = {
      page: store.page,
      limit: store.pageSize,
    };

    if (store.searchQuery.trim()) {
      params.keyword = store.searchQuery.trim();
    }

    return params;
  }, [store.searchQuery, store.page, store.pageSize]);

  const { units, totalCount, isLoading, error } = useUnits(apiParams);

  return (
    <>
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg">능력 단위 관리</Label>
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

        <UnitsFilter />
      </div>

      <PaginationResultCount
        isLoading={isLoading}
        error={error}
        totalCount={totalCount}
        currentPage={store.page}
        pageSize={store.pageSize}
      />

      <UnitsTable
        items={units}
        isLoading={isLoading}
        pageNum={store.page}
        perPage={store.pageSize}
      />

      <Pagination
        totalCount={totalCount}
        isLoading={isLoading}
        useStore={useUnitsFilterStore}
      />
    </>
  );
};

export default Units;
