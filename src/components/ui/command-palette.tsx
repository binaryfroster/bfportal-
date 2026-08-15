"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
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
  Bot,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const actions = [
    { name: "Go to Dashboard", icon: LayoutDashboard, category: "Navigation", href: "/dashboard" },
    { name: "Go to Project Tracker", icon: Calendar, category: "Navigation", href: "/project" },
    { name: "Go to Kanban Board", icon: Kanban, category: "Navigation", href: "/tasks" },
    { name: "Go to Files Vault", icon: FolderOpen, category: "Navigation", href: "/files" },
    { name: "Go to Deliverables Approvals", icon: FileCheck2, category: "Navigation", href: "/approvals" },
    { name: "Go to Billing & Invoices", icon: CreditCard, category: "Navigation", href: "/billing" },
    { name: "Go to Communication Hub", icon: MessageSquare, category: "Navigation", href: "/messages" },
    { name: "Go to Meeting Scheduler", icon: Video, category: "Navigation", href: "/meetings" },
    { name: "Go to Support Tickets", icon: HelpCircle, category: "Navigation", href: "/tickets" },
    { name: "Go to Contracts & NDA", icon: ShieldCheck, category: "Navigation", href: "/contracts" },
    { name: "Go to Client 360° Hub", icon: Sparkles, category: "Navigation", href: "/client-360" },
    { name: "Go to Change Requests", icon: Plus, category: "Navigation", href: "/change-requests" },
    { name: "Go to Maintenance & SLA", icon: ShieldCheck, category: "Navigation", href: "/maintenance" },
    { name: "Go to Handover Vault", icon: FolderOpen, category: "Navigation", href: "/handover" },
    { name: "Go to Knowledge Base", icon: Search, category: "Navigation", href: "/knowledge-base" },
    { name: "Go to Integrations Hub", icon: Settings, category: "Navigation", href: "/integrations" },
    { name: "Go to Settings", icon: Settings, category: "Navigation", href: "/settings" },
    { name: "Ask AI Client Copilot", icon: Bot, category: "AI Actions", href: "/messages?action=ai" },
  ];

  const filtered = actions.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
          setQuery("");
          setSelectedIndex(0);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleKeyDownInMenu = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex].href);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-xl bg-bg-card border border-border-custom rounded-card shadow-glow overflow-hidden z-10"
        >
          <div className="flex items-center px-4 py-3 border-b border-border-custom/50 bg-bg-secondary">
            <Search className="h-4 w-4 text-accent-primary mr-3 shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Type a command or search portal routes... (Press Esc to close)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDownInMenu}
              className="w-full bg-transparent text-white placeholder-text-muted text-sm font-mono outline-none"
            />
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-text-muted bg-bg-primary border border-border-custom rounded">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs text-text-muted">
                // NO COMMAND MATCHES FOUND
              </div>
            ) : (
              filtered.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(item.href)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-input text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-accent-primary/10 border border-accent-primary/40 text-white"
                        : "text-text-secondary hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`h-4 w-4 ${
                          isSelected ? "text-accent-primary animate-pulse" : "text-text-muted"
                        }`}
                      />
                      <span className="font-mono text-xs font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[9px] text-text-muted uppercase">
                        {item.category}
                      </span>
                      {isSelected && <ArrowRight className="h-3 w-3 text-accent-primary" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <div className="p-2 border-t border-border-custom/40 bg-bg-secondary/40 text-center font-mono text-[9px] text-text-muted">
            Tip: Press <span className="text-accent-primary">Cmd+K</span> anywhere to trigger Command Palette
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
