"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { CalendarDays, Paperclip, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useNotices } from "@/app/(app)/_hooks/useNotices";
import useAppRouter from "@/hooks/useAppRouter";

export function NoticeList() {
  const { navigate } = useAppRouter();
  const [page, setPage] = useState(1);
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const { notices, totalCount, isLoading, error } = useNotices({ page, limit: 20, keyword });
  const totalPages = Math.max(1, Math.ceil(totalCount / 20));

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col bg-neutral-50">
      <div className="sticky top-0 z-10 border-b bg-white/95 px-4 py-3 backdrop-blur">
        <form className="flex gap-2" onSubmit={event => { event.preventDefault(); setPage(1); setKeyword(input.trim()); }}><Input value={input} onChange={event => setInput(event.target.value)} placeholder="제목 검색" /><Button type="submit" size="icon" variant="outline" aria-label="검색"><Search /></Button></form>
      </div>
      <main className="flex-1 space-y-3 px-4 py-4">
        {isLoading ? <div className="py-20 text-center text-sm text-muted-foreground">게시글을 불러오는 중입니다.</div> : error ? <div className="py-20 text-center text-sm text-red-500">게시글을 불러오지 못했습니다.</div> : notices.length === 0 ? <div className="py-20 text-center text-sm text-muted-foreground">등록된 게시글이 없습니다.</div> : notices.map(notice => (
          <Card key={notice.id} className="cursor-pointer py-0 shadow-sm transition-transform active:scale-[0.99]" onClick={() => navigate("push", `/notices/${notice.id}`)}>
            <CardContent className="p-4"><h2 className="line-clamp-2 font-semibold">{notice.title}</h2><div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><CalendarDays className="size-3.5" />{dayjs(notice.createdAt).format("YYYY.MM.DD")}</span>{notice.attachmentCount > 0 && <span className="flex items-center gap-1"><Paperclip className="size-3.5" />{notice.attachmentCount}</span>}</div></CardContent>
          </Card>
        ))}
      </main>
      <footer className="flex items-center justify-center gap-3 border-t bg-white p-4"><Button variant="outline" disabled={page <= 1 || isLoading} onClick={() => setPage(value => value - 1)}>이전</Button><span className="text-sm">{page} / {totalPages}</span><Button variant="outline" disabled={page >= totalPages || isLoading} onClick={() => setPage(value => value + 1)}>다음</Button></footer>
    </div>
  );
}
