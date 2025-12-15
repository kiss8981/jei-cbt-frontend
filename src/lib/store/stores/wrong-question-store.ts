import { createStore } from "zustand";
import { BaseResponse, http } from "@/lib/http/http";
import { GetQuestionSessionAppDtoUnion } from "@/lib/http/apis/dtos/app/question/get-question-session.app.dto";
import { GetQuestionWithStepAppDto } from "@/lib/http/apis/dtos/app/question/get-question-with-step.app.dto";
import { toast } from "sonner";
import { GetQuestionAppDtoUnion } from "@/lib/http/apis/dtos/app/question/get-question.app.dto";
import { GetWrongQuestionAppDto } from "@/lib/http/apis/dtos/app/question/get-wrong-question.app.dto";

export interface WrongQuestionState {
  wrongQuestion: GetWrongQuestionAppDto;
  question: GetQuestionAppDtoUnion | null;
  isLoading: boolean;
}
export const initialWrongQuestionState: WrongQuestionState = {
  wrongQuestion: {} as GetWrongQuestionAppDto,
  question: null,
  isLoading: false,
};

export type WrongQuestionStore = WrongQuestionState;

export const createWrongQuestionStore = (
  initState: WrongQuestionState = initialWrongQuestionState
) => {
  return createStore<WrongQuestionStore>((set, get) => ({
    ...initState,
  }));
};
