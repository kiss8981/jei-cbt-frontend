import { Suspense } from "react";
import Units, { UnitsLoadingSkeleton } from "./_components/Units";

export const metadata = {
  title: "능력 단위별 학습",
};

const LearnUnitPage = () => {
  return (
    <div className="flex flex-col bg-white">
      <Suspense fallback={<UnitsLoadingSkeleton />}>
        <Units />
      </Suspense>
    </div>
  );
};

export default LearnUnitPage;
