import { PaginationResponse } from "@/lib/http/admin-http";
import { GetWrongQuestionListQueryAppDto } from "@/lib/http/apis/dtos/app/question/get-wrong-question-list-query.app.dto";
import { GetWrongQuestionListAppDto } from "@/lib/http/apis/dtos/app/question/get-wrong-question-list.app.dto";
import { BaseResponse, httpSWR } from "@/lib/http/http";
import useSWR from "swr";

export const useQuestionsWrong = (
  searchParams: GetWrongQuestionListQueryAppDto
) => {
  const buildQueryString = (
    params: GetWrongQuestionListQueryAppDto
  ): string => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.sortType)
      queryParams.append("sortType", params.sortType.toString());

    return queryParams.toString();
  };
  const queryString = buildQueryString(searchParams);
  const swrKey = `/questions/wrongs?${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<
    BaseResponse<PaginationResponse<GetWrongQuestionListAppDto>>
  >(swrKey, httpSWR);

  const wrongQuestions = data?.data?.items || [];
  const totalCount = data?.data?.totalCount || 0;

  return {
    wrongQuestions,
    totalCount,
    isLoading,
    error,
    refetch: mutate,
  };
};
