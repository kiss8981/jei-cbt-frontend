import React from "react";
import Exams from "./_components/Exams";

const AdminExamsPage: React.FC = () => {
  return (
    <div className="flex flex-col px-8 py-4 gap-8">
      <Exams />
    </div>
  );
};

export default AdminExamsPage;
