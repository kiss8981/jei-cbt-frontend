"use client";

import dayjs from "dayjs";
import { CalendarDays, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotice } from "@/app/(app)/_hooks/useNotices";
import useAppRouter from "@/hooks/useAppRouter";

export function NoticeDetailView({ id }: { id: number }) {
  const { navigate } = useAppRouter();
  const { notice, isLoading, error } = useNotice(id);
  if (isLoading) return <div className="flex min-h-[80dvh] items-center justify-center text-sm text-muted-foreground">게시글을 불러오는 중입니다.</div>;
  if (error || !notice) return <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-4 text-sm text-red-500">게시글을 찾을 수 없습니다.<Button variant="outline" onClick={() => navigate("back")}>돌아가기</Button></div>;

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-3xl bg-white">
      <article className="px-5 py-6">
        <h1 className="break-words text-2xl font-bold leading-tight">{notice.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 border-b pb-5 text-xs text-muted-foreground"><span className="flex items-center gap-1"><CalendarDays className="size-3.5" />{dayjs(notice.createdAt).format("YYYY.MM.DD HH:mm")}</span>{notice.attachmentCount > 0 && <span className="flex items-center gap-1"><Paperclip className="size-3.5" />첨부 {notice.attachmentCount}개</span>}</div>
        <div className="notice-content mt-6 break-words leading-7 [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-neutral-900 [&_pre]:p-4 [&_pre]:text-white [&_ul]:list-disc [&_ul]:pl-6" dangerouslySetInnerHTML={{ __html: notice.contentHtml }} />
      </article>
    </div>
  );
}
