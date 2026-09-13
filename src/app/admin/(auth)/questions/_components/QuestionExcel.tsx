"use client";

import { useMemo, useRef, useState } from "react";
import { mutate } from "swr";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUnits } from "@/app/admin/_hooks/apis/useUnits";
import { commitQuestionExcel, downloadQuestionExcel, ExcelRowStatus, previewQuestionExcel, questionExcelError, QuestionExcelPreview, QuestionExcelResult } from "@/lib/http/apis/admin/question-excel";

const labels = { new: "신규", updated: "수정", unchanged: "동일", error: "오류", warning: "경고" };
const fields: Record<string, string> = {
  title: "문제 내용", explanation: "해설", additionalText: "추가 설명", unitId: "능력단위", type: "문제 유형",
  answersForCorrectAnswerForTrueFalse: "정답", answersForMultipleChoice: "보기",
  answersForMultipleChoiceIsCorrect: "정답 여부", answersForMatchingLeftItem: "왼쪽 항목",
  answersForMatchingRightItem: "오른쪽 항목", answersForShortAnswer: "정답",
  answersForMultipleShortAnswerContent: "빈칸 정답", answersForMultipleShortAnswerOrderIndex: "빈칸 번호", answersForInterview: "모범 답안",
};
const PAGE_SIZE = 30;

