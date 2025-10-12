import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuestionSessionStore } from "@/lib/store/providers/question-session.provider";
import { formatHMS } from "@/utils/formatHMS";
import { motion } from "framer-motion";
import { BookOpen, Timer } from "lucide-react";

const UnitQuestionSessionIndex = () => {
  const { session, nextQuestion } = useQuestionSessionStore(state => state);

  if (!session || session.type !== "UNIT") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full flex h-full justify-center flex-col px-5 items-center  min-h-[calc(100vh-12rem)]"
    >
      <div className="w-full flex flex-col h-full justify-center">
        <div className="flex flex-col items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <div className="text-lg font-semibold">{session.unitName}</div>
          </div>
          <Badge variant="secondary" className="mt-2">
            능력 단위별 학습
          </Badge>
        </div>
        <div className="space-y-3 mt-22">
          <div className="flex flex-row gap-4 text-sm justify-between">
            <div className="flex flex-col">
              <span className="text-muted-foreground">유형</span>
              <span className="font-medium">능력 단위별 학습</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">총 문항</span>
              <span className="font-medium">{session.totalQuestions}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">진행시간</span>
              <span className="font-mono font-medium flex items-center gap-2">
                <Timer className="h-4 w-4" /> {formatHMS(session.duration)}
              </span>
            </div>
          </div>

          <div className="flex flex-col mt-auto">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={nextQuestion}
                className="w-full"
              >
                {session.lastQuestionMapId ? "이어하기" : "학습시작"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UnitQuestionSessionIndex;
