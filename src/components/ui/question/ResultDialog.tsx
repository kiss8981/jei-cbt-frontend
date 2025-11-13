import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import { SubmissionAnswerResponseAppDto } from "@/lib/http/apis/dtos/app/question/submission-answer-response.app.dto";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import { Button } from "../button";
import useAppRouter from "@/hooks/useAppRouter";
import { SessionType } from "@/lib/http/apis/dtos/common/session-type.enum";
import { useRouter } from "next/navigation";

export const MockEndDialog = ({
  isOpen,
  setOpen,
  onConfirm,
}: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>모의고사 종료</DialogTitle>
          <DialogDescription>모의고사를 종료하시겠습니까?</DialogDescription>
          <DialogDescription>
            현재까지의 답안으로 채점이 진행됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
            }}
          >
            취소
          </Button>
          <Button color="green" onClick={onConfirm}>
            종료하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ResultDialog = ({
  result,
  isResultOpen,
  setIsResultOpen,
}: {
  result: SubmissionAnswerResponseAppDto | null;
  isResultOpen: boolean;
  setIsResultOpen: (open: boolean) => void;
}) => {
  const correct = result?.isCorrect ?? false;

  const {
    question: questionMap,
    session,
    isFirstQuestion,
    previousQuestion,
    nextQuestion,
    hasMoreQuestions,
  } = useQuestionSessionStore(state => state);
  const { navigate } = useAppRouter();
  const router = useRouter();
  const handleNext = async () => {
    setIsResultOpen(false);
    nextQuestion();
  };

  const onClickMockEnd = () => {
    router.replace(`/questions/sessions/${session?.id}/result`);
  };

  if (session.type == SessionType.MOCK) {
    return (
      <MockEndDialog
        isOpen={isResultOpen}
        setOpen={setIsResultOpen}
        onConfirm={onClickMockEnd}
      />
    );
  }

  return (
    <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
      <DialogContent className="sm:max-w-lg">
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
            <div className="rounded-xl bg-muted p-4 text-sm leading-relaxed">
              <div className="font-semibold mb-1">해설</div>
              <p className="whitespace-pre-wrap">{result.explanation}</p>
            </div>
          )}
        </div>

        {!hasMoreQuestions && (
          <div className="text-sm text-muted-foreground text-center mt-2">
            마지막 문제입니다. 첫 화면으로 돌아갑니다.
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-3">
          {!hasMoreQuestions ? (
            <Button
              variant="outline"
              onClick={() => {
                navigate("reset", "/", "(tabs)");
              }}
            >
              홈으로 돌아가기
            </Button>
          ) : (
            <Button onClick={handleNext}>다음 문제</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResultDialog;
