import WrongQuestionAnswer from "./WrongQuestionAnswer";

const WrongQuestion = ({ wrongId }: { wrongId: number }) => {
  return <WrongQuestionAnswer wrongId={wrongId} />;
};

export default WrongQuestion;
