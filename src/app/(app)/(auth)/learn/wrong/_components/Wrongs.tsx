"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
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

import {
  GetWrongQuestionListQueryAppDto,
  WrongQuestionSortType,
} from "@/lib/http/apis/dtos/app/question/get-wrong-question-list-query.app.dto";
import { useQuestionsWrong } from "@/app/(app)/_hooks/useQuestionsWrong";
import { useInView } from "react-intersection-observer";
import { GetWrongQuestionListAppDto } from "@/lib/http/apis/dtos/app/question/get-wrong-question-list.app.dto";
import { CalendarIcon, Target } from "lucide-react"; // 아이콘 추가 (선택사항)
import useAppRouter from "@/hooks/useAppRouter";
import useAppVersion from "@/hooks/useAppVersion";

const WrongQuestionListPage = () => {
  const [searchParams, setSearchParams] =
    useState<GetWrongQuestionListQueryAppDto>({
      page: 1,
      limit: 30,
      sortType: WrongQuestionSortType.LEAST_RECENT,
    });
  const [allQuestions, setAllQuestions] = useState<
    GetWrongQuestionListAppDto[]
  >([]);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  });
  const { navigate } = useAppRouter();
  const router = useRouter();
  const { supportsNativeBottomTabs } = useAppVersion();

  const { wrongQuestions, totalCount, isLoading, error } =
    useQuestionsWrong(searchParams);

  const handleSortChange = (value: string) => {
    // 정렬 변경 시 기존 리스트 초기화 필수
    setAllQuestions([]);
    setHasMore(true);
    setSearchParams(prev => ({
      ...prev,
      sortType: value as WrongQuestionSortType,
      page: 1,
    }));
  };

  useEffect(() => {
    if (wrongQuestions.length > 0) {
      const newQuestions = wrongQuestions.filter(
        (wrongQuestion: GetWrongQuestionListAppDto) =>
          !allQuestions.some(
            existingQuestion => existingQuestion.id == wrongQuestion.id
          )
      );

      setAllQuestions(prev => [...prev, ...newQuestions]);

      // 더 가져올 데이터가 있는지 확인
      if (
        allQuestions.length + newQuestions.length >= totalCount &&
        totalCount > 0
      ) {
        setHasMore(false);
      }
    } else if (!isLoading && totalCount) {
      // 첫 페이지인데 데이터가 없는 경우
      setHasMore(false);
    }
  }, [wrongQuestions, totalCount]);

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      setSearchParams(prev => ({
        ...prev,
        page: (prev.page || 0) + 1,
      }));
    }
  }, [inView, isLoading, hasMore]);

  if (isLoading && !allQuestions.length) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
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
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-background overflow-hidden">
      {/* 1. 헤더 영역 
      - touch-none: 이 영역에서 발생하는 터치 슬라이드(스크롤) 이벤트를 아예 차단합니다. 
        (클릭은 정상 작동함)
      - z-50: 리스트보다 확실히 위에 오도록 설정
  */}
      <div className="shrink-0 z-50 bg-background/95 backdrop-blur px-4 pb-2 pt-2 touch-none select-none">
        <div className="mb-4">
          <h1 className="text-lg font-bold text-gray-900">
            📚 틀린 문제 다시보기
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            총 <span className="font-semibold text-primary">{totalCount}</span>
            개의 문제를 복습해보세요.
          </p>
        </div>

        <Tabs
          value={searchParams.sortType}
          onValueChange={handleSortChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={WrongQuestionSortType.LEAST_RECENT}>
              최근 틀린 순
            </TabsTrigger>
            <TabsTrigger value={WrongQuestionSortType.MOST_WRONG}>
              많이 틀린 순
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 2. 리스트 영역
      - overflow-y-auto: 여기만 스크롤 가능
      - overscroll-y-contain: 스크롤이 끝에 닿았을 때 전체 화면(웹뷰)을 튕기게 하지 않음 (중요)
  */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 mt-2 space-y-3 pb-20 scrollbar-hide">
        {allQuestions.length === 0 && !isLoading ? (
          <Card className="shadow-sm border-dashed mt-8">
            <CardHeader className="items-center text-center py-10">
              <CardTitle className="text-4xl mb-3">🎉</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                틀린 문제가 없습니다!
                <br />
                완벽하게 학습하셨네요.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            {allQuestions.map(q => (
              <Card
                key={q.id}
                className="overflow-hidden border-gray-200 shadow-sm active:scale-[0.99] transition-transform"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-2 py-0.5 h-auto font-normal text-gray-600 bg-gray-100"
                    >
                      {q.unitName}
                    </Badge>
                    <div className="flex items-center text-[10px] text-gray-400">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {dayjs(q.lastWrongAt).format("YY.MM.DD")}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium leading-snug text-gray-800 line-clamp-2">
                      {q.title}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center">
                      <Badge
                        variant="destructive"
                        className="text-[10px] px-1.5 py-0 h-5"
                      >
                        {q.wrongCount}회 오답
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-8 text-xs px-4 rounded-full"
                      onClick={() => {
                        const path = `/learn/wrong/${q.id}`;

                        if (supportsNativeBottomTabs) {
                          navigate("push", path);
                          return;
                        }

                        router.push(path);
                      }}
                    >
                      학습하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div ref={ref} className="py-6 text-center w-full min-h-[50px]">
              {isLoading && hasMore ? (
                <div className="flex justify-center items-center gap-2 text-xs text-gray-400">
                  <Spinner className="w-4 h-4" /> 불러오는 중...
                </div>
              ) : !hasMore && allQuestions.length > 0 ? (
                <p className="text-xs text-gray-300">
                  모든 문제를 불러왔습니다.
                </p>
              ) : (
                <div className="h-4" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WrongQuestionListPage;
