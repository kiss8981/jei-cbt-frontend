"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { FilterField } from "@/components/ui/filterField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExamsFilterStore } from "@/lib/store/stores/exams-store";
import { EXAM_TYPE_OPTIONS } from "./constants";

export function ExamsFilter() {
  const router = useRouter();
  const store = useExamsFilterStore();

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    if (store.searchQuery.trim()) {
      params.set("search", store.searchQuery.trim());
    }

    if (store.typeFilter !== "ALL") {
      params.set("type", store.typeFilter);
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
  }, [router, store.searchQuery, store.typeFilter, store.page, store.pageSize]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  return (
    <Card className="m-0 p-0">
      <Table className="overflow-hidden rounded-xl">
        <TableBody>
          <TableRow>
            <FilterField label="검색">
              <Input
                type="text"
                placeholder="시험 제목"
                className="border-0 shadow-none hover:bg-accent"
                value={store.searchQuery}
                onChange={e => store.setSearchQuery(e.target.value)}
              />
            </FilterField>
            <FilterField label="시험 유형" isLast>
              <Select
                value={store.typeFilter}
                onValueChange={store.setTypeFilter}
              >
                <SelectTrigger className="w-full border-0 shadow-none">
                  <SelectValue placeholder="시험 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {EXAM_TYPE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
