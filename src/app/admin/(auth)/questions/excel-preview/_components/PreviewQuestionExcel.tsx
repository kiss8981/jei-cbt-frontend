"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  clearQuestionExcelPreviewStorage,
  commitQuestionExcel,
  getQuestionExcelPreviewStorage,
} from "@/app/admin/_hooks/apis/useQuestionExcel";
import {
  PreviewQuestionExcelItemAdminDto,
  PreviewQuestionExcelResponseAdminDto,
} from "@/lib/http/apis/dtos/admin/question/excel-question.admin.dto";

const numberFormatter = new Intl.NumberFormat("ko-KR");

const TEXT = {
  create: "\uC2E0\uADDC",
  update: "\uC218\uC815",
  unchanged: "\uBCC0\uACBD \uC5C6\uC74C",
  conflict: "\uCDA9\uB3CC",
  commitDone:
    "\uC5D1\uC140 \uC77C\uAD04 \uBC18\uC601\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  commitError:
    "\uC5D1\uC140 \uC77C\uAD04 \uBC18\uC601\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
  emptyPreview:
    "\uC800\uC7A5\uB41C \uC5D1\uC140 \uBBF8\uB9AC\uBCF4\uAE30 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uC9C8\uBB38 \uBAA9\uB85D \uD654\uBA74\uC5D0\uC11C \uD30C\uC77C\uC744 \uB2E4\uC2DC \uC5C5\uB85C\uB4DC\uD574 \uC8FC\uC138\uC694.",
  backToList: "\uC9C8\uBB38 \uBAA9\uB85D\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30",
  title: "\uC5D1\uC140 \uBC18\uC601 \uBBF8\uB9AC\uBCF4\uAE30",
  subtitle:
    "\uBCC0\uACBD \uB0B4\uC6A9\uC744 \uD655\uC778\uD55C \uB4A4 \uBC18\uC601\uD560 \uD56D\uBAA9\uB9CC \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.",
  selectedCount: "\uBC18\uC601 \uC608\uC815 \uD56D\uBAA9",
  back: "\uC774\uC804\uC73C\uB85C",
  committing: "\uBC18\uC601 \uC911...",
  commit: "\uBC18\uC601\uD558\uAE30",
  total: "\uC804\uCCB4",
  hasConflict:
    "\uCDA9\uB3CC \uD56D\uBAA9\uC740 \uBC14\uB85C \uBC18\uC601\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uAC74\uB108\uB6F0\uAE30\uB85C \uB450\uAC70\uB098 \uC5D1\uC140 \uAC12\uC744 \uC218\uC815\uD55C \uB4A4 \uB2E4\uC2DC \uC5C5\uB85C\uB4DC\uD574 \uC8FC\uC138\uC694.",
  rowSuffix: "\uD589",
  apply: "\uBC18\uC601",
  skip: "\uAC74\uB108\uB6F0\uAE30",
  bodyDiff: "\uBCF8\uBB38 \uBCC0\uACBD",
  childDiff: "\uD558\uC704 \uD56D\uBAA9 \uBCC0\uACBD",
  current: "\uAE30\uC874",
  uploaded: "\uC5C5\uB85C\uB4DC",
  conflictHelp:
    "\uCDA9\uB3CC \uD56D\uBAA9\uC740 \uC790\uB3D9 \uBC18\uC601\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC5D1\uC140 \uAC12\uC744 \uC218\uC815\uD558\uAC70\uB098 \uC9C1\uC811 \uB2E4\uC2DC \uC5C5\uB85C\uB4DC\uD574 \uC8FC\uC138\uC694.",
  newQuestion: "NEW",
  questionId: "questionId",
  itemCountSuffix: "\uAC74",
} as const;

const statusVariant = (
  status: PreviewQuestionExcelItemAdminDto["status"]
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "create":
      return "default";
    case "update":
      return "secondary";
    case "conflict":
      return "destructive";
    default:
      return "outline";
  }
};

const statusLabel = (status: PreviewQuestionExcelItemAdminDto["status"]) => {
  switch (status) {
    case "create":
      return TEXT.create;
    case "update":
      return TEXT.update;
    case "unchanged":
      return TEXT.unchanged;
    case "conflict":
      return TEXT.conflict;
  }
};

const formatDisplayValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return numberFormatter.format(value);
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return String(value);
};

const isSameDisplayValue = (currentValue: unknown, uploadedValue: unknown) => {
  return (currentValue ?? null) === (uploadedValue ?? null);
};

