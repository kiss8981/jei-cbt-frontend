export class CreateS3PresignedUrlsAdminDto {
  purpose: "QUESTION" | "NOTICE";
  files: Array<{
    fileName: string;
    mimeType: string;
    size: number;
  }>;
}
