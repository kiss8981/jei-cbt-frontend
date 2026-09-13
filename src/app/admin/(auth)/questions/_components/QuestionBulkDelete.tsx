"use client";

import { useRef, useState } from "react";
import { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { adminHttp, BaseResponse } from "@/lib/http/admin-http";
import { questionExcelError } from "@/lib/http/apis/admin/question-excel";
import { GetQuestionListAdminDto } from "@/lib/http/apis/dtos/admin/question/get-question-list.admin.dto";

export function QuestionBulkDelete({ selected, onDeleted, onClear }: {
  selected: GetQuestionListAdminDto[]; onDeleted: () => void; onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const remove = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError("");
    try {
      const response = await adminHttp.delete<BaseResponse<{ deletedCount: number; alreadyDeletedCount: number }>>("/admin/questions/bulk", { data: { questionIds: selected.map(question => Number(question.id)) } });
      if (response.data.code !== 200) throw new Error(response.data.message);
      setMessage(`${response.data.data.deletedCount}개 문제를 삭제했습니다.`);
      setOpen(false); onDeleted();
      void mutate(key => typeof key === "string" && (key.startsWith("/admin/questions") || key.startsWith("/admin/units")));
    } catch (caught) { setError(await questionExcelError(caught)); }
    finally { pending.current = false; setBusy(false); }
  };
  return <>
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <span className="text-sm">선택 {selected.length}개 / 최대 500개</span>
      <Button variant="destructive" disabled={!selected.length || busy} onClick={() => { setError(""); setOpen(true); }}>선택한 문제 삭제</Button>
      <Button variant="ghost" disabled={!selected.length || busy} onClick={onClear}>선택 해제</Button>
      {message && <span role="status" className="text-sm text-muted-foreground">{message}</span>}
    </div>
    <Dialog open={open} onOpenChange={value => { if (!busy) setOpen(value); }}>
      <DialogContent showCloseButton={!busy}>
        <DialogHeader><DialogTitle>선택한 문제 {selected.length}개 삭제</DialogTitle><DialogDescription>선택한 문제는 관리 목록과 출제에서 제외됩니다. 기존 풀이·채점 기록과 사진 연결은 보존됩니다.</DialogDescription></DialogHeader>
        <ul className="max-h-64 overflow-y-auto space-y-2 text-sm">{selected.map(question => <li key={question.id}><strong>#{question.id}</strong> {question.title}<span className="block text-muted-foreground">{question.unitName}</span></li>)}</ul>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>취소</Button><Button variant="destructive" disabled={busy} onClick={remove}>{busy ? "삭제 중…" : `${selected.length}개 삭제`}</Button></div>
      </DialogContent>
    </Dialog>
  </>;
}
