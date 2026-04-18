import { useQuestionSessionAnswer } from "@/app/(app)/_hooks/useQuestionSession";
import { QuestionInterview } from "@/components/ui/question/Interview";
import { QuestionMatching } from "@/components/ui/question/Matching";
import { QuestionMultipleChoice } from "@/components/ui/question/MultipleChoice";
import { QuestionMultipleChoiceInput } from "@/components/ui/question/MultipleChoiceInput";
import { QuestionMultipleShort } from "@/components/ui/question/MultipleShort";
import { QuestionShortAnswer } from "@/components/ui/question/ShortAnswer";
import { QuestionTrueFalse } from "@/components/ui/question/TrueFalse";
import { SubmissionAnswersForMatchingAppDto } from "@/lib/http/apis/dtos/app/question/submission-answer-request.app.dto";
import { QuestionType } from "@/lib/http/apis/dtos/common/question-type.enum";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import { motion } from "framer-motion";

const QuestionSessionAnswer = () => {
  const questionState = useQuestionSessionStore(state => state);
  const answerState = useQuestionSessionAnswer();

  const question = questionState?.question?.question;
  const userAnswer = questionState?.question?.userAnswer;

  if (!question) return null;

  const questionKey = question.id;

  const renderContent = () => {
    switch (question.type) {
      case QuestionType.TRUE_FALSE:
        return (
          <QuestionTrueFalse
            key={questionKey}
            question={question.question}
            initialUserAnswer={(userAnswer as unknown as boolean) || false}
            questionState={questionState}
            answerState={answerState}
            isSession
          />
        );
      case QuestionType.INTERVIEW:
        return (
          <QuestionInterview
            key={questionKey}
            question={question.question}
            initialUserAnswer={(userAnswer as string) || ""}
            questionState={questionState}
            answerState={answerState}
            isSession
          />
        );
      case QuestionType.MATCHING:
        return (
          <QuestionMatching
            key={questionKey}
            question={question.title}
            leftItems={question.leftItems}
            rightItems={question.rightItems}
            initialUserAnswer={
              (userAnswer as SubmissionAnswersForMatchingAppDto[]) || []
            }
            questionState={questionState}
            answerState={answerState}
            isSession
          />
        );
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <QuestionMultipleChoice
            key={questionKey}
            question={question.question}
            options={question.choices}
            isMultiple={question.isMultipleAnswer}
            initialUserAnswer={(userAnswer as number[]) || []}
            questionState={questionState}
            answerState={answerState}
            isSession
          />
        );
      case QuestionType.MULTIPLE_CHOICE_INPUT:
        return (
          <QuestionMultipleChoiceInput
            key={questionKey}
            question={question.question}
            options={question.choices}
            isMultiple={question.isMultipleAnswer}
            initialUserAnswer={(userAnswer as string) || ""}
            questionState={questionState}
            answerState={answerState}
            isSession
          />
        );
      case QuestionType.MULTIPLE_SHORT_ANSWER:
        return (
          <QuestionMultipleShort
            key={questionKey}
            question={question.question}
            questionState={questionState}
            answerState={answerState}
            isSession
          />
        );
      case QuestionType.SHORT_ANSWER:
        return (
          <QuestionShortAnswer
            key={questionKey}
            question={question.question}
            initialUserAnswer={(userAnswer as string) || ""}
            questionState={questionState}
            answerState={answerState}
            isSession
          />
        );
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

export default QuestionSessionAnswer;
