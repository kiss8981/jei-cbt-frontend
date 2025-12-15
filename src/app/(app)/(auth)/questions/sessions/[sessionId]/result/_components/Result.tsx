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
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils"; // shadcn의 cn 유틸리티 사용 가정

const QuestionSessionResult = ({ sessionId }: { sessionId: number }) => {
  const { isLoading, result } = useQuestionSessionResult(sessionId);

  if (isLoading) {
    return (
      <div className="h-[85vh] flex items-center justify-center">
        <Spinner className="w-8 h-8 text-blue-600" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-8 text-center text-gray-500">
        <XCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
        세션 결과 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  const { totalQuestions, correctAnswers, durationMs, results } = result;
  const answeredQuestions = results.filter(d => d.isCorrect !== null).length;
  const wrongAnswers = results.filter(d => d.isCorrect === false).length;
  const unansweredQuestions = totalQuestions - answeredQuestions;

  const score =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  const durationSeconds = Math.round(durationMs / 1000);
  const formattedDuration = `${Math.floor(durationSeconds / 60)}분 ${
    durationSeconds % 60
  }초`;

  return (
    <div className="flex flex-col max-w-lg mx-auto p-4 bg-gray-50/50 min-h-screen space-y-6 pb-20">
      {/* 1. 상단 점수 및 요약 카드 */}
      <Card className="border-none shadow-lg bg-white overflow-hidden relative">
        {/* 상단 장식용 컬러 바 */}
        <div
          className={cn(
            "h-2 w-full absolute top-0 left-0",
            score >= 80
              ? "bg-green-500"
              : score >= 50
              ? "bg-blue-500"
              : "bg-red-500"
          )}
        />

        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Total Score
            </span>
            <span
              className={cn(
                "text-5xl font-extrabold tracking-tight",
                score >= 80
                  ? "text-green-600"
                  : score >= 50
                  ? "text-blue-600"
                  : "text-red-600"
              )}
            >
              {score}
              <span className="text-2xl text-gray-400 ml-1 font-semibold">
                점
              </span>
            </span>
          </CardTitle>
          <CardDescription className="flex items-center justify-center gap-2 mt-2 bg-gray-100 py-1 px-3 rounded-full w-fit mx-auto">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-medium">
              {formattedDuration} 소요
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-2">
          <div className="grid grid-cols-3 gap-2 mt-4">
            <StatBox
              label="정답"
              value={correctAnswers}
              icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
              bgColor="bg-green-50"
              textColor="text-green-700"
            />
            <StatBox
              label="오답"
              value={wrongAnswers}
              icon={<XCircle className="w-4 h-4 text-red-500" />}
              bgColor="bg-red-50"
              textColor="text-red-700"
            />
            <StatBox
              label="미응시"
              value={unansweredQuestions}
              icon={<HelpCircle className="w-4 h-4 text-gray-400" />}
              bgColor="bg-gray-100"
              textColor="text-gray-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. 문항별 상세 리스트 (카드 형태 변환) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <BookOpen className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-bold text-gray-800">문항별 상세 결과</h2>
        </div>

        <div className="space-y-3">
          {results.map((detail, index) => {
            const isCorrect = detail.isCorrect;
            const isWrong = isCorrect === false;

            return (
              <Card
                key={detail.questionId}
                className={cn(
                  "border shadow-sm overflow-hidden transition-all",
                  isCorrect
                    ? "border-green-200 bg-white"
                    : isWrong
                    ? "border-red-200 bg-white"
                    : "border-gray-200 bg-gray-50"
                )}
              >
                {/* 헤더: 번호, 뱃지, 문제제목 */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      Q{index + 1}
                    </span>
                    {isCorrect === true && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none">
                        정답
                      </Badge>
                    )}
                    {isCorrect === false && (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none">
                        오답
                      </Badge>
                    )}
                    {isCorrect === null && (
                      <Badge className="bg-gray-200 text-gray-600 hover:bg-gray-200 border-none shadow-none">
                        미응시
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 leading-relaxed mb-4">
                    {detail.title}
                  </h3>

                  {/* 답안 비교 영역 */}
                  <div className="flex flex-col gap-2 text-sm bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">
                        내가 쓴 답
                      </span>
                      <span
                        className={cn(
                          "font-bold truncate max-w-[70%]",
                          isWrong
                            ? "text-red-600 line-through decoration-red-300"
                            : "text-gray-800"
                        )}
                      >
                        {detail.userAnswer || "-"}
                      </span>
                    </div>
                    <Separator className="bg-gray-200/50" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-green-600 font-medium">
                        정답
                      </span>
                      <span className="font-bold text-green-700 truncate max-w-[70%]">
                        {detail.correctAnswer || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 해설 영역 (오답이거나 해설이 있을 때만 표시) */}
                {(isWrong || detail.explanation) && (
                  <div className="bg-slate-50 border-t border-slate-100 p-4">
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-xs font-extrabold text-slate-500 uppercase">
                        해설
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-6 whitespace-pre-wrap">
                      {detail.explanation
                        ? detail.explanation.replace(/\r\n/g, "\n")
                        : "해설 데이터가 없습니다."}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

// 작은 통계 박스 컴포넌트 분리
const StatBox = ({ label, value, icon, bgColor, textColor }: any) => (
  <div
    className={`flex flex-col items-center justify-center p-3 rounded-xl ${bgColor}`}
  >
    <div className="flex items-center gap-1 mb-1 opacity-80">
      {icon}
      <span className={`text-xs font-semibold ${textColor}`}>{label}</span>
    </div>
    <span className={`text-xl font-bold ${textColor}`}>{value}</span>
  </div>
);

export default QuestionSessionResult;
