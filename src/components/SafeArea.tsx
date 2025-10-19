import { cn } from "@/lib/utils"; // 없으면 classNames 대체 사용
import React from "react";

type Props = React.PropsWithChildren<{ className?: string }>;

export default function SafeArea({ children, className }: Props) {
  return (
    <div
      className={cn(className, "max-w-[600px] mx-auto")}
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px))",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {children}
    </div>
  );
}
