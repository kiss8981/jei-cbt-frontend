import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import { Button } from "../button";
import { Spinner } from "../spinner";
import { useState } from "react";
import ResultDialog from "./ResultDialog";
import { useShallow } from "zustand/react/shallow"; // 가능하다면 사용 권장

interface SubmitButtonProps {
  isFirst?: boolean;
  onPrevious?: () => void;
  disabledSubmit?: boolean;
  loadingSubmit?: boolean;
  loadingPrevious?: boolean;
  isSession: boolean;
}

const SubmitButton = ({
  isFirst = false,
  onPrevious,
  disabledSubmit = false,
  loadingSubmit = false,
  loadingPrevious = false,
  isSession,
}: SubmitButtonProps) => {
  const [isOpenMockEndDialog, setIsOpenMockEndDialog] = useState(false);

  if (isSession) {
    const sessionType = useQuestionSessionStore(state => state.session?.type);
    const handleOpenDialog = () => setIsOpenMockEndDialog(true);
    return (
      <>
        {/* 다이얼로그는 열려있을 때만 렌더링하는 것이 성능상 유리합니다 */}
        {isOpenMockEndDialog && (
          <ResultDialog
            isResultOpen={isOpenMockEndDialog}
            setIsResultOpen={setIsOpenMockEndDialog}
            result={null}
          />
        )}

        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-[600px] pt-3"
          style={{
            paddingBottom: `calc(var(--safe-area-inset-bottom, 0px) + 12px)`,
          }}
        >
          <div
            className={`grid ${isFirst ? "grid-cols-1" : "grid-cols-2"} gap-3`}
          >
            {!isFirst && (
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={onPrevious}
                disabled={loadingPrevious || loadingSubmit}
              >
                {loadingPrevious ? <Spinner /> : "이전"}
              </Button>
            )}
            <Button
              type="submit"
              size="lg"
              disabled={disabledSubmit || loadingSubmit || loadingPrevious}
            >
              {loadingSubmit ? <Spinner /> : "제출"}
            </Button>
          </div>

          {/* MOCK 타입일 때만 '그만하고 채점하기' 표시 */}
          {sessionType === "MOCK" && (
            <Button
              type="button"
              variant="link"
              className="w-full text-xs text-center underline text-gray-500"
              onClick={handleOpenDialog}
            >
              그만하고 채점하기
            </Button>
          )}
        </div>
      </>
    );
  }

  // 일반 모드 (오답노트 등) UI
  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-[600px] pt-3"
      style={{
        paddingBottom: `calc(var(--safe-area-inset-bottom, 0px) + 12px)`,
      }}
    >
      <div className="grid grid-cols-1 gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={disabledSubmit || loadingSubmit || loadingPrevious}
        >
          {loadingSubmit ? <Spinner /> : "제출"}
        </Button>
      </div>
    </div>
  );
};

export default SubmitButton;
