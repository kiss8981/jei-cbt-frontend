import WrongQuestionListPage from "./_components/Wrongs";

export const metadata = {
  title: "틀린 문제 복습",
};

const LearnUnitPage = () => {
  return (
    <div className="flex flex-col bg-white py-4">
      <WrongQuestionListPage />
    </div>
  );
};

export default LearnUnitPage;
