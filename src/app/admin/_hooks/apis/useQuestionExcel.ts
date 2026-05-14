"use client";

import { adminHttp, BaseResponse } from "@/lib/http/admin-http";
import {
  CommitQuestionExcelAdminDto,
  PreviewQuestionExcelResponseAdminDto,
} from "@/lib/http/apis/dtos/admin/question/excel-question.admin.dto";
import { UseQuestionsSearchParams } from "./useQuestions";

const QUESTION_EXCEL_PREVIEW_STORAGE_KEY = "question-excel-preview";

export type QuestionExcelExportParams = Pick<
  UseQuestionsSearchParams,
  "keyword" | "unitIds" | "questionTypes"
>;

const buildQueryString = (params: QuestionExcelExportParams) => {
  const queryParams = new URLSearchParams();

  if (params.keyword) queryParams.append("keyword", params.keyword);
  if (params.unitIds) queryParams.append("unitIds", params.unitIds);
  if (params.questionTypes) {
    queryParams.append("questionTypes", params.questionTypes);
  }

  return queryParams.toString();
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadQuestionExcelTemplate = async () => {
  const response = await adminHttp.get("/admin/questions/excel/template", {
    responseType: "blob",
  });
  downloadBlob(response.data, "question-template.xlsx");
};

export const downloadQuestionExcelExport = async (
  params: QuestionExcelExportParams
) => {
  const queryString = buildQueryString(params);
  const response = await adminHttp.get(
    queryString
      ? `/admin/questions/excel/export?${queryString}`
      : "/admin/questions/excel/export",
    {
      responseType: "blob",
    }
  );
  downloadBlob(response.data, "question-export.xlsx");
};

export const previewQuestionExcel = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await adminHttp.post<
    BaseResponse<PreviewQuestionExcelResponseAdminDto>
  >("/admin/questions/excel/preview", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (data.code !== 200) {
    throw new Error(data.message || "엑셀 미리보기에 실패했습니다.");
  }

  return data.data;
};

export const previewQuestionExcelWithProgress = async (
  file: File,
  onProgress?: (progress: number) => void
) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await adminHttp.post<
    BaseResponse<PreviewQuestionExcelResponseAdminDto>
  >("/admin/questions/excel/preview", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: progressEvent => {
      if (!progressEvent.total) return;
      const progress = Math.round(
        (progressEvent.loaded / progressEvent.total) * 100
      );
      onProgress?.(progress);
    },
  });

  if (data.code !== 200) {
    throw new Error(data.message || "엑셀 미리보기에 실패했습니다.");
  }

  onProgress?.(100);

  return data.data;
};

export const commitQuestionExcel = async (payload: CommitQuestionExcelAdminDto) => {
  const { data } = await adminHttp.post<
    BaseResponse<{ totalCount: number; createdCount: number; updatedCount: number }>
  >("/admin/questions/excel/commit", payload);

  if (data.code !== 200) {
    throw new Error(data.message || "엑셀 반영에 실패했습니다.");
  }

  return data.data;
};

export const setQuestionExcelPreviewStorage = (
  data: PreviewQuestionExcelResponseAdminDto
) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(QUESTION_EXCEL_PREVIEW_STORAGE_KEY, JSON.stringify(data));
};

export const getQuestionExcelPreviewStorage = () => {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(QUESTION_EXCEL_PREVIEW_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as PreviewQuestionExcelResponseAdminDto) : null;
};

export const clearQuestionExcelPreviewStorage = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(QUESTION_EXCEL_PREVIEW_STORAGE_KEY);
};
