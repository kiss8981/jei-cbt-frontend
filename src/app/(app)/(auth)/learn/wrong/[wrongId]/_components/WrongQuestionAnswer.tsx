"use client";

import {
  useQuestionWrong,
  useQuestionWrongAnswer,
} from "@/app/(app)/_hooks/useQuestionsWrong";
import { QuestionInterview } from "@/components/ui/question/Interview";
import { QuestionMatching } from "@/components/ui/question/Matching";
import { QuestionMultipleChoice } from "@/components/ui/question/MultipleChoice";
import { QuestionMultipleShort } from "@/components/ui/question/MultipleShort";
import { QuestionShortAnswer } from "@/components/ui/question/ShortAnswer";
import { QuestionTrueFalse } from "@/components/ui/question/TrueFalse";
import { Spinner } from "@/components/ui/spinner";
import { QuestionType } from "@/lib/http/apis/dtos/common/question-type.enum";
import { motion } from "framer-motion";

const WrongQuestionAnswer = ({ wrongId }: { wrongId: number }) => {
  const { wrongQuestion, isLoading } = useQuestionWrong(wrongId);
  const answerState = useQuestionWrongAnswer(wrongId);

  if (isLoading || !wrongQuestion) return <Spinner />;

  const question = wrongQuestion.question;

  const renderContent = () => {
    switch (question.type) {
      case QuestionType.TRUE_FALSE:
        return (
          <QuestionTrueFalse
            question={question.question}
            questionState={{
              isFirstQuestion: true,
              previousQuestion: () => {},
            }}
            answerState={answerState}
            isSession={false}
          />
        );
      case QuestionType.INTERVIEW:
        return (
          <QuestionInterview
            question={question.question}
            questionState={{
              isFirstQuestion: true,
              previousQuestion: () => {},
            }}
            answerState={answerState}
            isSession={false}
          />
        );
      case QuestionType.MATCHING:
        return (
          <QuestionMatching
            question={question.title}
            leftItems={question.leftItems}
            rightItems={question.rightItems}
            questionState={{
              isFirstQuestion: true,
              previousQuestion: () => {},
            }}
            answerState={answerState}
            isSession={false}
          />
        );
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <QuestionMultipleChoice
            question={question.question}
            options={question.choices}
            isMultiple={question.isMultipleAnswer}
            questionState={{
              isFirstQuestion: true,
              previousQuestion: () => {},
            }}
            answerState={answerState}
            isSession={false}
          />
        );
      case QuestionType.MULTIPLE_SHORT_ANSWER:
        return (
          <QuestionMultipleShort
            question={question.question}
            questionState={{
              isFirstQuestion: true,
              previousQuestion: () => {},
            }}
            answerState={answerState}
            isSession={false}
          />
        );
      case QuestionType.SHORT_ANSWER:
        return (
          <QuestionShortAnswer
            question={question.question}
            questionState={{
              isFirstQuestion: true,
              previousQuestion: () => {},
            }}
            answerState={answerState}
            isSession={false}
          />
        );
      // case QuestionType.COMPLETION:
      //   return (
      //     <div className="text-sm text-red-500">
      //       지원하지 않는 문제 유형입니다.
      //     </div>
      //   );
      default:
        return (
          <div className="text-sm text-red-500">
            지원하지 않는 문제 유형입니다.
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full flex h-full px-5"
    >
      {renderContent()}
    </motion.div>
  );
};

export default WrongQuestionAnswer;
