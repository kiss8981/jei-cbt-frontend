"use client";

import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface PaginationStore {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

interface PaginationProps {
  totalCount: number;
  isLoading?: boolean;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  useStore: () => PaginationStore;
}

export function Pagination({
  totalCount,
  isLoading = false,
  pageSizeOptions = [5, 10, 20, 50],
  showPageSizeSelector = true,
  useStore,
}: PaginationProps) {
  const { page, pageSize, setPage, setPageSize } = useStore();

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canPreviousPage = page > 1;
  const canNextPage = page < totalPages;

  const handleFirstPage = () => setPage(1);
  const handlePreviousPage = () => canPreviousPage && setPage(page - 1);
  const handleNextPage = () => canNextPage && setPage(page + 1);
  const handleLastPage = () => setPage(totalPages);

  if (totalCount === 0) return null;

  return (
    <div className="flex items-center justify-between px-4 py-4">
      {showPageSizeSelector && (
        <div className="hidden items-center gap-2 lg:flex">
          <Label className="text-sm font-medium">페이지당 행 수</Label>
          <Select
            value={`${pageSize}`}
            onValueChange={value => {
              const size = Number(value);
              if (Number.isFinite(size)) {
                setPageSize(size);
                setPage(1);
              }
            }}
            disabled={isLoading}
          >
            <SelectTrigger className="w-20">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map(size => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex w-fit items-center justify-center text-sm font-medium">
        페이지 {page} / {totalPages}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={handleFirstPage}
          disabled={!canPreviousPage || isLoading}
          title="첫 페이지로"
        >
          <span className="sr-only">첫 페이지로</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={handlePreviousPage}
          disabled={!canPreviousPage || isLoading}
          title="이전 페이지로"
        >
          <span className="sr-only">이전 페이지로</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={handleNextPage}
          disabled={!canNextPage || isLoading}
          title="다음 페이지로"
        >
          <span className="sr-only">다음 페이지로</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={handleLastPage}
          disabled={!canNextPage || isLoading}
          title="마지막 페이지로"
        >
          <span className="sr-only">마지막 페이지로</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface PaginationResultCountProps {
  isLoading: boolean;
  error?: Error | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  loadingText?: string;
  errorText?: string;
  noResultsText?: string;
}

export function PaginationResultCount({
  isLoading,
  error,
  totalCount,
  currentPage,
  pageSize,
  loadingText = "로딩중...",
  errorText = "에러 발생",
  noResultsText = "검색 결과가 없습니다",
}: PaginationResultCountProps) {
  const content = useMemo(() => {
    if (isLoading) return loadingText;
    if (error) return errorText;
    if (totalCount === 0) return noResultsText;

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);
    return `${start}-${end} / 총 ${totalCount}개`;
  }, [
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    loadingText,
    errorText,
    noResultsText,
  ]);

  return <Label className="mr-auto">{content}</Label>;
}
