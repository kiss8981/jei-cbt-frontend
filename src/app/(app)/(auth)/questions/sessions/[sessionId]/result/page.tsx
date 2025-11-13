import QuestionSessionResult from "./_components/Result";

export const metadata = {
  title: "결과보기",
};

const SessionResultPage = async ({
  params,
}: {
  params: Promise<{ sessionId: number }>;
}) => {
  const { sessionId } = await params;
  return <QuestionSessionResult sessionId={sessionId} />;
};

export default SessionResultPage;
