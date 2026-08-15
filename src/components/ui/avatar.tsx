import * as React from "react";
import { cn, getInitials } from "@/src/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  status?: "online" | "offline";
}

export function Avatar({
  className,
  src,
  name,
  size = "md",
  showStatus = false,
  status = "offline",
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };

  const badgeSizeClasses = {
    sm: "w-2.5 h-2.5 border-1.5",
    md: "w-3 h-3 border-2",
    lg: "w-4 h-4 border-2.5",
    xl: "w-5.5 h-5.5 border-3",
  };

  return (
    <div className="relative inline-block" {...props}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full overflow-hidden border border-border-custom bg-bg-secondary select-none text-text-secondary font-semibold font-mono",
          sizeClasses[size],
          className
        )}
      >
        {src && !hasError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-bg-primary",
            badgeSizeClasses[size],
            {
              "bg-brand-success": status === "online",
              "bg-text-muted": status === "offline",
            }
          )}
        />
      )}
    </div>
  );
}
