import { getQuestionSesstionById } from "@/lib/http/apis/app/question-session";
import { SessionType } from "@/lib/http/apis/dtos/common/session-type.enum";
import { cookies } from "next/headers";
import QuestionSession from "./_components/QuestionSession";
import { Suspense } from "react";
export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) => {
  const cookie = await cookies();
  const accessToken = cookie.get("accessToken")?.value;
  const { sessionId } = await params;
  try {
    const session = await getQuestionSesstionById(sessionId, {
      accessToken,
    });

    switch (session.type) {
      case SessionType.UNIT:
        return {
          title: session.unitName,
        };
      case SessionType.ALL:
        return {
          title: "전체 문제 학습",
        };
      case SessionType.MOCK:
        return {
          title: "모의고사",
        };
      default:
        throw new Error("알 수 없는 세션 타입입니다.");
    }
  } catch (e: any) {
    return {
      title: e.message,
    };
  }
};

const LearnUnitPage = async ({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) => {
  const cookie = await cookies();
  const accessToken = cookie.get("accessToken")?.value;
  const { sessionId } = await params;

  const session = await getQuestionSesstionById(sessionId, {
    accessToken,
  });

  return (
    <div className="pt-14 pb-5 bg-white h-screen">
      <QuestionSession session={session} />
    </div>
  );
};

export default LearnUnitPage;
