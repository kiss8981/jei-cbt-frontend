import { NoticeDetailView } from "./_components/NoticeDetailView";

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoticeDetailView id={Number(id)} />;
}

