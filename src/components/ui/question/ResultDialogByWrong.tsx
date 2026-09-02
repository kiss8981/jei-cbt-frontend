import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import { SubmissionAnswerResponseAppDto } from "@/lib/http/apis/dtos/app/question/submission-answer-response.app.dto";
import { Button } from "../button";
import useAppRouter from "@/hooks/useAppRouter";
import useAppVersion from "@/hooks/useAppVersion";
import { useRouter } from "next/navigation";

const ResultDialogByWrong = ({
  result,
  isResultOpen,
  setIsResultOpen,
}: {
  result: SubmissionAnswerResponseAppDto | null;
  isResultOpen: boolean;
  setIsResultOpen: (open: boolean) => void;
}) => {
  const correct = result?.isCorrect ?? false;
  const { navigate } = useAppRouter();
  const router = useRouter();
  const { supportsNativeBottomTabs } = useAppVersion();

  const handleClose = () => {
    setIsResultOpen(false);

    if (supportsNativeBottomTabs) {
      navigate("back");
      return;
    }

    router.back();
  };

  return (
    <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className={correct ? "text-green-600" : "text-red-600"}>
            {correct ? "정답입니다 🎉" : "오답입니다 😥"}
          </DialogTitle>
          <DialogDescription>
            {correct
              ? "잘하셨어요! 아래 해설을 확인해보세요."
              : "아쉽지만, 다음 기회에 도전해보세요!"}
          </DialogDescription>
        </DialogHeader>

        {/* 정오표 및 해설 블록 */}
        <div className="space-y-4">
          {result?.answer && (
            <div className="rounded-xl border p-3 text-sm">
              {result?.answer && (
                <>
                  <div className="items-start justify-between flex flex-col">
                    <span className="text-muted-foreground">정답</span>
                    <span className="font-semibold mt-1 break-keep">
                      {result.answer}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {result?.explanation && (
            <div className="flex max-h-[240px] min-h-0 flex-col rounded-xl bg-muted p-4 text-sm leading-relaxed">
              <div className="mb-1 shrink-0 font-semibold">해설</div>
              <p className="min-h-0 overflow-y-auto overscroll-contain whitespace-pre-wrap break-words pr-1">{result.explanation}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button onClick={handleClose}>틀린 문제 확인하러 가기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResultDialogByWrong;
