import { formatHMS } from "@/utils/formatHMS";

const FixedElapsedTime = ({ ms }: { ms: number }) => {
  return (
    <div
      className="fixed left-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full px-4 py-2 shadow-md text-sm font-mono"
      style={{
        bottom: `calc(70px + var(--safe-area-inset-bottom, 0px))`,
        transition: "bottom 0.3s ease",
      }}
      key="elapsed-time"
    >
      {formatHMS(Math.round(ms / 1000))}
    </div>
  );
};

export { FixedElapsedTime };
