import { Suspense } from "react";
import Units, { UnitsLoadingSkeleton } from "./_components/Units";

export const metadata = {
  title: "능력 단위별 학습",
};

const LearnUnitPage = () => {
  return (
    <div className="flex flex-col min-h-screen pt-14 pb-5 bg-white">
      <Suspense fallback={<UnitsLoadingSkeleton />}>
        <Units />
      </Suspense>
    </div>
  );
};

export default LearnUnitPage;
