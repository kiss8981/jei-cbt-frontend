"use client";

import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { deleteAdminNotice, useAdminNotices } from "@/app/admin/_hooks/apis/useNotices";
import { toast } from "sonner";

export function Notices() {
  const [page, setPage] = useState(1);
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [published, setPublished] = useState<"ALL" | "true" | "false">("ALL");
  const { notices, totalCount, isLoading, mutate } = useAdminNotices({
    page, limit: 20, keyword,
    isPublished: published === "ALL" ? undefined : published === "true",
  });
  const totalPages = Math.max(1, Math.ceil(totalCount / 20));

  const remove = async (id: number) => {
    if (!window.confirm("이 게시글을 삭제하시겠습니까?")) return;
    try {
      await deleteAdminNotice(id);
      toast.success("게시글이 삭제되었습니다.");
      void mutate();
    } catch {
      toast.error("게시글 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">게시판 관리</h1>
        <Button asChild><Link href="/admin/notices/create">게시글 작성</Link></Button>
      </div>
      <div className="flex flex-wrap gap-2 rounded-xl border p-4">
        <Input className="max-w-sm" value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { setPage(1); setKeyword(input.trim()); } }} placeholder="제목 검색" />
        <Button variant="outline" onClick={() => { setPage(1); setKeyword(input.trim()); }}>검색</Button>
        <Select value={published} onValueChange={value => { setPage(1); setPublished(value as typeof published); }}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="ALL">전체 상태</SelectItem><SelectItem value="true">공개</SelectItem><SelectItem value="false">숨김</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader><TableRow><TableHead className="w-20">ID</TableHead><TableHead>제목</TableHead><TableHead className="w-24">상태</TableHead><TableHead className="w-24">첨부</TableHead><TableHead className="w-40">작성일</TableHead><TableHead className="w-40">관리</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="h-32 text-center">불러오는 중...</TableCell></TableRow> : notices.length === 0 ? <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">등록된 게시글이 없습니다.</TableCell></TableRow> : notices.map(notice => (
              <TableRow key={notice.id}>
                <TableCell>{notice.id}</TableCell><TableCell className="font-medium">{notice.title}</TableCell>
                <TableCell><Badge variant={notice.isPublished ? "default" : "secondary"}>{notice.isPublished ? "공개" : "숨김"}</Badge></TableCell>
                <TableCell>{notice.attachmentCount}개</TableCell><TableCell>{dayjs(notice.createdAt).format("YYYY-MM-DD HH:mm")}</TableCell>
                <TableCell><div className="flex gap-2"><Button size="sm" variant="outline" asChild><Link href={`/admin/notices/${notice.id}`}>수정</Link></Button><Button size="sm" variant="destructive" onClick={() => void remove(notice.id)}>삭제</Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-center gap-3"><Button variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>이전</Button><span className="text-sm">{page} / {totalPages} ({totalCount}건)</span><Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(value => value + 1)}>다음</Button></div>
    </div>
  );
}

