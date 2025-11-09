import { Suspense } from "react";
import Units, { UnitsLoadingSkeleton } from "./_components/Units";

export const metadata = {
  title: "모의고사",
};

const LearnAllPage = () => {
  return (
    <div className="flex flex-col bg-white py-4">
      <Suspense fallback={<UnitsLoadingSkeleton />}>
        <Units />
      </Suspense>
    </div>
  );
};

export default LearnAllPage;
