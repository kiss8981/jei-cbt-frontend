"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Layers3,
  RefreshCcw,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useAppRouter from "@/hooks/useAppRouter";
import useAppVersion from "@/hooks/useAppVersion";
import { cn } from "@/lib/utils";
import { useSelectedExamStore } from "@/lib/store/stores/selected-exam-store";
import { useExamTypes, useExams } from "../_hooks/useExams";
import { useLastQuestionSession } from "../_hooks/useQuestionSession";

interface ActionButtonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  emphasized?: boolean;
}

function ActionButton({
  icon: Icon,
  title,
  description,
  onClick,
  disabled = false,
  emphasized = false,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2",
        emphasized
          ? "bg-neutral-900 text-white shadow-sm hover:bg-neutral-800"
          : "border border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          emphasized ? "bg-white/10" : "bg-neutral-100",
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{title}</span>
        <span
          className={cn(
            "mt-0.5 block text-xs",
            emphasized ? "text-neutral-300" : "text-neutral-500",
          )}
        >
          {description}
        </span>
      </span>
      <ChevronRight
        className={cn(
          "size-4 shrink-0 transition-transform group-hover:translate-x-0.5",
          emphasized ? "text-neutral-400" : "text-neutral-300",
        )}
      />
    </button>
  );
}

export default function Home() {
  const { navigate } = useAppRouter();
  const { isReady: isAppVersionReady, supportsNativeBottomTabs } =
    useAppVersion();
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
  const hasSelectedExam = examId !== null;

  return (
    <>
      <LastSessionDialog />
      <div className="min-h-[calc(100dvh-var(--safe-area-inset-top,0px)-var(--safe-area-inset-bottom,0px))] bg-white">
        <main className="mx-auto w-full max-w-[680px] px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
          <header className="flex items-center justify-between">
            <div>
              <img
                src="/images/logo.png"
                alt="재능고등학교"
                className="h-8 w-auto object-contain"
              />
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-500 shadow-sm ring-1 ring-neutral-200">
              CBT 학습
            </span>
          </header>

          <section className="mt-7 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/80 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-bold tracking-tight">시험 선택</h1>
              </div>
              {examTypeValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="shrink-0 text-xs text-neutral-500"
                >
                  <RefreshCcw className="size-3.5" />
                  초기화
                </Button>
              )}
            </div>

            <div className="mt-6 space-y-5">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="flex size-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white">
                    1
                  </span>
                  시험 유형
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {!hydrated || isExamTypesLoading ? (
                    <>
                      <Skeleton className="h-11 rounded-xl" />
                      <Skeleton className="h-11 rounded-xl" />
                    </>
                  ) : (
                    examTypes.map(examType => {
                      const selected = examTypeValue === examType.value;
                      return (
                        <button
                          key={examType.value}
                          type="button"
                          aria-pressed={selected}
                          className={cn(
                            "flex h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-colors",
                            selected
                              ? "bg-neutral-900 text-white"
                              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                          )}
                          onClick={() =>
                            setExamType({
                              value: examType.value,
                              label: examType.label,
                            })
                          }
                        >
                          {selected && <CheckCircle2 className="size-4" />}
                          {examType.label}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-[10px]",
                      examTypeValue
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-200 text-neutral-500",
                    )}
                  >
                    2
                  </span>
                  시험
                </div>
                {isExamsLoading && examTypeValue ? (
                  <Skeleton className="h-12 rounded-xl" />
                ) : examTypeValue && exams.length === 0 ? (
                  <div className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
                    등록된 시험이 없습니다.
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={examId === null ? "" : String(examId)}
                      disabled={!examTypeValue}
                      onChange={event => {
                        const value = event.target.value;
                        const exam = exams.find(
                          item => String(item.id) === value,
                        );
                        if (exam) {
                          setExam({ id: Number(exam.id), title: exam.title });
                        }
                      }}
                      className="h-12 w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 pr-10 text-sm outline-none transition-colors focus:border-neutral-400 disabled:bg-neutral-50 disabled:text-neutral-400"
                      aria-label="학습할 시험 선택"
                    >
                      <option value="" disabled>
                        {examTypeValue
                          ? "학습할 시험을 선택하세요"
                          : "시험 유형을 먼저 선택하세요"}
                      </option>
                      {exams.map(exam => (
                        <option key={exam.id} value={String(exam.id)}>
                          {exam.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                  </div>
                )}
              </div>
            </div>

            {hasSelectedExam && (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-900">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span className="truncate font-semibold">{examTitle}</span>
              </div>
            )}
          </section>

          <section className="mt-7">
            <div className="mb-3 flex items-end justify-between gap-3 px-1">
              <div>
                <h2 className="text-base font-bold">학습 시작</h2>
                <p className="mt-0.5 text-xs text-neutral-500">
                  원하는 학습 방식을 선택하세요.
                </p>
              </div>
              {!hasSelectedExam && (
                <span className="text-[11px] font-medium text-neutral-400">
                  시험 선택 필요
                </span>
              )}
            </div>
            <div className="space-y-2.5">
              <ActionButton
                icon={BookOpen}
                title="능력단위별 학습"
                description="단원별로 차근차근 학습해요."
                onClick={() => navigate("push", "/learn/unit")}
                disabled={!hasSelectedExam}
                emphasized
              />
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <ActionButton
                  icon={Layers3}
                  title="전체 문제 학습"
                  description="등록된 전체 문제를 풀어요."
                  onClick={() => navigate("push", "/learn/all")}
                  disabled={!hasSelectedExam}
                />
                <ActionButton
                  icon={ClipboardCheck}
                  title="모의고사"
                  description="실전처럼 시간을 재고 풀어요."
                  onClick={() => navigate("push", "/learn/mock")}
                  disabled={!hasSelectedExam}
                />
              </div>
            </div>
          </section>

          {isAppVersionReady && !supportsNativeBottomTabs && (
            <section className="mt-2.5 space-y-2.5">
              <ActionButton
                icon={RotateCcw}
                title="오답문제 복습"
                description="틀린 문제를 다시 풀고 복습해요."
                onClick={() => navigate("push", "/learn/wrong")}
              />
              <ActionButton
                icon={Bell}
                title="학습자료 및 공지"
                description="학습자료와 새로운 공지를 확인해요."
                onClick={() => navigate("push", "/notices")}
              />
            </section>
          )}

        </main>
      </div>
    </>
  );
}
