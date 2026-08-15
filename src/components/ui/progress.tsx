import * as React from "react";
import { cn } from "@/src/lib/utils";

// Linear progress bar
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  showLabel?: boolean;
}

export function Progress({ className, value, showLabel = false, ...props }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="relative w-full h-2 bg-bg-secondary rounded-full overflow-hidden border border-border-custom">
        <div
          className="h-full bg-gradient-to-r from-accent-primary to-[#008ebb] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-end mt-1">
          <span className="text-xs font-mono text-text-secondary">{percentage}%</span>
        </div>
      )}
    </div>
  );
}

// Circular progress indicator (SVG)
export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  size?: number; // width/height in px
  strokeWidth?: number;
}

export function CircularProgress({
  className,
  value,
  size = 120,
  strokeWidth = 8,
  ...props
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#1f1f1f"
          strokeWidth={strokeWidth}
          className="stroke-border-custom"
        />
        {/* Active Gradient Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        {/* Definitions for Gradients */}
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#008ebb" />
          </linearGradient>
        </defs>
      </svg>
      {/* Centered text */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold font-mono tracking-tight text-white">
          {percentage}%
        </span>
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
          Complete
        </span>
      </div>
    </div>
  );
}
