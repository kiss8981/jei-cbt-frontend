import { BaseResponse, http } from "../../http";
import { GetUnitListAppDto } from "../dtos/app/unit/get-unit-list.app.dto";

export const getById = async (unitId: number) => {
  const { data } = await http.get<BaseResponse<GetUnitListAppDto>>(
    `/units/${unitId}`
  );

  if (data.code != 200) {
    throw new Error(
      data.message || "능력 단위 정보를 불러오는데 실패했습니다."
    );
  }

  return data.data;
};
