import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils"; // 있으면 사용, 없으면 classNames 대체하세요.

export default function BottomKeypad({ children }: PropsWithChildren) {
  return (
    <div
      className={cn("fixed inset-x-0 bottom-0 z-40")}
      style={{
        paddingBottom: "calc(var(--safe-area-inset-bottom, 0px) + 55px)" as any,
      }}
      role="group"
      aria-label="답변 선택 및 제출"
    >
      <div className="mx-auto max-w-[600px] px-4 py-3 flex justify-end">
        {children}
      </div>
    </div>
  );
}
