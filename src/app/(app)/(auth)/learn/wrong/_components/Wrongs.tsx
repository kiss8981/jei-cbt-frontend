"use client";

import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 1. useSWRInfinite 훅 임포트
import { WrongQuestionSortType } from "@/lib/http/apis/dtos/app/question/get-wrong-question-list-query.app.dto"; // (경로 확인 필요)
import { useQuestionsWrong } from "@/app/(app)/_hooks/useQuestionsWrong";

const WrongQuestionListPage = () => {
  // 2. 상태 관리 (page 상태 제거)
  const [sortType, setSortType] = useState<WrongQuestionSortType>(
    WrongQuestionSortType.LEAST_RECENT
  );

  // 3. 데이터 조회 (SWRInfinite 훅)
  const {
    wrongQuestions,
    totalCount,
    isLoading,
    isLoadingMore,
    isReachedEnd,
    error,
    size, // 현재 페이지 수
    setSize, // 페이지 수 변경 (다음 페이지 로드)
  } = useQuestionsWrong({
    sortType,
    limit: 10,
  });

  // 4. 이벤트 핸들러
  const handleSortChange = (value: string) => {
    setSortType(value as WrongQuestionSortType);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && !isReachedEnd) {
      setSize(size + 1);
    }
  };

  if (isLoading && !wrongQuestions.length) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-4 md:p-8 text-center text-red-500">
        <Card>
          <CardHeader>
            <CardTitle>오류 발생</CardTitle>
            <CardDescription>
              데이터를 불러오는 중 오류가 발생했습니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-xl font-bold text-gray-800">
            📚 틀린 문제 다시보기
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            총 {totalCount}개의 틀린 문제를 다시 학습해 보세요.
          </p>
        </div>

        <Tabs
          value={sortType}
          onValueChange={handleSortChange}
          className="mx-auto md:mx-0"
        >
          <TabsList>
            <TabsTrigger value={WrongQuestionSortType.LEAST_RECENT}>
              최근 틀린 순
            </TabsTrigger>
            <TabsTrigger value={WrongQuestionSortType.MOST_WRONG}>
              많이 틀린 순
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Separator />

      {wrongQuestions.length === 0 && !isLoading ? (
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="items-center text-center p-6">
            <CardTitle className="text-3xl mb-2">🎉</CardTitle>
            <CardDescription className="text-base text-gray-600">
              틀린 문제가 없습니다!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          {/* --- 3. 목록 테이블 --- */}
          <Card className="shadow-md">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[600px]">
                  {/* ... TableHeader (동일) ... */}
                  <TableHeader>
                    <TableRow className="text-xs bg-gray-50">
                      <TableHead className="w-[120px] p-3">단원</TableHead>
                      <TableHead className="p-3">문항</TableHead>
                      <TableHead className="w-[90px] text-center p-3">
                        틀린 횟수
                      </TableHead>
                      <TableHead className="w-[110px] text-center p-3">
                        최근 학습
                      </TableHead>
                      <TableHead className="w-[90px] text-right p-3">
                        학습하기
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-sm">
                    {wrongQuestions.map(q => (
                      <TableRow key={q.id} className="hover:bg-gray-50/70">
                        {/* ... TableCell (동일) ... */}
                        <TableCell className="p-3">
                          <Badge variant="outline" className="text-xs">
                            {q.unitName}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium p-3 whitespace-normal">
                          {q.title}
                        </TableCell>
                        <TableCell className="text-center p-3">
                          <Badge variant="destructive" className="text-xs">
                            {q.wrongCount}회
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500 text-center p-3">
                          {dayjs(q.lastWrongAt).format("YYYY.MM.DD")}
                        </TableCell>
                        <TableCell className="text-right p-3">준비중</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* --- 4. '더 보기' 버튼 섹션 --- */}
          <div className="pt-4 flex justify-center">
            {!isReachedEnd ? (
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore && (
                  <Spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                더 보기
              </Button>
            ) : (
              <p className="text-sm text-gray-500">모든 문제를 불러왔습니다.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WrongQuestionListPage;
