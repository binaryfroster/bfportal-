"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Settings, LogOut, User, Search } from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { NotificationBell } from "@/src/components/layout/notification-bell";
import { Dropdown } from "@/src/components/ui/dropdown";

interface TopbarProps {
  onMenuToggle: () => void;
  title?: string;
}

export function Topbar({ onMenuToggle, title }: TopbarProps) {
  const { user, logout } = useUser();

  const userMenuItems = [
    {
      label: "Profile Settings",
      value: "settings",
      icon: <Settings className="w-4 h-4" />,
      onClick: () => {
        window.location.href = "/settings";
      },
    },
    {
      label: "Log Out",
      value: "logout",
      icon: <LogOut className="w-4 h-4 text-brand-error" />,
      onClick: logout,
    },
  ];

  return (
    <header className="flex items-center justify-between px-6 h-16 bg-bg-primary border-b border-border-custom shrink-0 z-30 sticky top-0">
      {/* Mobile menu button & Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded bg-bg-secondary hover:bg-neutral-800 text-text-secondary hover:text-white transition-colors cursor-pointer md:hidden border border-border-custom focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h1 className="text-sm font-semibold font-mono uppercase tracking-wider text-white">
            {title}
          </h1>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        {/* Command Palette Trigger */}
        <button
          onClick={() => {
            const event = new KeyboardEvent("keydown", { metaKey: true, key: "k" });
            window.dispatchEvent(event);
          }}
          className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-bg-secondary hover:bg-neutral-800 border border-border-custom hover:border-accent-primary/40 rounded-input text-text-muted hover:text-white transition-all cursor-pointer font-mono text-xs focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:outline-none"
        >
          <Search className="w-3.5 h-3.5 text-accent-primary" />
          <span>Search or Cmd+K</span>
        </button>

        {/* Notification Bell */}
        <NotificationBell />

        {/* User profile dropdown */}
        {user && (
          <Dropdown
            align="right"
            trigger={
              <button className="flex items-center space-x-2.5 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:outline-none">
                <div className="w-8 h-8 rounded-full bg-neutral-800 border border-border-custom overflow-hidden flex items-center justify-center font-mono font-bold text-text-secondary text-xs">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <span className="text-xs font-medium text-white hidden sm:block">
                  {user.name}
                </span>
              </button>
            }
            items={userMenuItems}
          />
        )}
      </div>
    </header>
  );
}
