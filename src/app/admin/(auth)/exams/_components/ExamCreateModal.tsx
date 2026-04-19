"use client";

import { useState } from "react";
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
import { useCreateExam } from "@/app/admin/_hooks/apis/useExams";
import { EXAM_TYPE_OPTIONS } from "./constants";

export function ExamCreateModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const { handleCreate, isLoading } = useCreateExam();
  const [type, setType] = useState("EXTERNAL_EVALUATION");
  const [title, setTitle] = useState("");
  const [isDisplayed, setIsDisplayed] = useState(true);

  const submit = async () => {
    const result = await handleCreate({
      type,
      title: title.trim(),
      isDisplayed,
    });

    if (result) {
      setType("EXTERNAL_EVALUATION");
      setTitle("");
      setIsDisplayed(true);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>시험 등록</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={type} onValueChange={setType}>
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
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="시험 제목"
          />

          <Select
            value={isDisplayed ? "ACTIVE" : "INACTIVE"}
            onValueChange={value => setIsDisplayed(value === "ACTIVE")}
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
            disabled={isLoading || !title.trim()}
          >
            {isLoading ? <Spinner /> : "등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
