import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../button";

type MultipleChoiceSegmentProps = {
  /** 표시할 값(숫자) 목록 */
  values: number[];

  /** 단일(false) / 복수(true) 선택 모드 */
  multiple?: boolean;

  /** 컨트롤드 값 (단일) */
  value?: number | null;
  /** 컨트롤드 값 (복수) */
  valuesControlled?: number[];

  /** 언컨트롤드 초기값 (단일) */
  defaultValue?: number | null;
  /** 언컨트롤드 초기값 (복수) */
  defaultValues?: number[];

  /** 선택 변경 콜백 */
  onChange?: (v: number | null | number[]) => void;

  /** 복수선택 시 최대 선택 개수 제한 (예: 2) */
  maxSelected?: number;

  /** 그리드 열 개수 (기본 자동 플렉스) */
  columns?: number;

  /** 선택 해제 버튼 노출 여부 */
  clearable?: boolean;

  /** 전체 비활성화 */
  disabled?: boolean;

  /** 키보드 Enter 입력 시 호출(부모에서 제출 처리용) */
  onEnter?: () => void;

  /** 버튼 라벨 커스터마이즈 (기본: 숫자 자체) */
  renderItemLabel?: (n: number) => React.ReactNode;

  /** aria 레이블 */
  ariaLabel?: string;
};

export function MultipleChoiceSegment({
  values,
  multiple = false,
  value,
  valuesControlled,
  defaultValue = null,
  defaultValues = [],
  onChange,
  maxSelected,
  columns,
  clearable = false,
  disabled = false,
  onEnter,
  renderItemLabel,
  ariaLabel = "선택지",
}: MultipleChoiceSegmentProps) {
  // 내부 상태 (컨트롤드/언컨트롤드 겸용)
  const isControlledSingle = !multiple && value !== undefined;
  const isControlledMulti = multiple && valuesControlled !== undefined;

  const [innerSingle, setInnerSingle] = useState<number | null>(defaultValue);
  const [innerMulti, setInnerMulti] = useState<number[]>(defaultValues);

  const selectedSingle = isControlledSingle ? value ?? null : innerSingle;
  const selectedMulti = isControlledMulti ? valuesControlled ?? [] : innerMulti;

  const containerRef = useRef<HTMLDivElement>(null);
  const itemCount = values.length;

  const setSingle = (v: number | null) => {
    if (isControlledSingle) onChange?.(v);
    else {
      setInnerSingle(v);
      onChange?.(v);
    }
  };

  const setMulti = (next: number[]) => {
    if (isControlledMulti) onChange?.(next);
    else {
      setInnerMulti(next);
      onChange?.(next);
    }
  };

  const toggle = (n: number) => {
    if (disabled) return;
    if (!multiple) {
      setSingle(n === selectedSingle ? null : n);
      return;
    }
    const exists = selectedMulti.includes(n);
    if (exists) {
      setMulti(selectedMulti.filter(v => v !== n));
    } else {
      if (maxSelected && selectedMulti.length >= maxSelected) return;
      setMulti([...selectedMulti, n]);
    }
  };

  const clear = () => {
    if (disabled) return;
    if (multiple) setMulti([]);
    else setSingle(null);
  };

  // 키보드 지원: 숫자키로 선택/토글, ←→로 이동, Enter로 onEnter 호출
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      // 숫자키 (1..9, 0은 무시)
      const num = Number(e.key);
      if (!Number.isNaN(num) && num >= 1 && num <= itemCount) {
        e.preventDefault();
        toggle(values[num - 1]);
        return;
      }

      // 좌우 이동: 단일선택 모드에서만 인접 이동(복수는 토글 중심)
      if (!multiple && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();
        if (!itemCount) return;

        const ordered = values;
        const idx =
          selectedSingle === null
            ? 0
            : Math.max(
                0,
                ordered.findIndex(v => v === selectedSingle)
              );
        const nextIdx =
          e.key === "ArrowLeft"
            ? (idx - 1 + itemCount) % itemCount
            : (idx + 1) % itemCount;

        setSingle(ordered[nextIdx]);
        return;
      }

      if (e.key === "Enter" && onEnter) {
        e.preventDefault();
        onEnter();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    values,
    itemCount,
    multiple,
    selectedSingle,
    selectedMulti,
    disabled,
    onEnter,
  ]);

  const gridClass = useMemo(() => {
    if (!columns) return "w-full flex gap-2";
    return `grid gap-2 grid-cols-${Math.min(columns, 12)}`;
  }, [columns]);

  const isOn = (n: number) =>
    multiple ? selectedMulti.includes(n) : selectedSingle === n;

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        role={multiple ? "group" : "radiogroup"}
        aria-label={ariaLabel}
        className={gridClass}
      >
        {values.map(n => {
          const on = isOn(n);
          return (
            <Button
              key={n}
              type="button"
              role={multiple ? "checkbox" : "radio"}
              aria-checked={on}
              data-state={on ? "on" : "off"}
              variant={on ? "default" : "outline"}
              disabled={
                disabled ||
                (!!maxSelected &&
                  multiple &&
                  !on &&
                  selectedMulti.length >= maxSelected)
              }
              onClick={() => toggle(n)}
              className={`h-12 ${
                columns ? "w-full" : "flex-1"
              } text-base rounded-md border`}
              aria-label={`${n} ${on ? "선택됨" : "선택"}`}
            >
              {renderItemLabel ? renderItemLabel(n) : n}
            </Button>
          );
        })}
      </div>

      {clearable && (
        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clear}
            disabled={disabled}
          >
            선택 해제
          </Button>
        </div>
      )}
    </div>
  );
}
