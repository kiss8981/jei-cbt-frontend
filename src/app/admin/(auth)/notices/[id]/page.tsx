import { NoticeForm } from "../_components/NoticeForm";

export default async function AdminNoticeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div className="px-8 py-4"><NoticeForm noticeId={Number(id)} /></div>;
}
