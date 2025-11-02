import { createStore } from "zustand";
import { BaseResponse, http } from "@/lib/http/http";
import { GetQuestionSessionAppDtoUnion } from "@/lib/http/apis/dtos/app/question/get-question-session.app.dto";
import { GetQuestionWithStepAppDto } from "@/lib/http/apis/dtos/app/question/get-question-with-step.app.dto";
import { toast } from "sonner";

export interface QuestionSessionState {
  session: GetQuestionSessionAppDtoUnion;
  question: GetQuestionWithStepAppDto | null;
  isQuestionLoading: boolean;
  isFirstQuestion: boolean;
  hasMoreQuestions: boolean;
}

interface QuestionSessionActions {
  nextQuestion: (initialLastQuestionMapId?: number) => Promise<void>;
  previousQuestion: () => Promise<void>;
}

export const initialQuestionSessionState: QuestionSessionState = {
  session: {} as GetQuestionSessionAppDtoUnion,
  question: null,
  isQuestionLoading: false,
  isFirstQuestion: false,
  hasMoreQuestions: true,
};

export type QuestionSessionStore = QuestionSessionState &
  QuestionSessionActions;

const buildQuery = (questionMapId?: number) => {
  const sp = new URLSearchParams();
  if (questionMapId) sp.append("currentQuestionMapId", String(questionMapId));
  const q = sp.toString();
  return q ? `?${q}` : "";
};

export const createQuestionSessionStore = (
  initState: QuestionSessionState = initialQuestionSessionState
) => {
  return createStore<QuestionSessionStore>((set, get) => ({
    ...initState,
    nextQuestion: async (initialLastQuestionMapId?: number) => {
      try {
        set({ isQuestionLoading: true });

        const { session, question } = get();
        const suffix = buildQuery(
          initialLastQuestionMapId ?? question?.questionMapId
        );
        const { data } = await http.get<
          BaseResponse<GetQuestionWithStepAppDto>
        >(`/questions/sessions/${session.id}/next${suffix}`);

        if (data.code !== 200) {
          throw new Error(data.message || "다음 문제 불러오기에 실패했습니다.");
        }

        if (data.data.previousQuestionCount == 0) {
          set({ isFirstQuestion: true });
        } else {
          set({ isFirstQuestion: false });
        }

        if (data.data.isLastQuestion) {
          set({ hasMoreQuestions: false });
        } else {
          set({ hasMoreQuestions: true });
        }

        set({ question: data.data });
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        set({ isQuestionLoading: false });
      }
    },

    previousQuestion: async () => {
      try {
        set({ isQuestionLoading: true });

        const { session, question } = get();
        const suffix = buildQuery(question?.questionMapId);

        const { data } = await http.get<
          BaseResponse<GetQuestionWithStepAppDto>
        >(`/questions/sessions/${session.id}/previous${suffix}`);

        if (data.code !== 200) {
          throw new Error(data.message || "이전 문제 불러오기에 실패했습니다.");
        }

        if (data.data.previousQuestionCount == 0) {
          set({ isFirstQuestion: true });
        } else {
          set({ isFirstQuestion: false });
        }

        if (data.data.isLastQuestion) {
          set({ hasMoreQuestions: false });
        } else {
          set({ hasMoreQuestions: true });
        }

        set({ question: data.data });
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        set({ isQuestionLoading: false });
      }
    },
  }));
};
