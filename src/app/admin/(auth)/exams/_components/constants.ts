export const EXAM_TYPE_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "EXTERNAL_EVALUATION", label: "외부평가" },
  { value: "CRAFTSMAN", label: "기능사" },
] as const;

export const EXAM_TYPE_LABEL_MAP = {
  EXTERNAL_EVALUATION: "외부평가",
  CRAFTSMAN: "기능사",
} as const;
