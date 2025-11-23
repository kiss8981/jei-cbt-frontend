import { Expose } from "class-transformer";
import { SessionType } from "../../common/session-type.enum";

export class GetQuestionSessionListAdminDto {
  @Expose()
  sessionId: number;

  @Expose()
  sessionType: SessionType;

  @Expose()
  createdAt: Date;

  @Expose()
  elapsedMs: number;

  @Expose()
  elapsedMs7d: number;

  @Expose()
  elapsedMs30d: number;

  @Expose()
  elapsedMsToday: number;

  @Expose()
  elapsedMsTotal: number;

  @Expose()
  userId: number;

  @Expose()
  userName: string;
}
