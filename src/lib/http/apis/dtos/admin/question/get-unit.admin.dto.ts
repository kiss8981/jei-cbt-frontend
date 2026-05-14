import { Expose } from "class-transformer";

export class UnitExamSummaryDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  type: string;
}

export class GetUnitAdminDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  isDisplayed: boolean;

  @Expose()
  examIds: number[];

  @Expose()
  exams: UnitExamSummaryDto[];
}
