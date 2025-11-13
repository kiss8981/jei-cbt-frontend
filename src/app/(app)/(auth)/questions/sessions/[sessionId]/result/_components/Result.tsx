"use client";

import { useQuestionSessionResult } from "@/app/(app)/_hooks/useQuestionSession";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const QuestionSessionResult = ({ sessionId }: { sessionId: number }) => {
  const { isLoading, result } = useQuestionSessionResult(sessionId);

  if (isLoading) {
    return (
      <div className="h-[85vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // result가 null일 경우의 예외 처리 (Optional: API 상태에 따라 추가 필요)
  if (!result) {
    return (
      <div className="p-4 text-center text-red-500">
        세션 결과 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  const { totalQuestions, correctAnswers, durationMs, results } = result;
  const answeredQuestions = results.filter(d => d.isCorrect !== null).length;
  const wrongAnswers = results.filter(d => d.isCorrect === false).length;
  const unansweredQuestions = totalQuestions - answeredQuestions;

  // 정답률 계산 (totalQuestions 대신 answeredQuestions 기준으로 계산할 수도 있습니다)
  const score =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  const durationSeconds = Math.round(durationMs / 1000);
  const formattedDuration = `${Math.floor(durationSeconds / 60)}분 ${
    durationSeconds % 60
  }초`;

  // 정/오답/미응시 상태에 따른 Badge 스타일 반환 함수
  const getResultBadge = (isCorrect: boolean | null) => {
    if (isCorrect === true) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 w-16 text-xs justify-center">
          정답
        </Badge>
      );
    }
    if (isCorrect === false) {
      return (
        <Badge variant="destructive" className="w-16 text-xs justify-center">
          오답
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="w-16 text-xs justify-center">
        미응답
      </Badge>
    );
  };

  return (
    <div className="flex flex-col max-w-xl mx-auto p-3 md:p-8 bg-white space-y-6">
      {/* 1. 세션 결과 요약 카드 (모바일 최적화) */}
      <Card className="shadow-md border-blue-200">
        <CardHeader className="text-center p-4">
          <CardTitle className="text-3xl font-extrabold text-blue-700">
            {score}점
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 mt-1">
            총 문항 <span className="font-bold">{totalQuestions}</span>개,{" "}
            <span className="font-bold text-green-600">{correctAnswers}</span>개
            정답
          </CardDescription>
        </CardHeader>
        {/* 모바일에서는 세로로 분할하여 보기 쉽도록 조정 */}
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-center">
            {/* 정답/오답/미응답 요약 */}
            <div className="space-y-1 border-r border-gray-200">
              <div className="text-xs text-gray-500">정답 / 오답</div>
              <div className="text-xl font-bold">
                <span className="text-green-600">{correctAnswers}</span> /{" "}
                <span className="text-red-600">{wrongAnswers}</span>
              </div>
            </div>
            {/* 전체/응시 시간 */}
            <div className="space-y-1">
              <div className="text-xs text-gray-500">응시 시간</div>
              <div className="text-xl font-bold text-gray-700">
                {formattedDuration}
              </div>
            </div>

            <Separator className="col-span-2 my-2" />

            {/* 응시/미응시 상세 */}
            <div className="space-y-1 border-r border-gray-200">
              <div className="text-xs text-gray-500">응시 문항</div>
              <div className="text-lg font-bold">
                {answeredQuestions} / {totalQuestions}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-500">미응시</div>
              <div className="text-lg font-bold text-gray-500">
                {unansweredQuestions}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* 2. 문항별 상세 결과 목록 (테이블 최적화) */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-700">
          🔍 문항별 상세 결과 및 해설
        </h2>

        {/* 모바일에서는 가로 스크롤 허용 */}
        <div className="border rounded-lg overflow-x-scroll">
          <Table className="min-w-[550px]">
            {" "}
            {/* 최소 너비 지정 */}
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead className="w-[40px] p-2">No.</TableHead>
                <TableHead className="w-[180px] p-2">문항</TableHead>{" "}
                {/* 제목 영역 확장 */}
                <TableHead className="text-center w-[70px] p-2">결과</TableHead>
                <TableHead className="w-[120px] p-2">내 답안</TableHead>
                <TableHead className="w-[120px] p-2">정답</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {results.map((detail, index) => (
                <>
                  <TableRow
                    key={detail.questionId}
                    className={
                      detail.isCorrect === false
                        ? "bg-red-50 hover:bg-red-100/70"
                        : detail.isCorrect === true
                        ? "bg-green-50/50 hover:bg-green-50"
                        : "bg-gray-50 hover:bg-gray-100/70"
                    }
                  >
                    <TableCell className="font-medium p-2 text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-semibold p-2 text-sm whitespace-normal">
                      {detail.title}
                    </TableCell>
                    <TableCell className="text-center p-2">
                      {getResultBadge(detail.isCorrect)}
                    </TableCell>
                    <TableCell
                      className={
                        detail.isCorrect === false
                          ? "text-red-600 font-medium p-2"
                          : "p-2"
                      }
                    >
                      {detail.userAnswer || "-"}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium p-2">
                      {detail.correctAnswer || "-"}
                    </TableCell>
                  </TableRow>
                  {/* 해설 표시 (오답이거나 해설 데이터가 있을 경우) */}
                  {(detail.isCorrect === false || detail.explanation) && (
                    <TableRow className="bg-white border-b-0">
                      <TableCell
                        colSpan={5}
                        className="py-2 px-4 border-t-0 text-xs"
                      >
                        <p className="font-bold text-gray-700 mb-1">💡 해설:</p>
                        <p className="whitespace-pre-wrap text-gray-600 pl-2">
                          {(detail.explanation &&
                            detail.explanation.replace(/\r\n/g, "\n")) ||
                            "제공된 해설이 없습니다."}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};

export default QuestionSessionResult;
