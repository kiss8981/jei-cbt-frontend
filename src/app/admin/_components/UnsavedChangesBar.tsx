"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw, Save } from "lucide-react";
import { Spinner } from "../../../components/ui/spinner"; // 경로 유지

/**
 * 변경 사항 바 컴포넌트의 props 타입을 정의합니다.
 */
interface UnsavedChangesBarProps {
  isDirty: boolean;
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
}

/**
 * 변경 사항이 있을 때 하단에 고정되어 나타나는 바 컴포넌트입니다.
 * 애니메이션 효과와 사이드바를 고려한 레이아웃이 적용되었습니다.
 *
 * @param {UnsavedChangesBarProps} props
 */
const UnsavedChangesBar: React.FC<UnsavedChangesBarProps> = ({
  isDirty,
  onSave,
  onReset,
  isSaving,
}) => {
  // 사이드바의 너비 (일반적으로 Tailwind 기준 64px 또는 16rem = 256px 등 프로젝트에 따라 다름)를 고려하여
  // 데스크톱 환경(lg:)에서는 256px 만큼 오른쪽에서 시작하도록 설정합니다.
  const sidebarWidthClass = "lg:left-[256px]";

  return (
    <div
      className={`
        fixed inset-x-0 bottom-0 z-50 p-4 border-t bg-white shadow-2xl 
        transition-transform duration-500 ease-in-out
        ${sidebarWidthClass} 
        ${isDirty ? "translate-y-0" : "translate-y-full"} 
      `}
      style={{
        // isDirty 상태가 false일 때만 display: none 대신 translateY를 사용하여 애니메이션을 유지합니다.
        // isDirty가 true일 때, lg:left-[256px]가 적용되어 오른쪽 컨텐츠 영역에만 바가 나타납니다.
        left: isDirty ? "0" : "0", // 모바일 우선이므로 기본 left는 0. 데스크톱에서는 lg:left-[256px]가 오버라이드.
      }}
    >
      <div className="max-w-full lg:max-w-7xl mx-auto flex items-center justify-between">
        <span className="text-base font-semibold text-gray-700">
          ⚠️ 변경 사항이 있습니다. 저장하시겠습니까?
        </span>
        <div className="flex gap-3">
          {/* 변경 사항 취소 버튼 */}
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={isSaving}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            변경 취소
          </Button>

          {/* 저장 버튼 */}
          <Button
            type="submit"
            onClick={() => [onSave(), console.log("123")]}
            disabled={isSaving}
            className="bg-sky-600 hover:bg-sky-700"
          >
            {isSaving ? (
              <Spinner className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? "저장 중..." : "수정하기"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesBar;
