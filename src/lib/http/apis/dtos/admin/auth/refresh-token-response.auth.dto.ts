import { Expose } from "class-transformer";

export class RefreshAuthTokenResponseAdminDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}
