import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "cyan"
    | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono font-medium transition-colors",
        {
          "bg-white/10 text-white border border-white/20": variant === "default",
          "bg-brand-success/10 text-brand-success border border-brand-success/20":
            variant === "success",
          "bg-brand-warning/10 text-brand-warning border border-brand-warning/20":
            variant === "warning",
          "bg-brand-error/10 text-brand-error border border-brand-error/20":
            variant === "error",
          "bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-glow":
            variant === "cyan",
          "bg-blue-500/10 text-blue-400 border border-blue-500/20": variant === "info",
          "border border-border-custom text-text-secondary bg-transparent":
            variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
