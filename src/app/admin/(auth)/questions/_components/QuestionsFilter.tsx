"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, RotateCcw } from "lucide-react";
import { useQuestionsFilterStore } from "@/lib/store/stores/questions-store";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { FilterField } from "@/components/ui/filterField";
import { UnitMultiSelect } from "./UnitMultiSelect";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  QuestionType,
  typeText,
} from "@/lib/http/apis/dtos/common/question-type.enum";

export function QuestionsFilter() {
  const router = useRouter();
  const store = useQuestionsFilterStore();

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    if (store.searchQuery.trim()) {
      params.set("search", store.searchQuery.trim());
    }

    if (!store.unitFilter.includes("ALL") && store.unitFilter.length > 0) {
      const unitIds = store.unitFilter.join(",");
      params.set("unitIds", unitIds);
    }

    if (store.questionTypeFilter && store.questionTypeFilter.length > 0) {
      const questionTypes = store.questionTypeFilter.join(",");
      params.set("questionTypes", questionTypes);
    }

    if (store.page > 1) {
      params.set("page", store.page.toString());
    }

    if (store.pageSize !== 10) {
      params.set("pageSize", store.pageSize.toString());
    }

    const queryString = params.toString();
    const newURL = queryString ? `?${queryString}` : window.location.pathname;
    router.push(newURL);
  }, [
    router,
    store.searchQuery,
    store.questionTypeFilter,
    store.unitFilter,
    store.page,
    store.pageSize,
  ]);

  // URL 업데이트를 위한 useEffect
  useEffect(() => {
    updateURL();
  }, [
    store.searchQuery,
    store.unitFilter,
    store.page,
    store.pageSize,
    store.questionTypeFilter,
  ]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      store.setSearchQuery(e.target.value);
    },
    []
  );

  return (
    <>
      <Card className="p-0 m-0">
        <Table className="rounded-xl overflow-hidden">
          <TableBody>
            <TableRow>
              <FilterField label="검색">
                <Input
                  type="text"
                  placeholder="문제 이름"
                  className="border-0 shadow-none hover:bg-accent"
                  value={store.searchQuery}
                  onChange={handleSearchChange}
                />
              </FilterField>
              <FilterField label="문제 유형">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[200px] justify-between rounded-xl"
                    >
                      {/* 선택된 항목에 따른 라벨 표시 로직 */}
                      {!store.questionTypeFilter ||
                      store.questionTypeFilter.length === 0
                        ? "전체"
                        : `${store.questionTypeFilter.length}개 선택됨`}
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px]" align="start">
                    {/* '전체' 선택 옵션 */}
                    <DropdownMenuCheckboxItem
                      checked={
                        !store.questionTypeFilter ||
                        store.questionTypeFilter.length === 0
                      }
                      onCheckedChange={() => store.setQuestionTypeFilter([])}
                    >
                      전체
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuSeparator />

                    {/* 개별 타입 옵션들 */}
                    {Object.values(QuestionType).map(type => (
                      <DropdownMenuCheckboxItem
                        key={type}
                        checked={store.questionTypeFilter?.includes(
                          type as any
                        )}
                        onCheckedChange={() => {
                          const current = store.questionTypeFilter || [];
                          if (current.includes(type as any)) {
                            store.setQuestionTypeFilter(
                              current.filter(t => t !== type)
                            );
                          } else {
                            store.setQuestionTypeFilter([
                              ...current,
                              type as any,
                            ]);
                          }
                        }}
                      >
                        {typeText(type)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </FilterField>
              <FilterField label="능력단위">
                <UnitMultiSelect
                  initialValue={store.unitFilter}
                  onUnitChange={store.setUnitFilter}
                />
              </FilterField>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
