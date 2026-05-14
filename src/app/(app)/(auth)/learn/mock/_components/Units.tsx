"use client";

import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { GetUnitListAppDto } from "@/lib/http/apis/dtos/app/unit/get-unit-list.app.dto";
import { useUnits } from "@/app/(app)/_hooks/useUnits";
import { GetUnitListQueryAppDto } from "@/lib/http/apis/dtos/app/unit/get-unit-list-query.app.dto";
import { useQuestionSessionByMock } from "@/app/(app)/_hooks/useQuestionSession";
import { FixedButton, TwoFixedButton } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSelectedExamGuard } from "@/app/(app)/_hooks/useSelectedExamGuard";

const ITEMS_PER_PAGE = 10;
const INITIAL_PAGE = 1;

interface UnitItemProps {
  unit: GetUnitListAppDto;
  handleSelect: (unitId: number) => void;
  selected: boolean;
}

const UnitItem: React.FC<UnitItemProps> = ({
  unit,
  handleSelect,
  selected,
}) => {
  return (
    <div
      className={cn("bg-background p-4")}
      onClick={() => handleSelect(unit.id)}
      style={{ cursor: "pointer" }}
      data-testid={`unit-item-${unit.id}`}
    >
      <div className={cn("flex flex-row items-center justify-between")}>
        <h3 className="w-52 truncate whitespace-pre-wrap text-lg font-semibold text-gray-800 dark:text-gray-100">
          {unit.name}
        </h3>
        {selected && (
          <Check
            className="text-green-500"
            size={20}
            aria-label="selected"
            data-testid="selected-icon"
          />
        )}
      </div>
      <Separator className="my-2" />
    </div>
  );
};

export const UnitsLoadingSkeleton = () => (
  <div className="relative h-screen w-full space-y-2 overflow-y-auto bg-white px-4 dark:bg-gray-900">
    {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
      <div key={i} className="flex flex-col space-y-2" data-testid="unit-skeleton">
        <Skeleton className="h-10 w-full bg-gray-200" />
      </div>
    ))}
  </div>
);

