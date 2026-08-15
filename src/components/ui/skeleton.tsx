import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "avatar" | "card" | "row" | "rect";
}

export function Skeleton({ className, variant = "rect", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton-shimmer rounded bg-bg-card",
        {
          "h-4 w-full": variant === "text",
          "h-10 w-10 rounded-full": variant === "avatar",
          "h-32 w-full rounded-card border border-border-custom": variant === "card",
          "h-12 w-full border-b border-border-custom": variant === "row",
          "w-full h-8": variant === "rect",
        },
        className
      )}
      {...props}
    />
  );
}
