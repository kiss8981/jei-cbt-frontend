import { Expose } from "class-transformer";

export class UpdateExamAdminDto {
  @Expose()
  type: string;

  @Expose()
  title: string;

  @Expose()
  isDisplayed: boolean;
}
