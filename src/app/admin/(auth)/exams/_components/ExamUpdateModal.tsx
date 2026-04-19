"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { GetExamAdminDto } from "@/lib/http/apis/dtos/admin/exam/get-exam.admin.dto";
import { useUpdateExam } from "@/app/admin/_hooks/apis/useExams";
import { EXAM_TYPE_OPTIONS } from "./constants";

export function ExamUpdateModal({
  open,
  onOpenChange,
  exam,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  exam: GetExamAdminDto;
}) {
  const { updatedExam, setUpdatedExam, handleUpdate, isLoading } =
    useUpdateExam(exam);

  const submit = async () => {
    const result = await handleUpdate({
      type: updatedExam.typeValue,
      title: updatedExam.title.trim(),
      isDisplayed: updatedExam.isDisplayed,
    });

    if (result) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>시험 수정</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select
            value={updatedExam.typeValue}
            onValueChange={value =>
              setUpdatedExam(prev => ({
                ...prev,
                typeValue: value,
                type:
                  EXAM_TYPE_OPTIONS.find(option => option.value === value)
                    ?.label ?? prev.type,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="시험 유형 선택" />
            </SelectTrigger>
            <SelectContent>
              {EXAM_TYPE_OPTIONS.filter(option => option.value !== "ALL").map(
                option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <Input
            value={updatedExam.title}
            onChange={e =>
              setUpdatedExam(prev => ({
                ...prev,
                title: e.target.value,
              }))
            }
            placeholder="시험 제목"
          />

          <Select
            value={updatedExam.isDisplayed ? "ACTIVE" : "INACTIVE"}
            onValueChange={value =>
              setUpdatedExam(prev => ({
                ...prev,
                isDisplayed: value === "ACTIVE",
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">활성</SelectItem>
              <SelectItem value="INACTIVE">비활성</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={submit}
            disabled={isLoading || !updatedExam.title.trim()}
          >
            {isLoading ? <Spinner /> : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
