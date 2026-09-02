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

// 1. Dialog 껍데기를 제거하고 '내용(Content)'만 남긴 컴포넌트로 분리
const MockEndContent = ({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>모의고사 종료</DialogTitle>
        <DialogDescription>모의고사를 종료하시겠습니까?</DialogDescription>
        <DialogDescription>
          현재까지의 답안으로 채점이 진행됩니다.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="grid grid-cols-2 gap-2 sm:gap-0">
        <Button variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button color="green" onClick={onConfirm}>
          종료하기
        </Button>
      </DialogFooter>
    </DialogContent>
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
  const router = useRouter();
  const { navigate } = useAppRouter();

  // 2. [최적화] 전체 state를 구독하지 않고 필요한 값만 개별 구독하여 리렌더링 최소화
  // (만약 store 라이브러리가 zustand라면 useShallow 사용 권장, 기본 방식이라면 아래처럼 분리)
  const session = useQuestionSessionStore(state => state.session);
  const nextQuestion = useQuestionSessionStore(state => state.nextQuestion);
  const hasMoreQuestions = useQuestionSessionStore(
    state => state.hasMoreQuestions
  );

  // 세션 정보가 로딩되기 전이라면 아무것도 렌더링하지 않음 (오류 방지)
  if (!session) return null;

  const handleNext = async () => {
    setIsResultOpen(false);
    // 다이얼로그 닫힘 애니메이션 등을 고려해 약간의 지연 후 실행하거나 바로 실행
    nextQuestion();
  };

  const onClickMockEnd = () => {
    router.replace(`/questions/sessions/${session.id}/result`);
  };

  return (
    // 3. Dialog Root는 여기서 단 한 번만 선언 (중요!)
    // 내부 컨텐츠만 조건에 따라 스위칭합니다.
    <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
      {session.type === SessionType.MOCK ? (
        <MockEndContent
          onCancel={() => setIsResultOpen(false)}
          onConfirm={onClickMockEnd}
        />
      ) : (
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle
              className={correct ? "text-green-600" : "text-red-600"}
            >
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
                <div className="items-start justify-between flex flex-col">
                  <span className="text-muted-foreground">정답</span>
                  <span className="font-semibold mt-1 break-keep">
                    {result.answer}
                  </span>
                </div>
              </div>
            )}

            {result?.explanation && (
              <div className="flex max-h-[240px] min-h-0 flex-col rounded-xl bg-muted p-4 text-sm leading-relaxed">
                <div className="mb-1 shrink-0 font-semibold">해설</div>
                <p className="min-h-0 overflow-y-auto overscroll-contain whitespace-pre-wrap break-words pr-1">{result.explanation}</p>
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
      )}
    </Dialog>
  );
};

export default ResultDialog;
