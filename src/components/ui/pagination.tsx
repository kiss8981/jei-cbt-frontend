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

const TEXT = {
  pageSize: "\uD398\uC774\uC9C0\uB2F9 \uAC1C\uC218",
  page: "\uD398\uC774\uC9C0",
  firstPage: "\uCCAB \uD398\uC774\uC9C0\uB85C",
  previousPage: "\uC774\uC804 \uD398\uC774\uC9C0\uB85C",
  nextPage: "\uB2E4\uC74C \uD398\uC774\uC9C0\uB85C",
  lastPage: "\uB9C8\uC9C0\uB9C9 \uD398\uC774\uC9C0\uB85C",
  loading: "\uB85C\uB529 \uC911...",
  error: "\uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  empty: "\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
  totalPrefix: "\uCD1D",
  totalSuffix: "\uAC1C",
} as const;

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
          <Label className="text-sm font-medium">{TEXT.pageSize}</Label>
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
                  {size.toLocaleString("ko-KR")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex w-fit items-center justify-center text-sm font-medium">
        {TEXT.page} {page.toLocaleString("ko-KR")} /{" "}
        {totalPages.toLocaleString("ko-KR")}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={handleFirstPage}
          disabled={!canPreviousPage || isLoading}
          title={TEXT.firstPage}
        >
          <span className="sr-only">{TEXT.firstPage}</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={handlePreviousPage}
          disabled={!canPreviousPage || isLoading}
          title={TEXT.previousPage}
        >
          <span className="sr-only">{TEXT.previousPage}</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={handleNextPage}
          disabled={!canNextPage || isLoading}
          title={TEXT.nextPage}
        >
          <span className="sr-only">{TEXT.nextPage}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={handleLastPage}
          disabled={!canNextPage || isLoading}
          title={TEXT.lastPage}
        >
          <span className="sr-only">{TEXT.lastPage}</span>
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
  loadingText = TEXT.loading,
  errorText = TEXT.error,
  noResultsText = TEXT.empty,
}: PaginationResultCountProps) {
  const content = useMemo(() => {
    if (isLoading) return loadingText;
    if (error) return errorText;
    if (totalCount === 0) return noResultsText;

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);

    return `${start.toLocaleString("ko-KR")}-${end.toLocaleString(
      "ko-KR"
    )} / ${TEXT.totalPrefix} ${totalCount.toLocaleString("ko-KR")}${
      TEXT.totalSuffix
    }`;
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
