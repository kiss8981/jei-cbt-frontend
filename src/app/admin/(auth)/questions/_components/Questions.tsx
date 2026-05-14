"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  downloadQuestionExcelExport,
  downloadQuestionExcelTemplate,
  previewQuestionExcelWithProgress,
  setQuestionExcelPreviewStorage,
} from "@/app/admin/_hooks/apis/useQuestionExcel";
import {
  useQuestions,
  UseQuestionsSearchParams,
} from "@/app/admin/_hooks/apis/useQuestions";
import { Pagination, PaginationResultCount } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Download,
  FileSpreadsheet,
  RotateCcw,
  Upload,
} from "lucide-react";
import { useQuestionsFilterStore } from "@/lib/store/stores/questions-store";
import { QuestionsFilter } from "./QuestionsFilter";
import { QuestionsTable } from "./QuestionsTable";

const TEXT = {
  title: "\uBB38\uC81C \uAD00\uB9AC",
  templateDownloadDone:
    "\uBE48 \uD15C\uD50C\uB9BF \uB2E4\uC6B4\uB85C\uB4DC\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  templateDownloadError:
    "\uD15C\uD50C\uB9BF \uB2E4\uC6B4\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
  exportDownloadDone:
    "\uAC80\uC0C9 \uACB0\uACFC \uC5D1\uC140 \uB2E4\uC6B4\uB85C\uB4DC\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  exportDownloadError:
    "\uAC80\uC0C9 \uACB0\uACFC \uB2E4\uC6B4\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
  previewError: "\uC5D1\uC140 \uBBF8\uB9AC\uBCF4\uAE30\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
  templateDownloading:
    "\uBE48 \uD15C\uD50C\uB9BF\uC744 \uB2E4\uC6B4\uB85C\uB4DC\uD558\uB294 \uC911\uC785\uB2C8\uB2E4.",
  exportDownloading:
    "\uD604\uC7AC \uAC80\uC0C9 \uC870\uAC74\uC5D0 \uB9DE\uB294 \uBB38\uC81C\uB97C \uC5D1\uC140\uB85C \uB0B4\uBCF4\uB0B4\uB294 \uC911\uC785\uB2C8\uB2E4.",
  previewGeneratingPrefix:
    "\uC5D1\uC140 \uBBF8\uB9AC\uBCF4\uAE30\uB97C \uC0DD\uC131\uD558\uB294 \uC911\uC785\uB2C8\uB2E4.",
  downloadInProgress: "\uB2E4\uC6B4\uB85C\uB4DC \uC911...",
  exportInProgress: "\uB0B4\uBCF4\uB0B4\uB294 \uC911...",
  uploadInProgress: "\uBBF8\uB9AC\uBCF4\uAE30 \uC0DD\uC131 \uC911...",
  templateButton: "\uBE48 \uD15C\uD50C\uB9BF \uB2E4\uC6B4\uB85C\uB4DC",
  exportButton:
    "\uAC80\uC0C9\uACB0\uACFC \uC5D1\uC140 \uB2E4\uC6B4\uB85C\uB4DC",
  uploadButton: "\uC5D1\uC140 \uC5C5\uB85C\uB4DC",
  resetButton: "\uCD08\uAE30\uD654",
} as const;

const Questions = () => {
  const router = useRouter();
  const store = useQuestionsFilterStore();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadTarget, setDownloadTarget] = useState<
    "template" | "export" | null
  >(null);

  const apiParams = useMemo(() => {
    const params: UseQuestionsSearchParams = {
      page: store.page,
      limit: store.pageSize,
    };

    if (store.searchQuery.trim()) {
      params.keyword = store.searchQuery.trim();
    }

    if (!store.unitFilter.includes("ALL") && store.unitFilter.length > 0) {
      params.unitIds = store.unitFilter.join(",");
    }

    if (store.questionTypeFilter && store.questionTypeFilter.length > 0) {
      params.questionTypes = store.questionTypeFilter.join(",");
    }

    return params;
  }, [
    store.page,
    store.pageSize,
    store.questionTypeFilter,
    store.searchQuery,
    store.unitFilter,
  ]);

  const { questions, totalCount, isLoading, error } = useQuestions(apiParams);

  const handleTemplateDownload = async () => {
    try {
      setDownloadTarget("template");
      await downloadQuestionExcelTemplate();
      toast.success(TEXT.templateDownloadDone);
    } catch (downloadError: any) {
      toast.error(
        downloadError?.response?.data?.message ||
          downloadError?.message ||
          TEXT.templateDownloadError
      );
    } finally {
      setDownloadTarget(null);
    }
  };

  const handleExportDownload = async () => {
    try {
      setDownloadTarget("export");
      await downloadQuestionExcelExport(apiParams);
      toast.success(TEXT.exportDownloadDone);
    } catch (downloadError: any) {
      toast.error(
        downloadError?.response?.data?.message ||
          downloadError?.message ||
          TEXT.exportDownloadError
      );
    } finally {
      setDownloadTarget(null);
    }
  };

  const handleUploadTrigger = () => {
    inputRef.current?.click();
  };

  const handleUploadChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      const preview = await previewQuestionExcelWithProgress(file, progress =>
        setUploadProgress(progress)
      );
      setQuestionExcelPreviewStorage(preview);
      router.push("/admin/questions/excel-preview");
    } catch (uploadError: any) {
      toast.error(
        uploadError?.response?.data?.message ||
          uploadError?.message ||
          TEXT.previewError
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const statusMessage = useMemo(() => {
    if (downloadTarget === "template") {
      return TEXT.templateDownloading;
    }

    if (downloadTarget === "export") {
      return TEXT.exportDownloading;
    }

    if (isUploading) {
      return `${TEXT.previewGeneratingPrefix} ${uploadProgress.toLocaleString(
        "ko-KR"
      )}%`;
    }

    return null;
  }, [downloadTarget, isUploading, uploadProgress]);

  return (
    <>
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Label className="text-lg">{TEXT.title}</Label>
          <div className="ml-auto flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleUploadChange}
            />
            <Button
              type="button"
              size="default"
              variant="outline"
              onClick={handleTemplateDownload}
              disabled={Boolean(downloadTarget)}
            >
              {downloadTarget === "template" ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              {downloadTarget === "template"
                ? TEXT.downloadInProgress
                : TEXT.templateButton}
            </Button>
            <Button
              type="button"
              size="default"
              variant="outline"
              onClick={handleExportDownload}
              disabled={Boolean(downloadTarget)}
            >
              {downloadTarget === "export" ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {downloadTarget === "export"
                ? TEXT.exportInProgress
                : TEXT.exportButton}
            </Button>
            <Button
              type="button"
              size="default"
              onClick={handleUploadTrigger}
              disabled={isUploading}
            >
              {isUploading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isUploading
                ? `${TEXT.uploadInProgress} ${uploadProgress.toLocaleString(
                    "ko-KR"
                  )}%`
                : TEXT.uploadButton}
            </Button>
            <Button
              type="button"
              size="default"
              onClick={store.clearAll}
              variant="ghost"
              className="rounded-xl bg-neutral-200 text-black hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              {TEXT.resetButton}
            </Button>
          </div>
        </div>

        {statusMessage && (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            <Spinner className="h-4 w-4" />
            <span>{statusMessage}</span>
          </div>
        )}

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
