export function QuestionSessionSkeleton() {
  return (
    <div className="w-full flex h-full justify-center flex-col px-5 items-center">
      <div className="w-full flex flex-col h-full justify-center">
        {/* Header */}
        <div className="flex flex-col items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            {/* Icon circle */}
            <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
            {/* Title bar */}
            <div className="h-5 w-48 rounded bg-muted animate-pulse" />
          </div>
          {/* Badge */}
          <div className="mt-2 h-6 w-28 rounded-full bg-muted animate-pulse" />
        </div>

        {/* Body */}
        <div className="space-y-3 mt-22">
          {/* Stats row */}
          <div className="flex flex-row gap-4 text-sm justify-between">
            {/* 유형 */}
            <div className="flex flex-col gap-1">
              <div className="h-4 w-10 rounded bg-muted/70" />
              <div className="h-5 w-24 rounded bg-muted animate-pulse" />
            </div>
            {/* 총 문항 */}
            <div className="flex flex-col gap-1">
              <div className="h-4 w-10 rounded bg-muted/70" />
              <div className="h-5 w-12 rounded bg-muted animate-pulse" />
            </div>
            {/* 진행시간 */}
            <div className="flex flex-col gap-1">
              <div className="h-4 w-12 rounded bg-muted/70" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
                <div className="h-5 w-24 rounded bg-muted animate-pulse" />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between mt-auto">
            <div className="flex gap-2 w-full">
              {/* Button placeholder */}
              <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
