"use client";

import * as React from "react";
import {
  HelpCircle,
  Plus,
  AlertTriangle,
  X,
  Clock,
  Search,
  CheckCircle2,
  Filter,
  Send,
  UserCheck,
  Paperclip,
  Activity,
  ShieldAlert,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Layers,
  FileCode,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

interface Reply {
  id?: string;
  senderName: string;
  senderRole: "client" | "admin";
  senderAvatar?: string;
  content: string;
  timestamp: string;
  attachmentName?: string;
}

interface SupportTicket {
  id: string;
  ticketNumber?: string;
  title: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Under Technical Review" | "Awaiting Client Response" | "Resolved";
  description: string;
  clientName: string;
  assignedEngineer?: string;
  assignedAvatar?: string;
  phase?: string;
  replies: Reply[];
}

export default function TicketsPage() {
  const { user } = useUser();
  const { loading: dataLoading, tickets, createTicket, replyToTicket, resolveTicket } = usePortalData();
  
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("ALL");

  // Form states
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("Bug Report");
  const [priority, setPriority] = React.useState<SupportTicket["priority"]>("High");
  const [phase, setPhase] = React.useState("Build Phase");
  const [description, setDescription] = React.useState("");
  const [attachmentName, setAttachmentName] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Response states
  const [response, setResponse] = React.useState("");
  const [adminSender, setAdminSender] = React.useState<"Shivam" | "Jawad" | "Digvijay">("Shivam");
  const [replying, setReplying] = React.useState(false);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  // Filtered tickets
  const filteredTickets = React.useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.id && t.id.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
      const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  React.useEffect(() => {
    if (filteredTickets.length > 0 && (!selectedTicketId || !tickets.find(t => t.id === selectedTicketId))) {
      setSelectedTicketId(filteredTickets[0].id);
    }
  }, [filteredTickets, selectedTicketId, tickets]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    createTicket({
      title,
      category,
      priority,
      status: "Open" as const,
      description: `${description}${attachmentName ? `\n\n[Attached Reference: ${attachmentName}]` : ""}`,
      clientName: user?.name || "Client User",
    });

    setShowCreateForm(false);
    setTitle("");
    setDescription("");
    setAttachmentName("");
    setSubmitting(false);

    toast.success("Support ticket enqueued & dispatched to on-call engineering leads!");
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !response.trim()) return;

    setReplying(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const isClient = user?.role !== "admin";
    const senderName = isClient
      ? user?.name || "Client User"
      : adminSender === "Shivam"
      ? "Shivam Dube (AI Lead)"
      : adminSender === "Jawad"
      ? "Jawad Khan (Backend Lead)"
      : "Digvijay Kadam (UX Lead)";

    const newReply: Reply = {
      senderName,
      senderRole: isClient ? "client" : "admin",
      senderAvatar: isClient
        ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
        : adminSender === "Shivam"
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        : adminSender === "Jawad"
        ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
        : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      content: response.trim(),
      timestamp: new Date().toISOString(),
    };

    replyToTicket(selectedTicket.id, newReply);
    setResponse("");
    setReplying(false);

    toast.success("Response sent to support thread");
  };

  const handleStatusUpdate = (statusLabel: string) => {
    if (!selectedTicket) return;
    resolveTicket(selectedTicket.id);
    toast.success(`Ticket marked as: ${statusLabel}`);
  };

  const getSlaInfo = (p: string) => {
    switch (p) {
      case "Critical":
        return { time: "< 1 Hour Response", badge: "bg-red-500/20 text-red-400 border-red-500/30" };
      case "High":
        return { time: "< 4 Hours Response", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
      case "Medium":
        return { time: "< 12 Hours Response", badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" };
      default:
        return { time: "< 24 Hours Response", badge: "bg-slate-500/20 text-slate-400 border-slate-500/30" };
    }
  };

  if (dataLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 bg-[#0F172A] border border-slate-800 rounded-xl w-full" />
        <Skeleton className="h-96 bg-[#0F172A] border border-slate-800 rounded-xl w-full" />
      </div>
    );
  }

  const openTicketsCount = tickets.filter(t => t.status !== "Resolved").length;
  const criticalCount = tickets.filter(t => t.priority === "Critical" && t.status !== "Resolved").length;

  return (
    <div className="space-y-6">
      {/* SLA & SUPPORT METRICS BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0F172A]/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Active Incidents</span>
            <span className="text-2xl font-bold font-sans text-white">{openTicketsCount}</span>
          </div>
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <HelpCircle className="h-5 w-5 text-cyan-400" />
          </div>
        </div>

        <div className="bg-[#0F172A]/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Critical / P1 Incidents</span>
            <span className={`text-2xl font-bold font-sans ${criticalCount > 0 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
              {criticalCount}
            </span>
          </div>
          <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
            <ShieldAlert className="h-5 w-5 text-red-400" />
          </div>
        </div>

        <div className="bg-[#0F172A]/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Avg Response Time</span>
            <span className="text-2xl font-bold font-sans text-cyan-400">~18 Mins</span>
          </div>
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <Clock className="h-5 w-5 text-cyan-400" />
          </div>
        </div>

        <div className="bg-[#0F172A]/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">SLA Compliance</span>
            <span className="text-2xl font-bold font-sans text-emerald-400">99.8%</span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Enterprise Support & Ticket Triage</h2>
            <span className="text-[10px] font-mono text-slate-400">Direct escalation gateway to Shivam, Jawad & Digvijay</span>
          </div>
        </div>

        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" />
          RAISE SUPPORT TICKET
        </Button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-[#0F172A]/80 border border-slate-800 rounded-xl">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by title, category, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0A0D14] border border-slate-700 rounded-lg text-xs font-sans text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#0A0D14] border border-slate-700 rounded-lg text-xs font-mono text-slate-200 px-2.5 py-1.5 focus:border-cyan-400 outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full bg-[#0A0D14] border border-slate-700 rounded-lg text-xs font-mono text-slate-200 px-2.5 py-1.5 focus:border-cyan-400 outline-none cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical (P1)</option>
            <option value="High">High (P2)</option>
            <option value="Medium">Medium (P3)</option>
            <option value="Low">Low (P4)</option>
          </select>
        </div>
      </div>

      {/* MAIN CONTENT: TICKET LIST & THREAD DETAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TICKET LIST (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">// ACTIVE TICKETS QUEUE ({filteredTickets.length})</span>
            {statusFilter !== "ALL" && (
              <button onClick={() => setStatusFilter("ALL")} className="text-[9px] font-mono text-cyan-400 hover:underline">
                [Clear Filter]
              </button>
            )}
          </div>

          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center bg-[#0F172A] border border-dashed border-slate-800 rounded-xl space-y-2">
              <HelpCircle className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="text-xs font-mono text-slate-400">// NO TICKETS MATCHING SEARCH CRITERIA</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                const sla = getSlaInfo(t.priority);

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2.5 cursor-pointer ${
                      isSelected
                        ? "bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                        : "bg-[#0F172A] border-slate-800 hover:border-slate-700 text-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 w-full">
                      <h4 className="font-sans text-xs font-bold text-white line-clamp-1 flex-1">{t.title}</h4>
                      <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                        t.status === "Resolved"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 font-sans">{t.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 w-full text-[9px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Layers className="h-3 w-3 text-cyan-400" />
                        {t.category}
                      </span>

                      <span className={`px-1.5 py-0.5 rounded border uppercase ${sla.badge}`}>
                        {t.priority}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SELECTED TICKET THREAD & ACTION CONSOLE (7 cols) */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 space-y-6 relative overflow-hidden">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                    <span className="text-cyan-400 font-bold uppercase">INCIDENT TICKET</span>
                    <span>•</span>
                    <span>Raised by {selectedTicket.clientName}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedTicket.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border font-bold uppercase ${
                    selectedTicket.status === "Resolved"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 animate-pulse"
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Description & Impact Box */}
              <div className="p-4 bg-[#0A0D14] border border-slate-800 rounded-xl space-y-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">// INCIDENT DETAILS & SPECIFICATIONS</span>
                <p className="text-xs font-sans text-slate-200 leading-relaxed whitespace-pre-line">
                  {selectedTicket.description}
                </p>

                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    {getSlaInfo(selectedTicket.priority).time}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Assigned: Binary Froster Core Ops
                  </span>
                </div>
              </div>

              {/* Thread History Feed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">// SECURED SUPPORT THREAD ({selectedTicket.replies?.length || 0})</span>
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Support Channel
                  </span>
                </div>

                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {(!selectedTicket.replies || selectedTicket.replies.length === 0) ? (
                    <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 font-mono text-xs">
                      // No replies yet. The engineering team is reviewing this ticket.
                    </div>
                  ) : (
                    selectedTicket.replies.map((reply, idx) => {
                      const isClient = reply.senderRole === "client";
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border space-y-2 ${
                            isClient
                              ? "bg-[#0A0D14] border-slate-800"
                              : "bg-cyan-500/10 border-cyan-500/30"
                          }`}
                        >
                          <div className="flex items-center justify-between font-mono text-[10px]">
                            <span className={`font-bold ${isClient ? "text-white" : "text-cyan-400 flex items-center gap-1"}`}>
                              {!isClient && <Sparkles className="h-3 w-3 text-cyan-400" />}
                              {reply.senderName}
                            </span>
                            <span className="text-slate-500">
                              {new Date(reply.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-xs font-sans text-slate-200 leading-relaxed">{reply.content}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Admin Resolution & Status Action Bar */}
              {user?.role === "admin" && (
                <div className="p-3 bg-[#0A0D14] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Reply As:</span>
                    <select
                      value={adminSender}
                      onChange={(e: any) => setAdminSender(e.target.value)}
                      className="bg-[#0F172A] border border-slate-700 text-cyan-400 font-mono text-[10px] px-2.5 py-1 rounded-lg outline-none cursor-pointer"
                    >
                      <option value="Shivam">Shivam Dube (AI Lead)</option>
                      <option value="Jawad">Jawad Khan (Backend Lead)</option>
                      <option value="Digvijay">Digvijay Kadam (UX Lead)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedTicket.status !== "Resolved" ? (
                      <Button
                        type="button"
                        onClick={() => handleStatusUpdate("Resolved")}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        MARK RESOLVED
                      </Button>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">✓ TICKET RESOLVED</span>
                    )}
                  </div>
                </div>
              )}

              {/* Reply Box */}
              <form onSubmit={handleReplySubmit} className="space-y-3 pt-2">
                <textarea
                  required
                  rows={3}
                  placeholder={user?.role === "admin" ? "Type technical response or investigation notes..." : "Provide follow-up clarification or error logs..."}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white p-3 text-xs rounded-xl outline-none font-sans placeholder-slate-500"
                />

                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500">Escalated to 24/7 on-call engineers</span>
                  <Button
                    type="submit"
                    disabled={!response.trim() || replying}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase px-4 py-2 rounded-lg cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    {replying ? "DISPATCHING..." : "DISPATCH REPLY"}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border border-dashed border-slate-800 bg-[#0F172A]/50 rounded-xl flex flex-col items-center justify-center text-center p-12 space-y-3">
              <HelpCircle className="h-10 w-10 text-slate-500 animate-pulse" />
              <p className="text-sm font-bold text-white">No Ticket Selected</p>
              <p className="text-xs font-mono text-slate-400">// Select a ticket from the active queue to view conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW SUPPORT TICKET MODAL */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateForm(false)}
              className="absolute inset-0 bg-black backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden space-y-5 z-10 text-white"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Create New Support Incident</h3>
                    <span className="text-[10px] font-mono text-slate-400">Direct pipeline to Binary Froster leadership</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 rounded-lg bg-slate-800/80 hover:text-cyan-400 border border-slate-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">
                    Incident Title / Subject *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. FCA ledger latency delay in matching engine endpoint..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2.5 text-xs rounded-xl outline-none font-sans font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">
                      Issue Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#0A0D14] border border-slate-700 text-white px-3 py-2 text-xs rounded-xl outline-none font-mono cursor-pointer"
                    >
                      <option value="Bug Report">Technical Bug Report</option>
                      <option value="Feature Request">Change / Feature Request</option>
                      <option value="General Inquiry">Consultation / General Inquiry</option>
                      <option value="Critical Outage">System Outage / Emergency</option>
                      <option value="Billing & Invoicing">Billing & Invoice Query</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">
                      Urgency / SLA Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e: any) => setPriority(e.target.value)}
                      className="w-full bg-[#0A0D14] border border-slate-700 text-white px-3 py-2 text-xs rounded-xl outline-none font-mono cursor-pointer"
                    >
                      <option value="Critical">Critical P1 (&lt;1 Hr Response)</option>
                      <option value="High">High P2 (&lt;4 Hrs Response)</option>
                      <option value="Medium">Medium P3 (&lt;12 Hrs Response)</option>
                      <option value="Low">Low P4 (&lt;24 Hrs Response)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">
                    Detailed Description & Error Logs *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide full details, steps to reproduce, affected user roles, or system logs..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white p-3 text-xs rounded-xl outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">
                    Attachment Reference (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. error_log_console.txt or screenshot_url"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3 py-1.5 text-xs rounded-lg outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs uppercase rounded-xl transition-colors cursor-pointer"
                  >
                    [CANCEL]
                  </button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs uppercase rounded-xl cursor-pointer"
                    disabled={!title || !description || submitting}
                  >
                    {submitting ? "ENQUEUING..." : "DISPATCH_TICKET"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
