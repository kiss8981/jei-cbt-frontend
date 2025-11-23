import React from "react";
import LearnRecords from "./_components/LearnRecords";

const AdminLearnRecordsPage: React.FC = () => {
  return (
    <div className="flex flex-col px-8 py-4 gap-8">
      <LearnRecords />
    </div>
  );
};

export default AdminLearnRecordsPage;
