"use client";

import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { GetUnitListAppDto } from "@/lib/http/apis/dtos/app/unit/get-unit-list.app.dto";
import { useUnits } from "@/app/(app)/_hooks/useUnits";
import { GetUnitListQueryAppDto } from "@/lib/http/apis/dtos/app/unit/get-unit-list-query.app.dto";
import useAppRouter from "@/hooks/useAppRouter";
import { useQuestionSessionByUnitId } from "@/app/(app)/_hooks/useQuestionSession";
import { Button, FixedButton } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { QuestionType } from "@/lib/http/apis/dtos/common/question-type.enum";

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
      className={cn("p-4 bg-background")}
      onClick={() => handleSelect(unit.id)}
      style={{ cursor: "pointer" }}
      data-testid={`unit-item-${unit.id}`}
    >
      <div className={cn("flex flex-row items-center justify-between")}>
        <h3 className="text-lg font-semibold w-52 text-gray-800 dark:text-gray-100 whitespace-pre-wrap truncate">
          {unit.name}
        </h3>
        {selected && (
          <Check
            className="text-green-500"
            size={20}
            aria-label="선택됨"
            data-testid="selected-icon"
          />
        )}
      </div>
      <Separator className="my-2" />
    </div>
  );
};

export const UnitsLoadingSkeleton = () => (
  <div className="h-screen w-full bg-white dark:bg-gray-900 overflow-y-auto relative px-4 space-y-2">
    {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
      <div
        key={i}
        className="flex flex-col space-y-2"
        data-testid="unit-skeleton"
      >
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
      className="w-full bg-white  relative"
    >
      <div className="flex flex-col items-start px-4">
        <h2 className="text-2xl font-semibold">풀고 싶은</h2>
        <h2 className="text-2xl font-semibold">문제 유형이 있나요?</h2>
        {/* input */}
        <div className="flex flex-row w-full mt-22 relative">
          <div className="flex flex-col w-full space-y-4 my-8">
            {Object.values(QuestionType)
              .filter(
                type =>
                  type === QuestionType.MULTIPLE_CHOICE ||
                  type === QuestionType.TRUE_FALSE ||
                  type === QuestionType.SHORT_ANSWER ||
                  type === QuestionType.INTERVIEW ||
                  type === QuestionType.MATCHING ||
                  type === QuestionType.MULTIPLE_SHORT_ANSWER
              )
              .map(type => (
                <div
                  key={type}
                  className="flex flex-row items-center space-x-4"
                >
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
                    className="w-5 h-5"
                  />
                  <label
                    htmlFor={type}
                    className="text-lg font-medium select-none"
                  >
                    {type === QuestionType.MULTIPLE_CHOICE
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
  const [allUnits, setAllUnits] = useState<GetUnitListAppDto[]>([]);
  const [searchParams, setSearchParams] = useState<GetUnitListQueryAppDto>({
    page: INITIAL_PAGE,
    limit: ITEMS_PER_PAGE,
  });
  const [hasMore, setHasMore] = useState(true);
  const { units, totalCount, isLoading, error } = useUnits(searchParams);
  const [selectedUnitId, setUnitId] = useState<number | null>(null);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  });

  useEffect(() => {
    if ((units as GetUnitListAppDto[]).length > 0) {
      const newUnits = (units as GetUnitListAppDto[]).filter(
        (unit: GetUnitListAppDto) =>
          !allUnits.some(existingUnit => existingUnit.id === unit.id)
      );

      setAllUnits(prev => [...prev, ...newUnits]);
      if (allUnits.length + newUnits.length >= totalCount && totalCount > 0) {
        setHasMore(false);
      }
    }
  }, [units, totalCount]);

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      setSearchParams(prev => ({
        ...prev,
        page: (prev.page || 0) + 1,
      }));
    }
  }, [inView, isLoading, hasMore]);

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

        {/* 무한 스크롤 트리거 & 로딩 인디케이터 */}
        {hasMore && (
          <div ref={ref} className="p-4 text-center">
            {/* 로딩 중일 때만 스켈레톤 표시 */}
            {isLoading && <UnitsLoadingSkeleton />}
            {!isLoading && (
              <p className="text-sm text-muted-foreground">
                스크롤하여 더 많은 항목을 불러오세요.
              </p>
            )}
          </div>
        )}

        {/* 모든 데이터 로드 완료 메시지 */}
        {!hasMore && allUnits.length > 0 && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">
              모든 항목을 불러왔습니다. (총 {totalCount}개)
            </p>
          </div>
        )}

        {/* 데이터가 아예 없는 경우 */}
        {allUnits.length === 0 && !isLoading && (
          <div className="p-8 text-center text-muted-foreground">
            <p>검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      <FixedButton
        size="lg"
        disabled={!selectedUnitId}
        onClick={async () => {
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
        {type === "SELECT_QUESTION_TYPES" && ( // ➡️ 조건부 렌더링
          <SelectQuestionTypes
            key="SELECT_QUESTION_COUNT"
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
