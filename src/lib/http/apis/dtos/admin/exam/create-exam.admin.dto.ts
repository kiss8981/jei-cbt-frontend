import { Expose } from "class-transformer";

export class CreateExamAdminDto {
  @Expose()
  type: string;

  @Expose()
  title: string;

  @Expose()
  isDisplayed: boolean;
}
