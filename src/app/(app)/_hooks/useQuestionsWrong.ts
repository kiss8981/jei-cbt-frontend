import { PaginationResponse } from "@/lib/http/admin-http";
import { WrongQuestionSortType } from "@/lib/http/apis/dtos/app/question/get-wrong-question-list-query.app.dto";
import { GetWrongQuestionListAppDto } from "@/lib/http/apis/dtos/app/question/get-wrong-question-list.app.dto";
import { BaseResponse, http } from "@/lib/http/http";
import { useMemo } from "react";
import useSWRInfinite, { SWRInfiniteResponse } from "swr/infinite";

type OnePageResponse = BaseResponse<
  PaginationResponse<GetWrongQuestionListAppDto>
>;

type ApiResponseType = SWRInfiniteResponse<OnePageResponse>;

interface UseQuestionsWrongParams {
  /** 정렬 기준 (최근 틀린 순 / 많이 틀린 순) */
  sortType: WrongQuestionSortType;
  /** 한 페이지에 불러올 개수 */
  limit?: number;
}

export const useQuestionsWrong = ({
  sortType,
  limit = 10,
}: UseQuestionsWrongParams) => {
  const swrKeyBase = `/questions/wrongs`;

  const getKey = (
    pageIndex: number,
    previousPageData: ApiResponseType | null
  ) => {
    const page = pageIndex + 1;
    if (
      previousPageData &&
      previousPageData?.data?.[0].data.items?.length! < limit
    ) {
      return null;
    }
    return `${swrKeyBase}?page=${page}&limit=${limit}&sortType=${sortType}`;
  };

  // 4. 훅 호출 시 제네릭 및 반환 타입 명시
  const { data, error, isLoading, size, setSize, isValidating } =
    useSWRInfinite<ApiResponseType>(getKey, http, {
      revalidateFirstPage: false,
    });
  // 5. 데이터 가공 (로직 동일)
  const wrongQuestions = useMemo(
    () => data?.flatMap(page => page.data)[0]?.data.items || [],
    [data]
  );
  const totalCount = data?.[0]?.data?.[0]?.data.totalCount || 0;
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isReachedEnd =
    data && data.length > 0 && wrongQuestions.length >= totalCount;

  return {
    wrongQuestions,
    totalCount,
    data,
    isLoading,
    isLoadingMore,
    isReachedEnd,
    error,
    size,
    setSize,
    isValidating,
  };
};
