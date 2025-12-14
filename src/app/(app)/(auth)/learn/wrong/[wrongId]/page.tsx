import { getQuestionSesstionById } from "@/lib/http/apis/app/question-session";
import { cookies } from "next/headers";
import WrongQuestion from "./_components/WrongQuestion";
import { QuestionSessionProvider } from "@/lib/store/providers/question-session.provider";
import { WrongQuestionProvider } from "@/lib/store/providers/wrong-question.provider";
import { getWrongQuestionById } from "@/lib/http/apis/app/wrong-question";
export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) => {
  return {
    title: "틀린 문제 학습",
  };
};

const WrongQuestionPage = async ({
  params,
}: {
  params: Promise<{ wrongId: number }>;
}) => {
  const cookie = await cookies();
  const accessToken = cookie.get("accessToken")?.value;
  const { wrongId } = await params;

  const wrongQuestion = await getWrongQuestionById(wrongId, {
    accessToken,
  });

  return (
    <WrongQuestionProvider
      initStore={{
        wrongQuestion,
        question: wrongQuestion.question,
        isLoading: false,
      }}
    >
      <div className=" bg-white py-4">
        <WrongQuestion wrongId={wrongId} />
      </div>
    </WrongQuestionProvider>
  );
};

export default WrongQuestionPage;
