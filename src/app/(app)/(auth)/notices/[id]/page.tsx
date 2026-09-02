import { NoticeDetailView } from "./_components/NoticeDetailView";

export const metadata = {
  title: "학습 자료 및 공지",
};

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoticeDetailView id={Number(id)} />;
}
