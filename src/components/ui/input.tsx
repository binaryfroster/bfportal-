import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, ...props }, ref) => {
    const id = React.useId();
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block mb-1.5 text-xs font-mono font-medium text-text-secondary uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          className={cn(
            "w-full px-3 py-2 text-sm bg-bg-secondary text-white rounded-input border border-border-custom transition-all duration-200 outline-none placeholder:text-text-muted focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed",
            {
              "border-brand-error focus:border-brand-error focus:ring-brand-error/30":
                error,
            },
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs font-mono text-brand-error">{error}</p>
        )}
        {!error && helperText && (
          <p className="mt-1 text-xs font-mono text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
