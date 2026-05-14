"use client";

import { useEffect, useMemo, useState } from "react";
import cn from "classnames";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useExams } from "@/app/admin/_hooks/apis/useExams";
import { UnitExamSummaryDto } from "@/lib/http/apis/dtos/admin/question/get-unit.admin.dto";

interface ExamMultiSelectProps {
  initialValue?: string[];
  selectedExams?: UnitExamSummaryDto[];
  onExamChange: (examIds: string[]) => void;
}

export function ExamMultiSelect({
  initialValue = [],
  selectedExams = [],
  onExamChange,
}: ExamMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedExamIds, setSelectedExamIds] =
    useState<string[]>(initialValue);

  useEffect(() => {
    setSelectedExamIds(initialValue);
  }, [initialValue]);

  const {
    exams: apiExams,
    isLoading,
    error,
  } = useExams({
    keyword: searchKeyword,
    limit: 1000,
    page: 1,
  });

  const exams = useMemo(() => {
    const selectedExamMap = new Map(
      selectedExams.map(exam => [
        exam.id,
        {
          id: exam.id,
          title: exam.title,
          type: exam.type,
        },
      ]),
    );

    for (const exam of apiExams) {
      selectedExamMap.set(exam.id, {
        id: exam.id,
        title: exam.title,
        type: exam.type,
      });
    }

    return Array.from(selectedExamMap.values()).sort((a, b) =>
      a.title.localeCompare(b.title, "ko-KR"),
    );
  }, [apiExams, selectedExams]);

  const syncSelection = (nextSelectedExamIds: string[]) => {
    setSelectedExamIds(nextSelectedExamIds);
    onExamChange(nextSelectedExamIds);
  };

  const handleSelect = (examId: string) => {
    const nextSelectedExamIds = selectedExamIds.includes(examId)
      ? selectedExamIds.filter(id => id !== examId)
      : [...selectedExamIds, examId];

    syncSelection(nextSelectedExamIds);
  };

  const handleClear = () => {
    syncSelection([]);
  };

  const displayText = () => {
    if (selectedExamIds.length === 0) {
      return "시험 선택";
    }

    if (selectedExamIds.length === 1) {
      const selectedExam = exams.find(
        exam => exam.id.toString() === selectedExamIds[0],
      );
      return selectedExam
        ? `${selectedExam.title} (${selectedExam.type})`
        : "시험 1개 선택";
    }

    return `시험 ${selectedExamIds.length}개 선택`;
  };

  const visibleSelectedExams = exams.filter(exam =>
    selectedExamIds.includes(exam.id.toString()),
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal"
            >
              {displayText()}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0"
            style={{ width: "var(--radix-popover-trigger-width)" }}
          >
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="시험 검색..."
                className="h-9"
                value={searchKeyword}
                onValueChange={setSearchKeyword}
              />
              <CommandList>
                {isLoading ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    검색 중...
                  </div>
                ) : error ? (
                  <div className="p-2 text-sm text-red-500">
                    {error.message}
                  </div>
                ) : (
                  <>
                    <CommandEmpty>검색 결과 없음</CommandEmpty>
                    <CommandGroup>
                      {exams.map(exam => (
                        <CommandItem
                          key={exam.id}
                          value={exam.id.toString()}
                          onSelect={() => handleSelect(exam.id.toString())}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{exam.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {exam.type}
                            </span>
                          </div>
                          <Check
                            className={cn(
                              "ml-auto",
                              selectedExamIds.includes(exam.id.toString())
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {visibleSelectedExams.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {visibleSelectedExams.map(exam => (
            <button
              key={exam.id}
              type="button"
              onClick={() => handleSelect(exam.id.toString())}
              className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs hover:bg-accent"
            >
              <span>{exam.title}</span>
              <span className="text-muted-foreground">({exam.type})</span>
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
