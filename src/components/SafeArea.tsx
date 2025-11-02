import { cn } from "@/lib/utils"; // 없으면 classNames 대체 사용
import React from "react";

type Props = React.PropsWithChildren<{ className?: string }>;

export default function SafeArea({ children, className }: Props) {
  return (
    <div
      className={cn(className, "max-w-[600px] mx-auto")}
      style={{
        paddingTop: "var(--safe-area-inset-top, 0px)",
        paddingBottom: "var(--safe-area-inset-bottom, 0px)",
        paddingLeft: "var(--safe-area-inset-left, 0px)",
        paddingRight: "var(--safe-area-inset-right, 0px)",
      }}
    >
      {children}
    </div>
  );
}
