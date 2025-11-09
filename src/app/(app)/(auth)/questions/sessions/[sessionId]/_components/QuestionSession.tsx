import { GetQuestionSessionAppDtoUnion } from "@/lib/http/apis/dtos/app/question/get-question-session.app.dto";
import UnitQuestionSession from "./unit/UnitQuestionSession";
import { Suspense } from "react";
import { QuestionSessionSkeleton } from "./QuestionSessionSkeleton";
import AllQuestionSession from "./all/AllQuestionSession";
import MockQuestionSession from "./mock/MockQuestionSession";

const QuestionSession = ({
  session,
}: {
  session: GetQuestionSessionAppDtoUnion;
}) => {
  switch (session.type) {
    case "UNIT":
      return (
        <Suspense fallback={<QuestionSessionSkeleton />}>
          <UnitQuestionSession />
        </Suspense>
      );
    case "ALL":
      return (
        <Suspense fallback={<QuestionSessionSkeleton />}>
          <AllQuestionSession />
        </Suspense>
      );
    case "MOCK":
      return (
        <Suspense fallback={<QuestionSessionSkeleton />}>
          <MockQuestionSession />
        </Suspense>
      );
  }
};

export default QuestionSession;