const Unit = ({ handleNext }: { handleNext: (unitIds: number[]) => void }) => {
  const { examId, hydrated, hasSelectedExam } = useSelectedExamGuard();
  const [allUnits, setAllUnits] = useState<GetUnitListAppDto[]>([]);
  const [searchParams, setSearchParams] = useState<GetUnitListQueryAppDto>({
    page: INITIAL_PAGE,
    limit: ITEMS_PER_PAGE,
    examId: examId ?? undefined,
  });
  const [hasMore, setHasMore] = useState(true);
  const { units, totalCount, isLoading, error } = useUnits(searchParams);
  const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  });

  useEffect(() => {
    setAllUnits([]);
    setSelectedUnitIds([]);
    setHasMore(true);
    setSearchParams({
      page: INITIAL_PAGE,
      limit: ITEMS_PER_PAGE,
      examId: examId ?? undefined,
    });
  }, [examId]);

  useEffect(() => {
    const incomingUnits = units as GetUnitListAppDto[];

    if (incomingUnits.length === 0) {
      return;
    }

    setAllUnits(prev => {
      const newUnits = incomingUnits.filter(
        (unit) => !prev.some((existingUnit) => existingUnit.id === unit.id)
      );

      if (newUnits.length === 0) {
        if (totalCount > 0 && prev.length >= totalCount) {
          setHasMore(false);
        }
        return prev;
      }

      const nextUnits = [...prev, ...newUnits];

      if (totalCount > 0 && nextUnits.length >= totalCount) {
        setHasMore(false);
      }

      return nextUnits;
    });
  }, [units, totalCount]);

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      setSearchParams(prev => ({
        ...prev,
        page: (prev.page || 0) + 1,
      }));
    }
  }, [inView, isLoading, hasMore]);

  if (!hydrated || !hasSelectedExam) {
    return <UnitsLoadingSkeleton />;
  }

  if (isLoading && allUnits.length === 0) {
    return <UnitsLoadingSkeleton />;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">데이터 로드 실패</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen w-full bg-white dark:bg-gray-900"
    >
      <div className="p-0">
        {allUnits.map(unit => (
          <UnitItem
            key={unit.id}
            unit={unit}
            handleSelect={(unitId: number) => {
              setSelectedUnitIds(prevSelected => {
                if (prevSelected.includes(unitId)) {
                  return prevSelected.filter(id => id !== unitId);
                }

                return [...prevSelected, unitId];
              });
            }}
            selected={selectedUnitIds.includes(unit.id)}
          />
        ))}

        {hasMore && (
          <div ref={ref} className="p-4 text-center">
            {isLoading && <UnitsLoadingSkeleton />}
            {!isLoading && (
              <p className="text-sm text-muted-foreground">
                스크롤하면 더 많은 항목을 불러옵니다.
              </p>
            )}
          </div>
        )}

        {!hasMore && allUnits.length > 0 && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">
              모든 항목을 불러왔습니다. (총 {totalCount}개)
            </p>
          </div>
        )}

        {allUnits.length === 0 && !isLoading && (
          <div className="p-8 text-center text-muted-foreground">
            <p>검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      <TwoFixedButton
        left={{
          children: selectedUnitIds.length > 0 ? "전체 선택 해제" : "전체 선택",
          props: {
            variant: "outline",
            onClick: () => {
              if (selectedUnitIds.length > 0) {
                setSelectedUnitIds([]);
              } else {
                setSelectedUnitIds(allUnits.map(unit => unit.id));
              }
            },
          },
        }}
        right={{
          children: "다음",
          props: {
            onClick: () => handleNext(selectedUnitIds),
            disabled: selectedUnitIds.length === 0,
          },
        }}
      />
    </motion.div>
  );
};

const QuestionCount = ({
  handleNext,
  isLoading,
  count,
  setCount,
}: {
  handleNext: () => void;
  count: number;
  setCount: (count: number) => void;
  isLoading: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.2 }}
      className="relative w-full bg-white"
    >
      <div className="flex flex-col items-start px-4">
        <h2 className="text-2xl font-semibold">몇 문제를</h2>
        <h2 className="text-2xl font-semibold">출제할까요?</h2>
        <div className="relative mt-22 flex w-full flex-row">
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            className="w-full border-b py-2 outline-0"
            data-testid="question-count-input"
          />
          <p className="absolute bottom-2.5 right-0 ml-2 min-w-fit text-gray-600 dark:text-gray-300">
            문제
          </p>
        </div>
        <FixedButton
          onClick={() => handleNext()}
          disabled={count < 1 || count > 100}
        >
          {isLoading ? <Spinner /> : "시작하기"}
        </FixedButton>
      </div>
    </motion.div>
  );
};

const MockUnit = () => {
  const [type, setType] = useState<"SELECT_UNIT" | "SELECT_QUESTION_COUNT">(
    "SELECT_UNIT"
  );
  const {
    handleCreate,
    isLoading: isCreateSessionLoading,
    setCount,
    setUnitIds,
    count,
  } = useQuestionSessionByMock();

  return (
    <div className="flex flex-col bg-white">
      <AnimatePresence initial={false} mode="wait">
        {type === "SELECT_UNIT" && (
          <Unit
            key="SELECT_UNIT"
            handleNext={(selectedUnitIds: number[]) => {
              setUnitIds(selectedUnitIds);
              setType("SELECT_QUESTION_COUNT");
            }}
          />
        )}
        {type === "SELECT_QUESTION_COUNT" && (
          <QuestionCount
            key="SELECT_QUESTION_COUNT"
            handleNext={handleCreate}
            setCount={setCount}
            count={count}
            isLoading={isCreateSessionLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MockUnit;
