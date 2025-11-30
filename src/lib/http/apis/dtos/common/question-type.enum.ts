export enum QuestionType {
  TRUE_FALSE = "TRUE_FALSE", // 진위형 (참/거짓) ㅇㅇ
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE", // 선다형 ㅇㅇ
  MATCHING = "MATCHING", // 연결형 ㅇㅇ
  SHORT_ANSWER = "SHORT_ANSWER", // 순수 단답형 ㅇㅇ
  // COMPLETION = "COMPLETION", // 빈칸 채우기 (완성형)
  MULTIPLE_SHORT_ANSWER = "MULTIPLE_SHORT_ANSWER", // 복수 단답형
  INTERVIEW = "INTERVIEW", // 면접 질문
}

export const typeText = (type: QuestionType) => {
  switch (type) {
    case "MULTIPLE_CHOICE":
      return "객관식";
    case "MATCHING":
      return "연결형";
    case "TRUE_FALSE":
      return "진위형";
    case "SHORT_ANSWER":
      return "단답형";
    // case "COMPLETION":
    //   return "완성형";
    case "MULTIPLE_SHORT_ANSWER":
      return "복수 단답형";
    case "INTERVIEW":
      return "면접형";
    default:
      return "-";
  }
};
