import { Expose } from "class-transformer";

export class MeAuthAdminDto {
  @Expose()
  sub: number;

  @Expose()
  type: "access";

  @Expose()
  name: string;
}
