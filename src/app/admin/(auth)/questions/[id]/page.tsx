import React from "react";
import Question from "./_components/Question";

const AdminQuestionDetailPage = async ({
  params,
}: {
  params: Promise<{ id: number }>;
}) => {
  const { id } = await params;

  return (
    <div className="flex flex-col px-8 py-4 gap-8">
      <Question questionId={id} />
    </div>
  );
};

export default AdminQuestionDetailPage;
