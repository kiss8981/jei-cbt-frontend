"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NoticeEditor } from "./NoticeEditor";
import {
  createAdminNotice,
  getAdminNotice,
  updateAdminNotice,
} from "@/app/admin/_hooks/apis/useNotices";
import { toast } from "sonner";

export function NoticeForm({ noticeId }: { noticeId?: number }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("<p></p>");
  const [assetIds, setAssetIds] = useState<number[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [isLoading, setIsLoading] = useState(Boolean(noticeId));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!noticeId) return;
    getAdminNotice(noticeId)
      .then(notice => {
        setTitle(notice.title);
        setContentHtml(notice.contentHtml);
        setAssetIds(notice.assets.map(asset => asset.id));
        setIsPublished(notice.isPublished);
      })
      .catch(() => toast.error("게시글을 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, [noticeId]);

  const save = async () => {
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(), contentHtml, isPublished, assetIds,
      };
      if (noticeId) await updateAdminNotice(noticeId, payload);
      else await createAdminNotice(payload);
      toast.success("게시글이 저장되었습니다.");
      router.push("/admin/notices");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="h-96 animate-pulse rounded-xl bg-muted" />;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{noticeId ? "게시글 수정" : "게시글 작성"}</h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/notices")} disabled={isSaving}>취소</Button>
          <Button type="button" onClick={save} disabled={isSaving}>{isSaving ? "저장 중..." : "저장"}</Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notice-title">제목</Label>
        <Input id="notice-title" maxLength={200} value={title} onChange={event => setTitle(event.target.value)} placeholder="게시글 제목을 입력하세요." />
      </div>
      <div className="flex items-center justify-between rounded-xl border p-4">
        <div><div className="font-medium">게시글 공개</div><div className="text-sm text-muted-foreground">공개된 글만 학생 게시판에 표시됩니다.</div></div>
        <Switch checked={isPublished} onCheckedChange={setIsPublished} />
      </div>
      <div className="space-y-2">
        <Label>본문 및 첨부파일</Label>
        <NoticeEditor content={contentHtml} onChange={(html, ids) => { setContentHtml(html); setAssetIds(ids); }} />
        <p className="text-xs text-muted-foreground">파일당 최대 50MB, 게시글당 최대 10개까지 첨부할 수 있습니다.</p>
      </div>
    </div>
  );
}

