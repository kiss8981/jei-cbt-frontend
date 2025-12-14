import { BaseResponse, http } from "../../http";
import { GetWrongQuestionAppDto } from "../dtos/app/question/get-wrong-question.app.dto";

export const getWrongQuestionById = async (
  wrongId: number,
  {
    accessToken,
  }: {
    accessToken?: string;
  }
) => {
  const { data } = await http.get<BaseResponse<GetWrongQuestionAppDto>>(
    `/questions/wrongs/${wrongId}`,
    {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
    }
  );

  if (data.code != 200) {
    throw new Error(
      data.message || "틀린 문제 정보를 불러오는데 실패했습니다."
    );
  }

  return data.data;
};
