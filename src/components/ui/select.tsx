import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, helperText, ...props }, ref) => {
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
        <div className="relative">
          <select
            id={id}
            className={cn(
              "w-full px-3 py-2 text-sm bg-bg-secondary text-white rounded-input border border-border-custom transition-all duration-200 outline-none placeholder:text-text-muted focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer",
              {
                "border-brand-error focus:border-brand-error focus:ring-brand-error/30":
                  error,
              },
              className
            )}
            ref={ref}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-bg-card text-white">
                {opt.label}
              </option>
            ))}
          </select>
          {/* Custom Chevron Indicator */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-muted">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
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
Select.displayName = "Select";

export { Select };
