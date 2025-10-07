import React from "react";
import Questions from "./_components/Questions";

const AdminQuestionsPage: React.FC = () => {
  return (
    <div className="flex flex-col px-8 py-4 gap-8">
      <Questions />
    </div>
  );
};

export default AdminQuestionsPage;
