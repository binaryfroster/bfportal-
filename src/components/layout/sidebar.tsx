"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Kanban,
  FolderOpen,
  FileCheck2,
  CreditCard,
  MessageSquare,
  Video,
  HelpCircle,
  ShieldCheck,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  GitPullRequest,
  BookOpen,
  Activity,
  KeyRound,
  BarChart3,
  Plug,
  Terminal,
  MessageCircleQuestion,
  Download,
  Users
} from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { cn } from "@/src/lib/utils";

interface SidebarProps {
  className?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenDownloadModal?: () => void;
}

export function Sidebar({ className, isOpen, setIsOpen, onOpenDownloadModal }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useUser();

  const navigationItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["client", "admin", "client_admin", "client_user", "super_admin"] },
    { label: "Client 360° Hub", path: "/client-360", icon: Sparkles, roles: ["client", "admin", "client_admin", "super_admin", "account_manager"] },
    { label: "Project Workspace", path: "/project", icon: Calendar, roles: ["client", "admin", "client_admin", "client_user", "super_admin"] },
    { label: "Kanban Board", path: "/tasks", icon: Kanban, roles: ["client", "admin", "client_admin", "client_user", "super_admin"] },
    { label: "Change Requests", path: "/change-requests", icon: GitPullRequest, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "Files & Vault", path: "/files", icon: FolderOpen, roles: ["client", "admin", "client_admin", "client_user", "super_admin"] },
    { label: "Approvals", path: "/approvals", icon: FileCheck2, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "Billing & Revenue", path: "/billing", icon: CreditCard, roles: ["client", "admin", "client_admin", "super_admin", "finance"] },
    { label: "Meetings", path: "/meetings", icon: Video, roles: ["client", "admin", "client_admin", "client_user", "super_admin"] },
    { label: "Support & Tickets", path: "/tickets", icon: HelpCircle, roles: ["client", "admin", "client_admin", "client_user", "super_admin", "support_agent"] },
    { label: "SLA Maintenance", path: "/maintenance", icon: Activity, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "Project Handover", path: "/handover", icon: BookOpen, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "Contracts & NDA", path: "/contracts", icon: ShieldCheck, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "Credentials", path: "/credential-vault", icon: KeyRound, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "Analytics", path: "/analytics", icon: BarChart3, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "Knowledge Base", path: "/knowledge-base", icon: MessageCircleQuestion, roles: ["client", "admin", "client_admin", "client_user", "super_admin"] },
    { label: "API & Webhooks", path: "/api-keys", icon: Terminal, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "User Settings", path: "/settings", icon: Settings, roles: ["client", "admin", "client_admin", "client_user", "super_admin"] },
    { label: "Admin Panel", path: "/admin", icon: ShieldAlert, roles: ["admin", "super_admin"] },
  ];

  const filteredNav = navigationItems.filter((item) =>
    item.roles.includes(user?.role || "client")
  );

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-[#0F172A] border-r border-slate-800/90 transition-all duration-300 z-40 fixed md:static shadow-2xl",
        {
          "w-64": isOpen,
          "w-20": !isOpen,
          "-translate-x-full md:translate-x-0": !isOpen,
        },
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center space-x-3 overflow-hidden group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-bold font-mono text-slate-950 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            BF
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-white leading-none">
                BINARY <span className="text-cyan-400">FROSTER</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-widest">
                CLIENT PORTAL V1.0
              </span>
            </div>
          )}
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer hidden md:block border border-slate-800"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {filteredNav.map((item, index) => {
          const isActive = pathname === item.path || pathname?.startsWith(item.path + "/");
          const Icon = item.icon;

          return (
            <Link
              key={index}
              href={item.path}
              className={cn(
                "flex items-center py-2.5 rounded-xl transition-all duration-200 group relative cursor-pointer",
                {
                  "px-3.5 justify-start": isOpen,
                  "px-0 justify-center": !isOpen,
                  "bg-gradient-to-r from-cyan-500/15 to-emerald-500/10 text-cyan-300 font-bold border-l-2 border-cyan-400 pl-3": isActive,
                  "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200": !isActive,
                }
              )}
            >
              <Icon
                className={cn("w-4 h-4 shrink-0 transition-colors", {
                  "text-cyan-400": isActive,
                  "text-slate-400 group-hover:text-slate-200": !isActive,
                })}
              />
              {isOpen && (
                <span className="ml-3 text-xs font-mono uppercase tracking-wide truncate">
                  {item.label}
                </span>
              )}
              {!isOpen && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 border border-slate-800 text-white text-[10px] font-mono font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* APP DOWNLOAD FOOTER BADGE */}
      {isOpen && (
        <div className="mx-3 mb-3 p-3 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
              <Download className="h-3 w-3" /> GET APP
            </span>
            <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">v1.0 LIVE</span>
          </div>
          <p className="text-[10px] font-sans text-slate-300 leading-tight">
            Install Desktop App (.exe) or Mobile APK (.apk)
          </p>
          <button
            onClick={onOpenDownloadModal}
            className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-[10px] font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <Download className="h-3 w-3" /> DOWNLOAD APP
          </button>
        </div>
      )}

      {/* Executive Founders Info & User Profile */}
      {user && (
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-cyan-500/30 shrink-0 overflow-hidden flex items-center justify-center font-mono font-bold text-cyan-400 text-xs">
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
              {isOpen && (
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate leading-none">
                    {user.name}
                  </p>
                  <p className="text-[9px] font-mono text-slate-400 truncate mt-0.5">
                    {user.companyName}
                  </p>
                </div>
              )}
            </div>
            {isOpen && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
