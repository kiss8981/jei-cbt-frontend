"use client";
import { useState } from "react";
import { GetS3PresignedUrlAdminDto } from "@/lib/http/apis/dtos/admin/upload/get-presigend-urls.admin.dto";
import { CreateS3PresignedUrlsAdminDto } from "@/lib/http/apis/dtos/admin/upload/create-presigend-urls.admin.dto";
import { adminHttp, BaseResponse } from "@/lib/http/admin-http";

interface UseS3PresignedUrlsReturn {
  getPresignedUrls: (
    filenames: string[]
  ) => Promise<GetS3PresignedUrlAdminDto[]>;
  isLoading: boolean;
  error: string | null;
}

export function useS3PresignedUrls(): UseS3PresignedUrlsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPresignedUrls = async (
    filenames: string[]
  ): Promise<GetS3PresignedUrlAdminDto[]> => {
    if (!filenames.length) {
      throw new Error("파일명이 필요합니다.");
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestData: CreateS3PresignedUrlsAdminDto = {
        filenames,
      };

      const response = await adminHttp.post<
        BaseResponse<GetS3PresignedUrlAdminDto[]>
      >("/admin/upload/presigned-urls", requestData);

      if (response.data?.data) {
        return response.data.data;
      } else {
        throw new Error("Presigned URL 응답 데이터가 없습니다.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Presigned URL 발급에 실패했습니다.";

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getPresignedUrls,
    isLoading,
    error,
  };
}

/**
 * 파일을 S3에 업로드합니다.
 * @param file 업로드할 파일
 * @param uploadUrl Presigned URL
 * @returns 업로드 성공 여부
 */
export async function uploadFileToS3(
  file: File,
  uploadUrl: string
): Promise<boolean> {
  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error(
        `S3 업로드 실패: ${response.status} ${response.statusText}`
      );
    }

    return true;
  } catch (error) {
    console.error("S3 파일 업로드 오류:", error);
    throw error;
  }
}

/**
 * 여러 파일을 S3에 일괄 업로드합니다.
 * @param uploads 파일과 업로드 URL 쌍의 배열
 * @param onProgress 진행률 콜백 함수
 * @returns 성공한 업로드의 인덱스 배열
 */
export async function uploadFilesToS3(
  uploads: Array<{ file: File; uploadUrl: string; key: string }>,
  onProgress?: (progress: number, completed: number, total: number) => void
): Promise<string[]> {
  const successfulUploads: string[] = [];
  const totalCount = uploads.length;

  for (let i = 0; i < uploads.length; i++) {
    const { file, uploadUrl, key } = uploads[i];

    try {
      // 진행률 콜백 호출
      onProgress?.(Math.round((i / totalCount) * 100), i, totalCount);

      const success = await uploadFileToS3(file, uploadUrl);
      if (success) {
        successfulUploads.push(key);
      }
    } catch (error) {
      console.error(`파일 ${file.name} S3 업로드 실패:`, error);
      // 실패한 파일은 건너뛰고 계속 진행
    }
  }

  // 완료 시 100% 진행률 콜백
  onProgress?.(100, totalCount, totalCount);

  return successfulUploads;
}

export const usePhoto = () => {
  const deletePhoto = async (photoId: number): Promise<boolean> => {
    try {
      const response = await adminHttp.delete<
        BaseResponse<{ success: boolean }>
      >(`/admin/upload/photos/${photoId}`);

      if (response.data.code === 200) {
        return response.data.data.success;
      } else {
        throw new Error(response.data.message || "사진 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("사진 삭제 오류:", error);
      throw error;
    }
  };

  return {
    deletePhoto,
  };
};
