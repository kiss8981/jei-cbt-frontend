"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteUnit } from "@/app/admin/_hooks/apis/useUnits";
import { GetUnitAdminDto } from "@/lib/http/apis/dtos/admin/question/get-unit.admin.dto";

export function UnitDeleteDialog({
  open,
  onOpenChange,
  unit,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  unit: GetUnitAdminDto;
}) {
  const { handleDelete, isLoading } = useDeleteUnit();
  const questionCount = unit.questionCount ?? 0;
  const hasQuestions = questionCount > 0;

  const submit = async () => {
    const result = await handleDelete(unit.id);

    if (result) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>능력단위 삭제</DialogTitle>
          <DialogDescription>
            {hasQuestions
              ? `이 능력단위에는 문제 ${questionCount}개가 등록되어 있어 삭제할 수 없습니다. 문제 관리에서 문제를 먼저 삭제해 주세요.`
              : "삭제한 능력단위는 관리자 목록과 학습자 화면에서 모두 사라집니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border p-3 text-sm">
          <div className="font-medium">{unit.name}</div>
          <div className="text-muted-foreground">
            ID {unit.id} · 문제 {questionCount}개
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={submit}
            disabled={isLoading || hasQuestions}
          >
            {isLoading ? <Spinner /> : "삭제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