export function QuestionExcel() {
  const [mode, setMode] = useState<"download" | "upload" | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const [error, setError] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [unitPage, setUnitPage] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const { units, totalCount, isLoading, error: unitError } = useUnits({ keyword: unitSearch, page: unitPage, limit: 50 });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<QuestionExcelPreview | null>(null);
  const [result, setResult] = useState<QuestionExcelResult | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ExcelRowStatus | "warning" | "all">("all");
  const [page, setPage] = useState(1);
  const rows = useMemo(() => (preview?.rows || []).filter(row => {
    const matchesStatus = status === "all" || (status === "warning" ? row.warnings.length > 0 : row.status === status);
    return matchesStatus && `${row.sheet} ${row.row} ${row.questionId || ""} ${row.title} ${row.unitName || ""}`.toLowerCase().includes(search.toLowerCase());
  }), [preview, search, status]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const run = async (action: () => Promise<void>) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try { await action(); } catch (caught) { setError(await questionExcelError(caught)); }
    finally { inFlight.current = false; setBusy(false); }
  };
  const open = (value: "download" | "upload") => {
    setMode(value);
    setError("");
  };
  const inspect = () => run(async () => {
    if (!file || !/\.xlsx$/i.test(file.name) || file.size > 10 * 1024 * 1024) throw new Error("10MB 이하의 .xlsx 파일 하나를 선택하세요.");
    setPreview(null);
    setResult(null);
    setAcknowledged(false);
    const value = await previewQuestionExcel(file);
    setPreview(value);
    setPage(1);
    setStatus("all");
    setSearch("");
  });
  const commit = () => run(async () => {
    if (!preview) return;
    const value = await commitQuestionExcel(preview.previewId, acknowledged);
    setResult(value);
    void mutate(key => typeof key === "string" && (key.startsWith("/admin/questions") || key.startsWith("/admin/units")));
  });

  return <>
    <Button variant="outline" onClick={() => open("download")}><Download className="h-4 w-4" />엑셀 다운로드</Button>
    <Button variant="outline" onClick={() => open("upload")}><Upload className="h-4 w-4" />일괄 업로드</Button>
    <Dialog open={mode !== null} onOpenChange={open => { if (!open && !busy) setMode(null); }}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto" showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>{mode === "download" ? "문제 엑셀 다운로드" : "문제 일괄 업로드"}</DialogTitle>
          <DialogDescription>{mode === "download" ? "선택된 능력단위의 모든 문제를 내려받습니다. 문제 목록의 검색어·유형·페이지 필터는 적용하지 않습니다." : "기존 문제는 ID가 포함된 다운로드 파일로 수정하세요. 사진과 학습 기록을 유지하며, 검토 후 일괄 반영합니다."}</DialogDescription>
        </DialogHeader>
        {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 whitespace-pre-wrap">{error}</p>}
        {mode === "download" ? <>
          <Input aria-label="다운로드할 능력단위 검색" placeholder="능력단위 검색" value={unitSearch} onChange={event => { setUnitSearch(event.target.value); setUnitPage(1); }} />
          <div className="max-h-64 overflow-y-auto border rounded p-3 space-y-2">
            {isLoading ? <p>불러오는 중…</p> : unitError ? <p role="alert">능력단위을 불러오지 못했습니다.</p> : !units.length ? <p>검색 결과가 없습니다.</p> : units.map(unit => <label key={unit.id} className="flex items-center gap-2 p-1">
              <input type="checkbox" checked={!!selected[String(unit.id)]} onChange={event => setSelected(current => { const next = { ...current }; if (event.target.checked) next[String(unit.id)] = unit.name; else delete next[String(unit.id)]; return next; })} />
              {unit.name} <span className="text-xs text-muted-foreground">ID {unit.id}</span>
            </label>)}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" disabled={unitPage <= 1 || isLoading} onClick={() => setUnitPage(value => value - 1)}>이전</Button>
            <span className="text-sm">{unitPage} / {Math.max(1, Math.ceil(totalCount / 50))}</span>
            <Button variant="outline" disabled={unitPage * 50 >= totalCount || isLoading} onClick={() => setUnitPage(value => value + 1)}>다음</Button>
          </div>
          <p className="text-sm">선택된 능력단위 {Object.keys(selected).length}개: {Object.values(selected).join(", ") || "없음"}</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" disabled={busy} onClick={() => setSelected({})}>선택 해제</Button>
            <Button disabled={busy || !Object.keys(selected).length} onClick={() => run(() => downloadQuestionExcel(Object.keys(selected)))}>{busy ? "다운로드 준비 중…" : "다운로드"}</Button>
          </div>
        </> : <>
          <p className="text-sm text-muted-foreground">최대 10MB·10,000행. 여러 능력단위을 한 파일에 입력할 수 있습니다. 보기 개수·유형·능력단위은 유지하세요. 파일에서 행을 지워도 문제는 삭제되지 않습니다.</p>
          <div className="flex flex-wrap gap-2">
            <Input className="flex-1 min-w-60" aria-label="문제 엑셀 파일" type="file" accept=".xlsx" disabled={busy} onChange={event => { setFile(event.target.files?.[0] || null); setPreview(null); setResult(null); setAcknowledged(false); setError(""); }} />
            <Button disabled={!file || busy} onClick={inspect}>{busy && !preview ? "파일 검사 중…" : "파일 검사"}</Button>
          </div>
          {file && <p className="text-xs text-muted-foreground">선택 파일: {file.name}</p>}
          {result ? <div role="status" className="rounded border border-green-200 bg-green-50 p-4 space-y-2">
            <p className="font-medium">반영 완료</p>
            <p>신규 {result.created}개 · 수정 {result.updated}개 · 동일 {result.unchanged}개</p>
            <p className="text-sm">추가 수정 시 엑셀을 다시 다운로드하세요. 새로 등록한 문제의 ID도 포함됩니다.</p>
          </div> : preview && <>
            <div className="flex flex-wrap gap-2" aria-label="검토 요약">
              {Object.entries(labels).map(([key, label]) => <Button key={key} variant={status === key ? "default" : "outline"} onClick={() => { setStatus(key as typeof status); setPage(1); }}>{label} {preview.counts[key as keyof typeof labels]}</Button>)}
              <Button variant={status === "all" ? "default" : "outline"} onClick={() => { setStatus("all"); setPage(1); }}>전체 {preview.rows.length}</Button>
            </div>
            <details className="rounded border p-3 text-sm">
              <summary className="cursor-pointer">능력단위별 건수</summary>
              <div className="overflow-x-auto mt-2"><table className="w-full text-left"><thead><tr><th>능력단위</th><th>전체</th>{Object.values(labels).map(label => <th key={label}>{label}</th>)}</tr></thead>
                <tbody>{preview.units.map(unit => <tr key={String(unit.unitId)}><td>{unit.unitName} {unit.unitId != null && `(${unit.unitId})`}</td><td>{unit.total}</td>{Object.keys(labels).map(key => <td key={key}>{unit[key as keyof typeof labels]}</td>)}</tr>)}</tbody>
              </table></div>
            </details>
            <Input aria-label="검토 결과 검색" placeholder="시트명, 행 번호, 문제 ID, 제목, 능력단위 검색" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
            <div className="space-y-2">
              {rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(row => <details key={`${row.sheet}:${row.row}`} className="rounded border p-3">
                <summary className="cursor-pointer text-sm">
                  <span className={row.status === "error" ? "font-semibold text-red-700" : "font-semibold"}>{labels[row.status]}</span>
                  {row.warnings.length > 0 && <span className="ml-2 text-amber-700">경고</span>}
                  <span className="ml-2 text-muted-foreground">{row.sheet} · {row.row}행 · ID {row.questionId || "신규"} · {row.unitName || row.unitId || "능력단위 확인 필요"}</span>
                  <span className="block mt-1 break-words">{row.title || "문제 내용 없음"}</span>
                </summary>
                {row.errors.map((message, index) => <p key={`error-${index}`} className="text-sm text-red-700 mt-2">{message}</p>)}
                {row.warnings.map((message, index) => <p key={`warning-${index}`} className="text-sm text-amber-700 mt-2">{message}</p>)}
                {row.changes.map(change => <div key={change.field} className="mt-3 text-sm">
                  <p className="font-medium mb-1">{fields[change.field] || change.field}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div className="rounded bg-neutral-100 p-2 min-w-0"><p className="text-xs text-muted-foreground mb-1">변경 전</p><p className="whitespace-pre-wrap break-words">{change.before || "(비어 있음)"}</p></div>
                    <div className="rounded bg-blue-50 p-2 min-w-0"><p className="text-xs text-muted-foreground mb-1">변경 후</p><p className="whitespace-pre-wrap break-words">{change.after || "(비어 있음)"}</p></div>
                  </div>
                </div>)}
                {!row.changes.length && !row.errors.length && <p className="mt-2 text-sm text-muted-foreground">{row.status === "new" ? "새 문제로 등록됩니다." : "기존 내용과 동일합니다."}</p>}
              </details>)}
              {!rows.length && <p className="text-sm p-3">검색 결과가 없습니다.</p>}
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>이전</Button>
              <span className="text-sm">{page} / {pageCount} · {rows.length}개</span>
              <Button variant="outline" disabled={page >= pageCount} onClick={() => setPage(value => value + 1)}>다음</Button>
            </div>
            <div className="border-t pt-3 space-y-3">
              <p className="text-xs text-muted-foreground">검토 유효기간: {new Date(preview.expiresAt).toLocaleString("ko-KR")}. 기존 채점 결과와 오답 기록은 유지됩니다.</p>
              {preview.counts.error > 0 && <p className="text-sm text-red-700">오류가 있는 파일은 반영할 수 없습니다. 엑셀을 수정한 뒤 다시 검사하세요.</p>}
              {preview.counts.warning > 0 && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} />중복 등록 경고를 확인했으며 각 신규 행을 별도 문제로 등록합니다.</label>}
              <div className="flex justify-end"><Button disabled={busy || preview.counts.error > 0 || (preview.counts.warning > 0 && !acknowledged)} onClick={commit}>{busy ? "일괄 반영 중…" : `일괄 반영 (신규 ${preview.counts.new} · 수정 ${preview.counts.updated})`}</Button></div>
            </div>
          </>}
        </>}
      </DialogContent>
    </Dialog>
  </>;
}
