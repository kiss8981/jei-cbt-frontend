import WrongQuestionListPage from "./_components/Wrongs";

export const metadata = {
  title: "오답문제 복습",
};

const LearnUnitPage = () => {
  return (
    <div className="flex flex-col bg-white">
      <WrongQuestionListPage />
    </div>
  );
};

export default LearnUnitPage;
