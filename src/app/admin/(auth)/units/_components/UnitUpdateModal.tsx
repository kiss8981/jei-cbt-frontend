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
import { GetUnitAdminDto } from "@/lib/http/apis/dtos/admin/question/get-unit.admin.dto";
import { ExamMultiSelect } from "./ExamMultiSelect";

export function UnitUpdateModal({
  open,
  onOpenChange,
  unit,
  onChangeUnit,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  unit: GetUnitAdminDto | null;
  onChangeUnit: React.Dispatch<React.SetStateAction<GetUnitAdminDto | null>>;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>단원 수정</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="text"
            value={unit?.name ?? ""}
            onChange={(e) =>
              onChangeUnit((prev) =>
                prev ? { ...prev, name: e.target.value } : prev
              )
            }
            placeholder="단원명"
          />

          <ExamMultiSelect
            initialValue={unit?.examIds.map((examId) => examId.toString()) ?? []}
            selectedExams={unit?.exams ?? []}
            onExamChange={(examIds) =>
              onChangeUnit((prev) =>
                prev
                  ? {
                      ...prev,
                      examIds: examIds.map((examId) => Number(examId)),
                      exams: prev.exams.filter((exam) =>
                        examIds.includes(exam.id.toString())
                      ),
                    }
                  : prev
              )
            }
          />

          <Select
            value={unit?.isDisplayed ? "ACTIVE" : "INACTIVE"}
            onValueChange={(value) =>
              onChangeUnit((prev) =>
                prev ? { ...prev, isDisplayed: value === "ACTIVE" } : prev
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">표시</SelectItem>
              <SelectItem value="INACTIVE">숨김</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button onClick={onSubmit} variant="outline" disabled={isLoading}>
            {isLoading ? <Spinner /> : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
