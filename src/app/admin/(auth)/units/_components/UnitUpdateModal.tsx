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
import { useExams } from "@/app/admin/_hooks/apis/useExams";
import { GetUnitAdminDto } from "@/lib/http/apis/dtos/admin/question/get-unit.admin.dto";

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
  const { exams, isLoading: isExamsLoading } = useExams({ page: 1, limit: 100 });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>능력 단위 수정</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="text"
            value={unit?.name ?? ""}
            onChange={e =>
              onChangeUnit(prev =>
                prev ? { ...prev, name: e.target.value } : prev
              )
            }
            placeholder="능력 단위 이름"
          />

          <Select
            value={unit?.examId ? unit.examId.toString() : "NONE"}
            onValueChange={value =>
              onChangeUnit(prev => {
                if (!prev) return prev;

                const selectedExam =
                  value === "NONE"
                    ? null
                    : exams.find(exam => exam.id === Number(value)) ?? null;

                return {
                  ...prev,
                  examId: selectedExam?.id ?? null,
                  examTitle: selectedExam?.title ?? null,
                  examType: selectedExam?.type ?? null,
                };
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="시험 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">시험 미지정</SelectItem>
              {exams.map(exam => (
                <SelectItem key={exam.id} value={exam.id.toString()}>
                  {exam.title} ({exam.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={unit?.isDisplayed ? "ACTIVE" : "INACTIVE"}
            onValueChange={value =>
              onChangeUnit(prev =>
                prev ? { ...prev, isDisplayed: value === "ACTIVE" } : prev
              )
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

          {isExamsLoading && (
            <div className="text-xs text-muted-foreground">
              시험 목록을 불러오는 중입니다.
            </div>
          )}
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
