import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

type FixedButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** 내부 컨텐츠 최대 가로폭(px). 기본 600 */
    maxWidth?: number;
    /** 좌우 패딩(px). 기본 16 */
    sidePadding?: number;
    /** 버튼 위/아래 패딩(px). 기본 12 */
    verticalPadding?: number;
    /** 래퍼(div)의 className */
    wrapperClassName?: string;
  };

function FixedButton({
  className,
  variant,
  size,
  asChild = false,
  maxWidth = 600,
  sidePadding = 16,
  verticalPadding = 12,
  wrapperClassName,
  ...props
}: FixedButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        // 배경/블러가 필요 없으면 지워도 됨
        "backdrop-blur-md bg-background/70",
        wrapperClassName
      )}
      style={{
        // 좌우 여백
        paddingLeft: sidePadding,
        paddingRight: sidePadding,
        // 기본 + 안전영역 하단 여백
        paddingTop: verticalPadding,
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${verticalPadding}px)`,
      }}
    >
      <div
        className="mx-auto w-full"
        style={{ maxWidth }} // 600px 초과 금지
      >
        <Comp
          data-slot="button"
          className={cn(
            buttonVariants({ variant, size }),
            "w-full", // 버튼은 꽉 차게
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}

export { Button, buttonVariants, FixedButton };
