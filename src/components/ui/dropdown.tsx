"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ trigger, items, align = "right", className }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-56 rounded-card border border-border-custom bg-bg-card p-1 shadow-lg focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200",
            {
              "right-0": align === "right",
              "left-0": align === "left",
            },
            className
          )}
        >
          <div className="py-1">
            {items.map((item, idx) => (
              <button
                key={idx}
                disabled={item.disabled}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-white rounded-input transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
                  {
                    "font-medium": true,
                  }
                )}
              >
                {item.icon && <span className="mr-2 text-text-muted">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