export default function PreviewQuestionExcel() {
  const router = useRouter();
  const [preview, setPreview] =
    useState<PreviewQuestionExcelResponseAdminDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = getQuestionExcelPreviewStorage();
    if (!stored) return;

    setPreview({
      ...stored,
      items: stored.items.map(item => ({
        ...item,
        selectedAction: item.status === "conflict" ? "SKIP" : "APPLY",
      })),
    });
  }, []);

  const hasBlockingConflicts = useMemo(
    () =>
      Boolean(
        preview?.items.some(
          item => item.status === "conflict" && item.selectedAction !== "SKIP"
        )
      ),
    [preview]
  );

  const selectedApplyCount = useMemo(
    () =>
      preview?.items.filter(item => item.selectedAction === "APPLY").length ?? 0,
    [preview]
  );

  const handleActionChange = (rowNumber: number, action: "APPLY" | "SKIP") => {
    setPreview(current =>
      current
        ? {
            ...current,
            items: current.items.map(item =>
              item.rowNumber === rowNumber ? { ...item, selectedAction: action } : item
            ),
          }
        : current
    );
  };

  const handleCommit = async () => {
    if (!preview) return;

    try {
      setIsSubmitting(true);
      await commitQuestionExcel({ items: preview.items });
      clearQuestionExcelPreviewStorage();
      toast.success(TEXT.commitDone);
      router.push("/admin/questions");
    } catch (commitError: any) {
      toast.error(
        commitError?.response?.data?.message ||
          commitError?.message ||
          TEXT.commitError
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!preview) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">{TEXT.emptyPreview}</p>
        <div className="mt-4">
          <Button type="button" onClick={() => router.push("/admin/questions")}>
            {TEXT.backToList}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{TEXT.title}</h1>
          <p className="text-sm text-muted-foreground">{TEXT.subtitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {TEXT.selectedCount}{" "}
            <span className="font-semibold text-foreground">
              {numberFormatter.format(selectedApplyCount)}
              {TEXT.itemCountSuffix}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {TEXT.back}
          </Button>
          <Button
            type="button"
            onClick={handleCommit}
            disabled={isSubmitting || hasBlockingConflicts}
          >
            {isSubmitting ? <Spinner className="h-4 w-4" /> : null}
            {isSubmitting ? TEXT.committing : TEXT.commit}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">{TEXT.total}</div>
          <div className="text-2xl font-semibold">
            {numberFormatter.format(preview.summary.totalCount)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">{TEXT.create}</div>
          <div className="text-2xl font-semibold">
            {numberFormatter.format(preview.summary.createCount)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">{TEXT.update}</div>
          <div className="text-2xl font-semibold">
            {numberFormatter.format(preview.summary.updateCount)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">{TEXT.unchanged}</div>
          <div className="text-2xl font-semibold">
            {numberFormatter.format(preview.summary.unchangedCount)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">{TEXT.conflict}</div>
          <div className="text-2xl font-semibold text-red-600">
            {numberFormatter.format(preview.summary.conflictCount)}
          </div>
        </Card>
      </div>

      {hasBlockingConflicts && (
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {TEXT.hasConflict}
        </Card>
      )}

      {preview.items.map(item => {
        const visibleFieldDiffs = item.fieldDiffs.filter(
          diff => !isSameDisplayValue(diff.currentValue, diff.uploadedValue)
        );
        const visibleChildDiffs = item.childDiffs.filter(
          diff => diff.kind !== "unchanged"
        );

        return (
        <Card key={`${item.sheetName}-${item.rowNumber}`} className="p-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant(item.status)}>
                    {statusLabel(item.status)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {item.sheetName} / {numberFormatter.format(item.rowNumber)}
                    {TEXT.rowSuffix}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {TEXT.questionId}:{" "}
                    {item.questionId
                      ? numberFormatter.format(item.questionId)
                      : TEXT.newQuestion}
                  </span>
                </div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={item.selectedAction === "APPLY" ? "default" : "outline"}
                  disabled={item.status === "conflict"}
                  onClick={() => handleActionChange(item.rowNumber, "APPLY")}
                >
                  {TEXT.apply}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={item.selectedAction === "SKIP" ? "secondary" : "outline"}
                  onClick={() => handleActionChange(item.rowNumber, "SKIP")}
                >
                  {TEXT.skip}
                </Button>
              </div>
            </div>

            {visibleFieldDiffs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">{TEXT.bodyDiff}</h3>
                {visibleFieldDiffs.map(diff => (
                  <div
                    key={`${item.rowNumber}-${diff.field}`}
                    className="rounded-md border p-3 text-sm"
                  >
                    <div className="font-medium">{diff.field}</div>
                    <div className="text-muted-foreground">
                      {TEXT.current}: {formatDisplayValue(diff.currentValue)}
                    </div>
                    <div>
                      {TEXT.uploaded}: {formatDisplayValue(diff.uploadedValue)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {visibleChildDiffs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">{TEXT.childDiff}</h3>
                {visibleChildDiffs.map((diff, index) => (
                  <div
                    key={`${item.rowNumber}-${diff.label}-${index}`}
                    className="rounded-md border p-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{diff.kind}</Badge>
                      <span className="font-medium">{diff.label}</span>
                    </div>
                    {diff.currentValue !== undefined && (
                      <div className="mt-1 text-muted-foreground">
                        {TEXT.current}: {formatDisplayValue(diff.currentValue)}
                      </div>
                    )}
                    {diff.uploadedValue !== undefined && (
                      <div>
                        {TEXT.uploaded}: {formatDisplayValue(diff.uploadedValue)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {item.conflicts.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-red-600">
                    {TEXT.conflict}
                  </h3>
                  {item.conflicts.map((conflict, index) => (
                    <p
                      key={`${item.rowNumber}-conflict-${index}`}
                      className="text-sm text-red-600"
                    >
                      {conflict}
                    </p>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    {TEXT.conflictHelp}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
        );
      })}
    </div>
  );
}
