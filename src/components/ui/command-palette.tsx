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
  Activity,
  KeyRound,
  BarChart3,
  MessageCircleQuestion,
  FileText,
  CheckCircle2,
  FolderKanban,
  Terminal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortalData } from "@/src/components/providers/portal-data-provider";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const {
    tasks,
    tickets,
    invoices,
    approvals,
    files,
    milestones,
    knowledgeArticles,
    adminProjects,
  } = usePortalData();

  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [activeCategory, setActiveCategory] = React.useState("ALL");

  // Base navigation and action items
  const baseActions = [
    { name: "Dashboard", subtitle: "Executive project metrics and summary", icon: LayoutDashboard, category: "Navigation", href: "/dashboard" },
    { name: "Client Projects Management", subtitle: "Dedicated admin panel for client project orchestration", icon: FolderKanban, category: "Admin", href: "/admin/projects" },
    { name: "Admin Operations & System Controls", subtitle: "Global approvals, invoice overrides, and email audit logs", icon: ShieldCheck, category: "Admin", href: "/admin" },
    { name: "Live Activity & Audit Stream", subtitle: "Tamper-evident audit logs and live system events", icon: Activity, category: "Navigation", href: "/activity" },
    { name: "Project Workspace & Timeline", subtitle: "6-phase engineering stepper and milestones", icon: Calendar, category: "Navigation", href: "/project" },
    { name: "Kanban Sprint Board", subtitle: "Manage, move, and edit sprint tasks", icon: Kanban, category: "Navigation", href: "/tasks" },
    { name: "Deliverables & Approvals", subtitle: "Sign off or request revisions on project deliverables", icon: FileCheck2, category: "Navigation", href: "/approvals" },
    { name: "Billing, Invoices & Treasury", subtitle: "Instant checkout, PDF receipts, and revenue stats", icon: CreditCard, category: "Navigation", href: "/billing" },
    { name: "Support & Incident Tickets", subtitle: "SLA ticket queue, live replies, and triage", icon: HelpCircle, category: "Navigation", href: "/tickets" },
    { name: "Secure File Vault", subtitle: "Phase-scoped assets, uploads, and versioning tree", icon: FolderOpen, category: "Navigation", href: "/files" },
    { name: "Contracts & Cryptographic E-Sign", subtitle: "Legal agreements, MSA, and signed PDF archive", icon: ShieldCheck, category: "Navigation", href: "/contracts" },
    { name: "Client 360° Intelligence Hub", subtitle: "Client health score, notes, and CRM matrix", icon: Sparkles, category: "Navigation", href: "/client-360" },
    { name: "Scope Change Requests", subtitle: "Submit and approve technical scope amendments", icon: Plus, category: "Navigation", href: "/change-requests" },
    { name: "SLA & 24/7 Maintenance", subtitle: "Uptime guarantees, tier metrics, and incident logging", icon: Activity, category: "Navigation", href: "/maintenance" },
    { name: "Project Handover Vault", subtitle: "Architecture docs, repo access, and formal signoff", icon: FolderOpen, category: "Navigation", href: "/handover" },
    { name: "Knowledge Base & Guides", subtitle: "Interactive documentation, API specs, and rules", icon: MessageCircleQuestion, category: "Navigation", href: "/knowledge-base" },
    { name: "Credentials & Secrets Vault", subtitle: "Encrypted API tokens and database keys", icon: KeyRound, category: "Navigation", href: "/credential-vault" },
    { name: "Real-time Telemetry & Analytics", subtitle: "Velocity, burndown, and performance graphs", icon: BarChart3, category: "Navigation", href: "/analytics" },
    { name: "API Keys & Service Tokens", subtitle: "Generate, rotate, and manage Bearer API tokens", icon: Terminal, category: "Navigation", href: "/api-keys" },
    { name: "User Profile & Security Settings", subtitle: "Session security and notification settings", icon: Settings, category: "Navigation", href: "/settings" },
    { name: "Ask AI Engineering Copilot", subtitle: "Instant AI answers regarding project status", icon: Bot, category: "AI Actions", href: "/messages?action=ai" },
    { name: "Generate AI Proposal", subtitle: "Create cost estimations and project proposals with AI", icon: Sparkles, category: "AI Actions", href: "/proposals?action=create" },
    { name: "View All Proposals", subtitle: "Browse, edit, and export client proposals", icon: FileText, category: "Navigation", href: "/proposals" },
  ];

  const projectItems = (adminProjects || []).map((p) => ({
    name: `Project: ${p.name}`,
    subtitle: `${p.companyName} • Phase: ${p.phase} (${p.progress}%) • Budget: $${p.budget.toLocaleString()}`,
    icon: FolderKanban,
    category: "Projects",
    href: `/admin/projects?id=${p.id}`,
  }));

  // Dynamic entity search entries
  const taskItems = (tasks || []).map((t) => ({
    name: `Task: ${t.title}`,
    subtitle: `[${t.column}] Assigned: ${t.assignedToName} • Priority: ${t.priority}`,
    icon: Kanban,
    category: "Tasks",
    href: `/tasks?id=${t.id}`,
  }));

  const ticketItems = (tickets || []).map((t) => ({
    name: `Ticket #${t.id}: ${t.title}`,
    subtitle: `Status: ${t.status} • Category: ${t.category} • Priority: ${t.priority}`,
    icon: HelpCircle,
    category: "Tickets",
    href: `/tickets?id=${t.id}`,
  }));

  const invoiceItems = (invoices || []).map((i) => ({
    name: `Invoice ${i.invoiceNumber}: ${i.description}`,
    subtitle: `Amount: $${i.total.toLocaleString()} • Status: ${i.status} • Due: ${i.dueDate}`,
    icon: CreditCard,
    category: "Billing",
    href: `/billing?id=${i.id}`,
  }));

  const approvalItems = (approvals || []).map((a) => ({
    name: `Deliverable: ${a.name}`,
    subtitle: `Status: ${a.status} • Reviewer: ${a.reviewerName || "Unassigned"}`,
    icon: FileCheck2,
    category: "Approvals",
    href: `/approvals?id=${a.id}`,
  }));

  const fileItems = (files || []).map((f) => ({
    name: `File: ${f.name}`,
    subtitle: `Phase: ${f.phase} • Size: ${f.size} • v${f.version}`,
    icon: FileText,
    category: "Files",
    href: `/files?id=${f.id}`,
  }));

  const kbItems = (knowledgeArticles || []).map((k) => ({
    name: `Guide: ${k.title}`,
    subtitle: `Category: ${k.category} • ${k.readTime} read`,
    icon: MessageCircleQuestion,
    category: "Knowledge Base",
    href: `/knowledge-base?id=${k.id}`,
  }));

  const milestoneItems = (milestones || []).map((m) => ({
    name: `Milestone: ${m.title}`,
    subtitle: `Status: ${m.status} • Due: ${m.dueDate}`,
    icon: Calendar,
    category: "Milestones",
    href: `/project?id=${m.id}`,
  }));

  const allItems = [
    ...baseActions,
    ...projectItems,
    ...taskItems,
    ...ticketItems,
    ...invoiceItems,
    ...approvalItems,
    ...fileItems,
    ...kbItems,
    ...milestoneItems,
  ];

  const categories = ["ALL", "Navigation", "Projects", "Tasks", "Tickets", "Billing", "Approvals", "Files", "Knowledge Base"];

  const filtered = allItems.filter((item) => {
    const matchesCategory =
      activeCategory === "ALL" || item.category.toLowerCase() === activeCategory.toLowerCase();

    const matchesQuery =
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
      item.category.toLowerCase().includes(query.toLowerCase());

    return matchesCategory && matchesQuery;
  });

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
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
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-bg-card border border-border-custom rounded-card shadow-2xl overflow-hidden z-10"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-border-custom/60 bg-bg-secondary">
            <Search className="h-4.5 w-4.5 text-accent-primary mr-3 shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search anything (tasks, tickets, invoices, files, guides, or routes)..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDownInMenu}
              className="w-full bg-transparent text-white placeholder-text-muted text-xs sm:text-sm font-sans outline-none"
            />
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-text-muted bg-bg-primary border border-border-custom rounded">
              ESC
            </kbd>
          </div>

          {/* Category Chips Filter */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border-custom/40 bg-bg-secondary/40 overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedIndex(0);
                }}
                className={`text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/40 font-bold"
                    : "text-text-muted hover:text-white hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="p-10 text-center font-mono text-xs text-text-muted space-y-1">
                <p className="text-white font-medium">// NO MATCHING ENTITIES FOUND</p>
                <p className="text-[10px]">Try searching for task titles, invoice numbers, ticket names, or routes.</p>
              </div>
            ) : (
              filtered.slice(0, 40).map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(item.href)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-input text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-accent-primary/10 border border-accent-primary/40 text-white"
                        : "text-text-secondary hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <div
                        className={`p-1.5 rounded ${
                          isSelected ? "bg-accent-primary/20 text-accent-primary" : "bg-bg-secondary text-text-muted"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                      </div>
                      <div className="min-w-0 truncate">
                        <span className="font-sans text-xs font-medium text-white truncate block">
                          {item.name}
                        </span>
                        {item.subtitle && (
                          <span className="font-sans text-[10px] text-text-muted truncate block">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="font-mono text-[9px] text-accent-primary/80 bg-accent-primary/5 px-2 py-0.5 rounded border border-accent-primary/20 uppercase">
                        {item.category}
                      </span>
                      {isSelected && <ArrowRight className="h-3.5 w-3.5 text-accent-primary" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2 border-t border-border-custom/40 bg-bg-secondary/60 flex items-center justify-between font-mono text-[9px] text-text-muted">
            <span>
              Showing <strong className="text-white">{Math.min(filtered.length, 40)}</strong> results
            </span>
            <div className="flex items-center gap-3">
              <span>Navigate <kbd className="text-accent-primary">↑ ↓</kbd></span>
              <span>Select <kbd className="text-accent-primary">↵ Enter</kbd></span>
              <span>Close <kbd className="text-accent-primary">Esc</kbd></span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
