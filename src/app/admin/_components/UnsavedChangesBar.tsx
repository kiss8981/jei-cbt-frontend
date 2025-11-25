"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw, Save, AlertCircle } from "lucide-react";
import { Spinner } from "../../../components/ui/spinner";

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
 * Glassmorphism 효과와 반응형 레이아웃이 적용되었습니다.
 */
const UnsavedChangesBar: React.FC<UnsavedChangesBarProps> = ({
  isDirty,
  onSave,
  onReset,
  isSaving,
}) => {
  // 사이드바 너비 (256px)
  const sidebarWidth = "256px";

  return (
    <div
      className={`
        fixed bottom-0 right-0 z-50 
        border-t border-gray-200 dark:border-gray-700
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]
        transition-all duration-500 ease-in-out transform
        ${isDirty ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
      `}
      style={{
        // 모바일: 전체 너비 (left: 0)
        // PC (lg 이상): 사이드바 너비만큼 왼쪽을 비움
        left: 0,
        // Tailwind의 lg 브레이크포인트(1024px)를 기준으로 미디어 쿼리 스타일 주입
        // (JS로 처리하거나 Tailwind 클래스로 lg:left-[256px]를 사용하는 것과 동일 효과이나,
        // calc()를 사용하여 너비를 명확히 제어합니다.)
        width: "100%",
      }}
    >
      {/* PC에서 사이드바 영역을 제외하고 컨텐츠를 표시하기 위한 래퍼 
        lg:pl-[256px]를 통해 내부 컨텐츠만 오른쪽으로 밀어줍니다.
        이렇게 하면 배경(Blur Bar)은 화면 전체에 이어지되, 내용은 본문 영역에만 뜹니다.
      */}
      <div className="w-full lg:pl-[256px] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          {/* 메시지 영역 */}
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
              <span className="font-semibold text-sm sm:text-base">
                저장되지 않은 변경 사항이 있습니다.
              </span>
              <span className="hidden sm:inline text-gray-400">|</span>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                페이지를 벗어나면 내용이 사라집니다.
              </span>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex w-full sm:w-auto gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onReset}
              disabled={isSaving}
              className="flex-1 sm:flex-none text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              취소
            </Button>

            <Button
              type="submit"
              onClick={onSave}
              disabled={isSaving}
              className={`
                flex-1 sm:flex-none shadow-md transition-all hover:scale-105 active:scale-95
                ${
                  isSaving ? "bg-sky-500" : "bg-sky-600 hover:bg-sky-700"
                } text-white
              `}
            >
              {isSaving ? (
                <Spinner className="w-4 h-4 mr-2 text-white" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving ? "저장 중..." : "변경사항 저장"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesBar;
