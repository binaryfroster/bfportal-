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
} from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { cn } from "@/src/lib/utils";

interface SidebarProps {
  className?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ className, isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useUser();

  const navigationItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["client", "admin", "client_admin", "client_user", "super_admin"] },
    { label: "Client 360° Hub", path: "/client-360", icon: Sparkles, roles: ["client", "admin", "client_admin", "super_admin", "account_manager"] },
    { label: "Project Tracker", path: "/project", icon: Calendar, roles: ["client", "admin", "client_admin", "client_user", "super_admin"] },
    { label: "Kanban Board", path: "/tasks", icon: Kanban, roles: ["client", "admin", "client_admin", "client_user", "super_admin"] },
    { label: "Change Requests", path: "/change-requests", icon: GitPullRequest, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "Files & Documents", path: "/files", icon: FolderOpen, roles: ["client", "admin", "client_admin", "client_user", "super_admin"] },
    { label: "Approvals", path: "/approvals", icon: FileCheck2, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "Billing & Invoices", path: "/billing", icon: CreditCard, roles: ["client", "admin", "client_admin", "super_admin", "finance"] },
    { label: "Communication Hub", path: "/messages", icon: MessageSquare, roles: ["client", "admin", "client_admin", "client_user", "super_admin"] },
    { label: "Meeting Scheduler", path: "/meetings", icon: Video, roles: ["client", "admin", "client_admin", "client_user", "super_admin"] },
    { label: "Support Tickets", path: "/tickets", icon: HelpCircle, roles: ["client", "admin", "client_admin", "client_user", "super_admin", "support_agent"] },
    { label: "Maintenance & SLA", path: "/maintenance", icon: Activity, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "Handover Vault", path: "/handover", icon: BookOpen, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "Contracts & NDA", path: "/contracts", icon: ShieldCheck, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "Credential Vault", path: "/credential-vault", icon: KeyRound, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "Analytics", path: "/analytics", icon: BarChart3, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "Knowledge Base", path: "/knowledge-base", icon: MessageCircleQuestion, roles: ["client", "admin", "client_admin", "client_user", "super_admin"] },
    { label: "Integrations", path: "/integrations", icon: Plug, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "API & Webhooks", path: "/api-keys", icon: Terminal, roles: ["client", "admin", "client_admin", "super_admin"] },
    { label: "Settings", path: "/settings", icon: Settings, roles: ["client", "admin", "client_admin", "client_user", "super_admin"] },
    { label: "Admin Panel", path: "/admin", icon: ShieldAlert, roles: ["admin", "super_admin"] },
  ];

  const filteredNav = navigationItems.filter((item) =>
    item.roles.includes(user?.role || "client")
  );

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-bg-secondary border-r border-border-custom transition-all duration-300 z-40 fixed md:static",
        {
          "w-64": isOpen,
          "w-20": !isOpen,
          "-translate-x-full md:translate-x-0": !isOpen, // hide on mobile if closed
        },
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-border-custom">
        <Link href="/dashboard" className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-accent-primary to-[#008ebb] flex items-center justify-center font-bold font-mono text-bg-primary">
            BF
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-white leading-none">
                BINARY FROSTER
              </span>
              <span className="text-[9px] font-mono text-text-muted mt-0.5">
                PORTAL V1.0
              </span>
            </div>
          )}
        </Link>
        {/* Toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded bg-bg-card hover:bg-neutral-800 text-text-secondary hover:text-white transition-colors cursor-pointer hidden md:block"
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
                "flex items-center py-3 rounded-input transition-all duration-200 group relative",
                {
                  "px-4 justify-start": isOpen,
                  "px-0 justify-center": !isOpen,
                  "bg-white/5 text-white font-medium border-l-2 border-accent-primary pl-3.5": isActive,
                  "text-text-secondary hover:bg-white/[0.02] hover:text-white pl-4": !isActive,
                }
              )}
            >
              <Icon
                className={cn("w-5 h-5 shrink-0 transition-colors", {
                  "text-accent-primary": isActive,
                  "text-text-muted group-hover:text-white": !isActive,
                })}
              />
              {isOpen && (
                <span className="ml-3 text-sm truncate font-mono text-xs uppercase tracking-wider">
                  {item.label}
                </span>
              )}
              {!isOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-bg-card border border-border-custom text-white text-[10px] font-mono font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer User Widget */}
      {user && (
        <div className="p-4 border-t border-border-custom bg-bg-card/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-border-custom shrink-0 overflow-hidden flex items-center justify-center font-mono font-bold text-text-secondary text-xs">
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
                  <p className="text-xs font-semibold text-white truncate leading-none">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-mono text-text-muted truncate mt-0.5">
                    {user.companyName}
                  </p>
                </div>
              )}
            </div>
            {isOpen && (
              <button
                onClick={logout}
                className="p-1.5 rounded text-text-muted hover:text-brand-error hover:bg-white/5 transition-colors cursor-pointer"
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
