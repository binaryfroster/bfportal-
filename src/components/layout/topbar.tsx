"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Settings, LogOut, Search, Download, ShieldCheck, Sparkles, Smartphone, Monitor } from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { NotificationBell } from "@/src/components/layout/notification-bell";
import { Dropdown } from "@/src/components/ui/dropdown";

interface TopbarProps {
  onMenuToggle: () => void;
  title?: string;
  onOpenDownloadModal?: () => void;
}

export function Topbar({ onMenuToggle, title, onOpenDownloadModal }: TopbarProps) {
  const { user, logout } = useUser();

  const userMenuItems = [
    {
      label: "Profile & Security",
      value: "settings",
      icon: <Settings className="w-4 h-4 text-cyan-400" />,
      onClick: () => {
        window.location.href = "/settings";
      },
    },
    {
      label: "Download Mobile & Web App",
      value: "download",
      icon: <Download className="w-4 h-4 text-emerald-400" />,
      onClick: () => {
        if (onOpenDownloadModal) onOpenDownloadModal();
      },
    },
    {
      label: "Log Out",
      value: "logout",
      icon: <LogOut className="w-4 h-4 text-rose-400" />,
      onClick: logout,
    },
  ];

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-16 bg-[#0A0D14]/90 backdrop-blur-xl border-b border-slate-800/80 shrink-0 z-30 sticky top-0">
      {/* Mobile menu button & Title */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer md:hidden border border-slate-800 focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {title && (
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-white">
              {title}
            </h1>
            <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              Verified Studio
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* APP DOWNLOAD BUTTON */}
        <button
          onClick={onOpenDownloadModal}
          className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-cyan-500/10 hover:from-cyan-500/20 hover:to-emerald-500/20 border border-cyan-500/40 hover:border-cyan-400 rounded-xl text-cyan-300 hover:text-white transition-all cursor-pointer font-mono text-xs shadow-lg shadow-cyan-500/10 group active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400 group-hover:animate-bounce" />
          <span className="font-bold uppercase text-[11px] tracking-wide">
            DOWNLOAD <span className="text-emerald-400">APP</span>
          </span>
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={() => {
            const event = new KeyboardEvent("keydown", { metaKey: true, key: "k" });
            window.dispatchEvent(event);
          }}
          className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer font-mono text-xs"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cmd+K</span>
        </button>

        {/* Notification Bell */}
        <NotificationBell />

        {/* User profile dropdown */}
        {user && (
          <Dropdown
            align="right"
            trigger={
              <button className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-cyan-500/30 overflow-hidden flex items-center justify-center font-mono font-bold text-cyan-400 text-xs shadow-inner">
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
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 capitalize">
                    {user.role}
                  </span>
                </div>
              </button>
            }
            items={userMenuItems}
          />
        )}
      </div>
    </header>
  );
}
