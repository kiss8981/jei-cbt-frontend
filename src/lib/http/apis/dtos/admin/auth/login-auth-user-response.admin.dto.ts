import { Expose } from "class-transformer";

export class LoginAuthUserResponseAdminDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}
