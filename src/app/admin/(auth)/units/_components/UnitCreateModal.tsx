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
import { Spinner } from "@/components/ui/spinner";
import { useCreateUnit } from "@/app/admin/_hooks/apis/useUnits";
import { ExamMultiSelect } from "./ExamMultiSelect";

export function UnitCreateModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const { handleCreate, isLoading } = useCreateUnit();
  const [name, setName] = useState("");
  const [examIds, setExamIds] = useState<string[]>([]);

  const submit = async () => {
    const result = await handleCreate({
      name: name.trim(),
      examIds: examIds.map(examId => Number(examId)),
    });

    if (result) {
      setName("");
      setExamIds([]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>능력단위 등록</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="능력단위명"
          />

          <ExamMultiSelect initialValue={examIds} onExamChange={setExamIds} />
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={submit}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? <Spinner /> : "등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
