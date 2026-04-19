"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useAppRouter from "@/hooks/useAppRouter";
import { cn } from "@/lib/utils";
import { useSelectedExamStore } from "@/lib/store/stores/selected-exam-store";
import { useExamTypes, useExams } from "../_hooks/useExams";
import { useLastQuestionSession } from "../_hooks/useQuestionSession";

export default function Home() {
  const { navigate } = useAppRouter();
  const { LastSessionDialog } = useLastQuestionSession();
  const examTypeValue = useSelectedExamStore(state => state.examTypeValue);
  const examId = useSelectedExamStore(state => state.examId);
  const examTitle = useSelectedExamStore(state => state.examTitle);
  const setExamType = useSelectedExamStore(state => state.setExamType);
  const setExam = useSelectedExamStore(state => state.setExam);
  const clearSelection = useSelectedExamStore(state => state.clearSelection);
  const hydrated = useSelectedExamStore(state => state.hydrated);
  const { examTypes, isLoading: isExamTypesLoading } = useExamTypes();
  const { exams, isLoading: isExamsLoading } = useExams(examTypeValue);

  return (
    <>
      <LastSessionDialog />
      <div className="flex min-h-[calc(100dvh-var(--safe-area-inset-top,0px)-var(--safe-area-inset-bottom,0px))] w-full flex-col items-center bg-white px-4 py-6 sm:justify-center sm:px-6">
        <div className="flex w-full max-w-[520px] flex-col">
          <div className="flex flex-col items-center">
            <img
              src="/images/logo.png"
              alt="재능고등학교"
              className="h-10 w-auto max-w-full object-contain"
            />
            <h1 className="mt-1 text-lg text-gray-500">재능고등학교 CBT</h1>
          </div>

          <div className="mt-8 w-full space-y-4 sm:mt-14">
            <div className="space-y-4 rounded-2xl border border-neutral-200 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">시험 선택</div>
                  <div className="text-sm text-neutral-500">
                    시험유형과 시험을 먼저 선택한 뒤 학습을 시작합니다.
                  </div>
                </div>
                {examId && (
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    다시 선택
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">1. 시험유형 선택</div>
                <div className="grid grid-cols-2 gap-2">
                  {!hydrated || isExamTypesLoading ? (
                    <>
                      <Skeleton className="h-11 w-full" />
                      <Skeleton className="h-11 w-full" />
                    </>
                  ) : (
                    examTypes.map(examType => (
                      <button
                        key={examType.value}
                        type="button"
                        className={cn(
                          "h-11 rounded-xl border px-3 text-sm font-medium transition-colors",
                          examTypeValue === examType.value
                            ? "border-black bg-black text-white"
                            : "border-neutral-200 bg-white text-black",
                        )}
                        onClick={() =>
                          setExamType({
                            value: examType.value,
                            label: examType.label,
                          })
                        }
                      >
                        {examType.label}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">2. 시험 선택</div>
                {!examTypeValue ? (
                  <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-sm text-neutral-500">
                    먼저 시험유형을 선택해주세요.
                  </div>
                ) : isExamsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-11 w-full" />
                    <Skeleton className="h-11 w-full" />
                  </div>
                ) : exams.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-sm text-neutral-500">
                    선택한 시험유형에 등록된 시험이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {exams.map(exam => (
                      <button
                        key={exam.id}
                        type="button"
                        className={cn(
                          "w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                          examId === exam.id
                            ? "border-black bg-black text-white"
                            : "border-neutral-200 bg-white text-black",
                        )}
                        onClick={() =>
                          setExam({
                            id: exam.id,
                            title: exam.title,
                          })
                        }
                      >
                        {exam.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {examId && (
              <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
                선택된 시험:{" "}
                <span className="font-semibold text-black">{examTitle}</span>
              </div>
            )}

            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                onClick={() => navigate("push", "/learn/unit")}
                size="lg"
                disabled={!examId}
                className="w-full"
              >
                능력단위별 학습
              </Button>
              <Button
                onClick={() => navigate("push", "/learn/all")}
                size="lg"
                disabled={!examId}
                className="w-full"
              >
                전체 문제 학습
              </Button>
              <Button
                onClick={() => navigate("push", "/learn/mock")}
                className="w-full sm:col-span-2"
                size="lg"
                disabled={!examId}
              >
                모의고사
              </Button>

              <Button
                onClick={() => navigate("push", "/learn/wrong")}
                className="w-full sm:col-span-2"
                size="lg"
              >
                오답문제 복습
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
