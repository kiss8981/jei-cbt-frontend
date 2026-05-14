"use client";

import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { GetUnitListAppDto } from "@/lib/http/apis/dtos/app/unit/get-unit-list.app.dto";
import { useUnits } from "@/app/(app)/_hooks/useUnits";
import { GetUnitListQueryAppDto } from "@/lib/http/apis/dtos/app/unit/get-unit-list-query.app.dto";
import { useQuestionSessionByUnitId } from "@/app/(app)/_hooks/useQuestionSession";
import { FixedButton } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { QuestionType } from "@/lib/http/apis/dtos/common/question-type.enum";
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

const SelectQuestionTypes = ({
  setQuestionTypes,
  questionTypes,
  isLoading,
  handleNext,
}: {
  questionTypes: QuestionType[];
  setQuestionTypes: (questionTypes: QuestionType[]) => void;
  isLoading: boolean;
  handleNext: () => void;
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
        <h2 className="text-2xl font-semibold">문제 유형 선택</h2>
        <h2 className="text-2xl font-semibold">원하는 문제를 골라주세요</h2>
        <div className="relative mt-22 flex w-full flex-row">
          <div className="my-8 flex w-full flex-col space-y-4">
            {Object.values(QuestionType)
              .filter(
                type =>
                  type === QuestionType.MULTIPLE_CHOICE ||
                  type === QuestionType.MULTIPLE_CHOICE_INPUT ||
                  type === QuestionType.TRUE_FALSE ||
                  type === QuestionType.SHORT_ANSWER ||
                  type === QuestionType.INTERVIEW ||
                  type === QuestionType.MATCHING ||
                  type === QuestionType.MULTIPLE_SHORT_ANSWER
              )
              .map(type => (
                <div key={type} className="flex flex-row items-center space-x-4">
                  <input
                    type="checkbox"
                    id={type}
                    checked={questionTypes.includes(type)}
                    onChange={e => {
                      if (e.target.checked) {
                        setQuestionTypes([...questionTypes, type]);
                      } else {
                        setQuestionTypes(questionTypes.filter(t => t !== type));
                      }
                    }}
                    className="h-5 w-5"
                  />
                  <label htmlFor={type} className="select-none text-lg font-medium">
                    {type === QuestionType.MULTIPLE_CHOICE_INPUT
                      ? "객관식(보기입력)"
                      : type === QuestionType.MULTIPLE_CHOICE
                        ? "객관식"
                        : type === QuestionType.TRUE_FALSE
                          ? "OX 문제"
                          : type === QuestionType.SHORT_ANSWER
                            ? "단답형"
                            : type == QuestionType.INTERVIEW
                              ? "면접형"
                              : type == QuestionType.MATCHING
                                ? "연결형"
                                : type == QuestionType.MULTIPLE_SHORT_ANSWER
                                  ? "빈칸 채우기"
                                  : "기타"}
                  </label>
                </div>
              ))}
          </div>
        </div>
        <FixedButton
          onClick={() => handleNext()}
          disabled={questionTypes.length === 0 || isLoading}
        >
          {isLoading ? <Spinner /> : "시작하기"}
        </FixedButton>
      </div>
    </motion.div>
  );
};

const SelectUnit = ({
  handleNext,
}: {
  handleNext: (unitId: number) => void;
}) => {
  const { examId, hydrated, hasSelectedExam } = useSelectedExamGuard();
  const [allUnits, setAllUnits] = useState<GetUnitListAppDto[]>([]);
  const [searchParams, setSearchParams] = useState<GetUnitListQueryAppDto>({
    page: INITIAL_PAGE,
    limit: ITEMS_PER_PAGE,
    examId: examId ?? undefined,
  });
  const [hasMore, setHasMore] = useState(true);
  const { units, totalCount, isLoading, error } = useUnits(searchParams);
  const [selectedUnitId, setUnitId] = useState<number | null>(null);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  });

  useEffect(() => {
    setAllUnits([]);
    setHasMore(true);
    setUnitId(null);
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
    <div className="w-full bg-white dark:bg-gray-900">
      <div className="p-0">
        {allUnits.map(unit => (
          <UnitItem
            key={unit.id}
            unit={unit}
            handleSelect={setUnitId}
            selected={selectedUnitId == unit.id}
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

      <FixedButton
        size="lg"
        disabled={!selectedUnitId}
        onClick={() => {
          if (selectedUnitId) {
            handleNext(selectedUnitId);
          }
        }}
        data-testid="start-quiz-button"
      >
        다음
      </FixedButton>
    </div>
  );
};

const Unit = () => {
  const [type, setType] = useState<"SELECT_UNIT" | "SELECT_QUESTION_TYPES">(
    "SELECT_UNIT"
  );
  const {
    handleCreate,
    isLoading: isCreateSessionLoading,
    setUnitId,
    setQuestionTypes,
    questionTypes,
  } = useQuestionSessionByUnitId();

  return (
    <div className="flex flex-col bg-white">
      <AnimatePresence initial={false} mode="wait">
        {type === "SELECT_UNIT" && (
          <SelectUnit
            key="SELECT_UNIT"
            handleNext={(selectedUnitId: number) => {
              setUnitId(selectedUnitId);
              setType("SELECT_QUESTION_TYPES");
            }}
          />
        )}
        {type === "SELECT_QUESTION_TYPES" && (
          <SelectQuestionTypes
            key="SELECT_QUESTION_TYPES"
            handleNext={handleCreate}
            setQuestionTypes={setQuestionTypes}
            questionTypes={questionTypes}
            isLoading={isCreateSessionLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Unit;
