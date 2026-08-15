import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "accent";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 outline-none cursor-pointer rounded-input active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:scale-100",
          {
            // Primary: Solid background with glow hover
            "bg-white text-bg-primary hover:bg-neutral-200 focus:ring-2 focus:ring-white/20":
              variant === "primary",
            // Secondary: Bordered button
            "border border-border-custom bg-transparent text-white hover:bg-white/5 focus:ring-2 focus:ring-white/10":
              variant === "secondary",
            // Ghost: Transparent background
            "bg-transparent text-text-secondary hover:text-white hover:bg-white/5":
              variant === "ghost",
            // Destructive: Red theme
            "bg-brand-error text-white hover:bg-red-600 focus:ring-2 focus:ring-brand-error/20":
              variant === "destructive",
            // Accent: Electric cyan glowing button
            "bg-accent-primary text-bg-primary font-semibold hover:bg-accent-hover shadow-glow hover:shadow-glow-strong focus:ring-2 focus:ring-accent-primary/20":
              variant === "accent",
          },
          {
            "px-3 py-1.5 text-xs font-mono": size === "sm",
            "px-4 py-2.5 text-sm": size === "md",
            "px-6 py-3.5 text-base": size === "lg",
          },
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center mr-2">
            <svg
              className="w-4 h-4 animate-spin text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
