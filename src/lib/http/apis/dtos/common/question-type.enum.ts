export enum QuestionType {
  TRUE_FALSE = "TRUE_FALSE",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  MULTIPLE_CHOICE_INPUT = "MULTIPLE_CHOICE_INPUT",
  MATCHING = "MATCHING",
  SHORT_ANSWER = "SHORT_ANSWER",
  MULTIPLE_SHORT_ANSWER = "MULTIPLE_SHORT_ANSWER",
  INTERVIEW = "INTERVIEW",
}

export const typeText = (type: QuestionType) => {
  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
      return "객관식";
    case QuestionType.MULTIPLE_CHOICE_INPUT:
      return "선다형(보기입력)";
    case QuestionType.MATCHING:
      return "연결형";
    case QuestionType.TRUE_FALSE:
      return "진위형";
    case QuestionType.SHORT_ANSWER:
      return "단답형";
    case QuestionType.MULTIPLE_SHORT_ANSWER:
      return "복수 단답형";
    case QuestionType.INTERVIEW:
      return "면접형";
    default:
      return "-";
  }
};
