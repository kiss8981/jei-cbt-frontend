"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationResultCount } from "@/components/ui/pagination";
import { useExams } from "@/app/admin/_hooks/apis/useExams";
import { useExamsFilterStore } from "@/lib/store/stores/exams-store";
import { ExamsFilter } from "./ExamsFilter";
import { ExamsTable } from "./ExamsTable";
import { ExamCreateModal } from "./ExamCreateModal";

const Exams = () => {
  const store = useExamsFilterStore();
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const apiParams = useMemo(() => {
    const params: {
      page: number;
      limit: number;
      keyword?: string;
      type?: string;
    } = {
      page: store.page,
      limit: store.pageSize,
    };

    if (store.searchQuery.trim()) {
      params.keyword = store.searchQuery.trim();
    }

    if (store.typeFilter !== "ALL") {
      params.type = store.typeFilter;
    }

    return params;
  }, [store.page, store.pageSize, store.searchQuery, store.typeFilter]);

  const { exams, totalCount, isLoading, error } = useExams(apiParams);

  return (
    <>
      <ExamCreateModal
        open={openCreateModal}
        onOpenChange={setOpenCreateModal}
      />

      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg">시험 관리</Label>
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              size="default"
              onClick={() => setOpenCreateModal(true)}
              variant="outline"
              className="rounded-xl"
            >
              시험 등록
            </Button>
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

        <ExamsFilter />
      </div>

      <PaginationResultCount
        isLoading={isLoading}
        error={error}
        totalCount={totalCount}
        currentPage={store.page}
        pageSize={store.pageSize}
      />

      <ExamsTable items={exams} isLoading={isLoading} />

      <Pagination
        totalCount={totalCount}
        isLoading={isLoading}
        useStore={useExamsFilterStore}
      />
    </>
  );
};

export default Exams;
