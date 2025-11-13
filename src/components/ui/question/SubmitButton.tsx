import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import { Button } from "../button";
import { Spinner } from "../spinner";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import useAppRouter from "@/hooks/useAppRouter";
import { useRouter } from "next/navigation";
import { MockEndDialog } from "./ResultDialog";

const SubmitButton = ({
  isFirst = false,
  onPrevious,
  disabledSubmit = false,
  loadingSubmit = false,
  loadingPrevious = false,
}: {
  isFirst?: boolean;
  onPrevious?: () => void;
  disabledSubmit?: boolean;
  loadingSubmit?: boolean;
  loadingPrevious?: boolean;
}) => {
  const { question: questionMap, session } = useQuestionSessionStore(
    state => state
  );
  const { navigate } = useAppRouter();
  const router = useRouter();
  const [isOpenMockEndDialog, setIsOpenMockEndDialog] = useState(false);

  const onClickMockEnd = () => {
    router.replace(`/questions/sessions/${session?.id}/result`);
  };

  return (
    <>
      <MockEndDialog
        isOpen={isOpenMockEndDialog}
        setOpen={setIsOpenMockEndDialog}
        onConfirm={onClickMockEnd}
      />
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
              onClick={() => {
                onPrevious && onPrevious();
              }}
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
        {session?.type === "MOCK" && (
          <Button
            type="button"
            variant="link"
            className="w-full text-xs text-center underline text-gray-500"
            onClick={setIsOpenMockEndDialog.bind(null, true)}
          >
            그만하고 채점하기
          </Button>
        )}
      </div>
    </>
  );
};

export default SubmitButton;
