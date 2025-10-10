import { BaseResponse, http } from "../../http";

export const getQuestionsByUnitId = async (
  unitId: number,
  {
    accessToken,
  }: {
    accessToken?: string;
  }
) => {
  const { data } = await http.get<BaseResponse<any>>(
    `/questions/by-unit/${unitId}`,
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
