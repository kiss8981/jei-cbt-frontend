import { GetQuestionSessionAppDtoUnion } from "@/lib/http/apis/dtos/app/question/get-question-session.app.dto";
import UnitQuestionSession from "./unit/UnitQuestionSession";
import { Suspense } from "react";
import { UnitQuestionSessionSkeleton } from "./unit/UnitQuestionSessionSkeleton";

const QuestionSession = ({
  session,
}: {
  session: GetQuestionSessionAppDtoUnion;
}) => {
  switch (session.type) {
    case "UNIT":
      return (
        <Suspense fallback={<UnitQuestionSessionSkeleton />}>
          <UnitQuestionSession session={session} />
        </Suspense>
      );
    case "ALL":
      return <></>;
    case "MOCK":
      return <></>;
  }
};

export default QuestionSession;
