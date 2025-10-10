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
  <div className="space-y-4 p-4 w-full">
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

const Units = () => {
  const [allUnits, setAllUnits] = useState<GetUnitListAppDto[]>([]);
  const [searchParams, setSearchParams] = useState<GetUnitListQueryAppDto>({
    page: INITIAL_PAGE,
    limit: ITEMS_PER_PAGE,
  });
  const [hasMore, setHasMore] = useState(true);
  const { units, totalCount, isLoading, error } = useUnits(searchParams);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const { handleCreate, isLoading: isCreateSessionLoading } =
    useQuestionSessionByUnitId(selectedUnitId!);

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
    <div className="h-screen w-full bg-white dark:bg-gray-900 overflow-y-auto relative">
      <div className="p-0">
        {allUnits.map(unit => (
          <UnitItem
            key={unit.id}
            unit={unit}
            handleSelect={setSelectedUnitId}
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
        disabled={!selectedUnitId || isCreateSessionLoading}
        onClick={async () => {
          if (selectedUnitId) {
            await handleCreate();
          }
        }}
        data-testid="start-quiz-button"
      >
        {isCreateSessionLoading ? <Spinner /> : "시작"}
      </FixedButton>
    </div>
  );
};

export default Units;
