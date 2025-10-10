import { BaseResponse, http } from "../../http";
import {
  GetQuestionSessionAppDto,
  GetQuestionSessionAppDtoUnion,
} from "../dtos/app/question/get-question-session.app.dto";

export const getQuestionSesstionById = async (
  sessionId: string,
  {
    accessToken,
  }: {
    accessToken?: string;
  }
) => {
  const { data } = await http.get<BaseResponse<GetQuestionSessionAppDtoUnion>>(
    `/questions/sessions/${sessionId}`,
    {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
    }
  );

  if (data.code != 200) {
    throw new Error(data.message || "문제 정보를 불러오는데 실패했습니다.");
  }

  return data.data;
};
