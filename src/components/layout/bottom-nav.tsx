"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, CheckSquare, MessageSquare, Download } from "lucide-react";

interface BottomNavProps {
  onOpenDownloadModal: () => void;
}

export function BottomNav({ onOpenDownloadModal }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/project", label: "Workspace", icon: FolderKanban },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <nav aria-label="Mobile Bottom Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-xl border-t border-slate-800 pb-[env(safe-area-inset-bottom)] shadow-2xl">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 min-h-[48px] cursor-pointer transition-all active:scale-95 ${
                isActive ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-cyan-400 animate-pulse" : "text-slate-400"}`} />
              <span className="text-[10px] font-mono mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Download App Action */}
        <button
          onClick={onOpenDownloadModal}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 min-h-[48px] text-emerald-400 hover:text-emerald-300 transition-all active:scale-95 cursor-pointer"
        >
          <div className="p-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
            <Download className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-[9px] font-mono font-bold mt-0.5 tracking-tight uppercase">Get App</span>
        </button>
      </div>
    </nav>
  );
}
