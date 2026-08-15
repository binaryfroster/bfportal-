"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex border-b border-border-custom", className)}>
      <nav className="flex -mb-px space-x-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "group flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer",
                {
                  "border-accent-primary text-accent-primary": isActive,
                  "border-transparent text-text-secondary hover:text-white hover:border-border-custom": !isActive,
                }
              )}
            >
              {tab.icon && (
                <span
                  className={cn("mr-2 transition-colors", {
                    "text-accent-primary": isActive,
                    "text-text-muted group-hover:text-text-secondary": !isActive,
                  })}
                >
                  {tab.icon}
                </span>
              )}
              <span className="font-mono text-xs uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
