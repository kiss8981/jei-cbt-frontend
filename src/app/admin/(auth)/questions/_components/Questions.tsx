"use client";

import {
  useQuestions,
  UseQuestionsSearchParams,
} from "@/app/admin/_hooks/apis/useQuestions";
import { Pagination, PaginationResultCount } from "@/components/ui/pagination";
import { useQuestionsFilterStore } from "@/lib/store/stores/questions-store";
import { useEffect, useMemo, useState } from "react";
import { QuestionsFilter } from "./QuestionsFilter";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { QuestionsTable } from "./QuestionsTable";
import { QuestionExcel } from "./QuestionExcel";
import { QuestionBulkDelete } from "./QuestionBulkDelete";
import { GetQuestionListAdminDto } from "@/lib/http/apis/dtos/admin/question/get-question-list.admin.dto";
import { toast } from "sonner";

const Questions = () => {
  const store = useQuestionsFilterStore();
  const [selected, setSelected] = useState<Record<string, GetQuestionListAdminDto>>({});
  const selectionScope = JSON.stringify([store.searchQuery, store.unitFilter, store.questionTypeFilter]);
  useEffect(() => setSelected({}), [selectionScope]);

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

    if (store.questionTypeFilter && store.questionTypeFilter.length > 0) {
      params.questionTypes = store.questionTypeFilter.join(",");
    }

    return params;
  }, [
    store.searchQuery,
    store.unitFilter,
    store.page,
    store.pageSize,
    store.questionTypeFilter,
  ]);

  const { questions, totalCount, isLoading, error } = useQuestions(apiParams);
  const toggle = (item: GetQuestionListAdminDto) => {
    const id = String(item.id);
    if (!selected[id] && Object.keys(selected).length >= 500) { toast.error("한 번에 최대 500개를 선택할 수 있습니다."); return; }
    setSelected(current => { const next = { ...current }; if (next[id]) delete next[id]; else next[id] = item; return next; });
  };
  const togglePage = () => {
    const remove = questions.every(question => selected[String(question.id)]);
    const next = { ...selected };
    questions.forEach(question => { if (remove) delete next[String(question.id)]; else next[String(question.id)] = question; });
    if (Object.keys(next).length > 500) { toast.error("한 번에 최대 500개를 선택할 수 있습니다."); return; }
    setSelected(next);
  };

  return (
    <>
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg">문제 관리</Label>
          <div className="flex flex-wrap ml-auto gap-2">
            <QuestionExcel />
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

      <QuestionBulkDelete selected={Object.values(selected)} onClear={() => setSelected({})} onDeleted={() => { setSelected({}); store.setPage(1); }} />
      <QuestionsTable
        items={questions}
        isLoading={isLoading}
        pageNum={store.page}
        perPage={store.pageSize}
        selectedIds={Object.keys(selected)}
        onToggle={toggle}
        onTogglePage={togglePage}
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
