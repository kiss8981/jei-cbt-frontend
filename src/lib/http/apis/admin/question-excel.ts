import axios from "axios";
import { adminHttp, BaseResponse } from "@/lib/http/admin-http";

export type ExcelRowStatus = "new" | "updated" | "unchanged" | "error";
export type ExcelCounts = Record<ExcelRowStatus | "warning", number>;
export interface QuestionExcelRow {
  sheet: string;
  row: number;
  questionId: string | null;
  title: string;
  unitId: number | null;
  unitName?: string;
  status: ExcelRowStatus;
  errors: string[];
  warnings: string[];
  changes: { field: string; before: string; after: string }[];
}
export interface QuestionExcelPreview {
  previewId: string;
  expiresAt: string;
  counts: ExcelCounts;
  units: (ExcelCounts & { unitId: number | null; unitName: string; total: number })[];
  rows: QuestionExcelRow[];
}
export interface QuestionExcelResult {
  created: number;
  updated: number;
  unchanged: number;
  questionIds: string[];
}

function unwrap<T>(response: BaseResponse<T>): T {
  if (response.code !== 200) throw new Error(response.message || "요청을 처리하지 못했습니다.");
  return response.data;
}
export async function questionExcelError(error: unknown): Promise<string> {
  if (axios.isAxiosError(error)) {
    let body = error.response?.data;
    if (body instanceof Blob) {
      try { body = JSON.parse(await body.text()); } catch { body = undefined; }
    }
    if (body?.message) return Array.isArray(body.message) ? body.message.join("\n") : String(body.message);
  }
  return error instanceof Error ? error.message : "요청을 처리하지 못했습니다. 다시 시도하세요.";
}
export async function downloadQuestionExcel(unitIds: string[]) {
  const response = await adminHttp.get<Blob>("/admin/questions/excel", {
    params: { unitIds: unitIds.join(",") }, responseType: "blob",
  });
  if (response.data.type.includes("json")) {
    const body = JSON.parse(await response.data.text());
    throw new Error(body.message || "다운로드에 실패했습니다. 다시 로그인한 뒤 시도하세요.");
  }
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `문제_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function previewQuestionExcel(file: File) {
  const body = new FormData();
  body.append("file", file);
  const response = await adminHttp.post<BaseResponse<QuestionExcelPreview>>("/admin/questions/excel/preview", body, { headers: { "Content-Type": "multipart/form-data" } });
  return unwrap(response.data);
}
export async function commitQuestionExcel(previewId: string, acknowledgeWarnings: boolean) {
  const response = await adminHttp.post<BaseResponse<QuestionExcelResult>>("/admin/questions/excel/commit", { previewId, acknowledgeWarnings });
  return unwrap(response.data);
}
