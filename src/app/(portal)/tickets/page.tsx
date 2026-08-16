"use client";

import * as React from "react";
import {
  HelpCircle,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Send,
  UserCheck,
  Activity,
  ShieldAlert,
  Sparkles,
  Layers,
  Tag,
  X,
  Edit,
  Play,
  RotateCcw
} from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData, SupportTicket } from "@/src/components/providers/portal-data-provider";
import { Button } from "@/src/components/ui/button";
import { Modal } from "@/src/components/ui/modal";
import toast from "react-hot-toast";

export default function TicketsHubPage() {
  const { user } = useUser();
  const { loading: dataLoading, tickets, createTicket, replyToTicket, updateTicketStatus, updateTicket } = usePortalData();

  // Selected ticket
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("ALL");

  // Form states
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<SupportTicket["category"]>("Bug Report");
  const [priority, setPriority] = React.useState<SupportTicket["priority"]>("High");
  const [description, setDescription] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Edit Ticket modal states
  const [editingTicket, setEditingTicket] = React.useState<SupportTicket | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editCategory, setEditCategory] = React.useState<SupportTicket["category"]>("Bug Report");
  const [editPriority, setEditPriority] = React.useState<SupportTicket["priority"]>("High");
  const [editStatus, setEditStatus] = React.useState<SupportTicket["status"]>("In Progress");
  const [editDescription, setEditDescription] = React.useState("");
  const [savingEdit, setSavingEdit] = React.useState(false);

  // Reply states
  const [response, setResponse] = React.useState("");
  const [adminSender, setAdminSender] = React.useState<"Shivam" | "Jawad" | "Digvijay">("Shivam");
  const [replying, setReplying] = React.useState(false);

  const loading = dataLoading;

  // Auto-select first ticket if none selected
  React.useEffect(() => {
    if (!selectedTicketId && tickets && tickets.length > 0) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  const selectedTicket = tickets?.find((t) => t.id === selectedTicketId) || tickets?.[0] || null;

  const filteredTickets = (tickets || []).filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const openTicketsCount = (tickets || []).filter((t) => t.status !== "Resolved").length;
  const criticalCount = (tickets || []).filter((t) => (t.priority === "Critical") && t.status !== "Resolved").length;

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    await new Promise((res) => setTimeout(res, 600));

    createTicket({
      title,
      category,
      priority,
      status: "Open",
      description,
      clientName: user?.name || "Client Officer",
    });

    setTitle("");
    setDescription("");
    setShowCreateForm(false);
    setSubmitting(false);
    toast.success("Support ticket logged and routed to executive queue!");
  };

  const handleStatusUpdate = (status: SupportTicket["status"], ticketId?: string) => {
    const targetId = ticketId || selectedTicket?.id;
    if (!targetId) return;
    updateTicketStatus(targetId, status);
    toast.success(`Ticket status marked as ${status}`);
  };

  const openEditModal = (t: SupportTicket, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTicket(t);
    setEditTitle(t.title);
    setEditCategory(t.category);
    setEditPriority(t.priority);
    setEditStatus(t.status);
    setEditDescription(t.description);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket || !editTitle) return;

    setSavingEdit(true);
    updateTicket(editingTicket.id, {
      title: editTitle,
      category: editCategory,
      priority: editPriority,
      status: editStatus,
      description: editDescription,
    });
    setSavingEdit(false);
    setEditingTicket(null);
    toast.success("Ticket details updated successfully!");
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !response.trim()) return;

    setReplying(true);
    await new Promise((res) => setTimeout(res, 600));

    const senderName = user?.role === "admin"
      ? (adminSender === "Shivam" ? "Shivam Dube (AI Lead)" : adminSender === "Jawad" ? "Jawad Khan (Backend Lead)" : "Digvijay Kadam (UX Lead)")
      : (user?.name || "Client Officer");

    replyToTicket(selectedTicket.id, {
      senderName,
      senderRole: user?.role === "admin" ? "admin" : "client",
      content: response,
      timestamp: new Date().toISOString(),
    });

    setResponse("");
    setReplying(false);
    toast.success("Response dispatched to thread!");
  };

  const getSlaInfo = (p: string) => {
    switch (p) {
      case "Critical":
        return { time: "< 1 Hour Response (P1 Pager Alert)", badge: "bg-red-500/20 text-red-400 border-red-500/30" };
      case "High":
        return { time: "< 4 Hours Response (P2 High Priority)", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
      case "Medium":
        return { time: "< 12 Hours Response (P3 Standard)", badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" };
      default:
        return { time: "< 24 Hours Response (P4 Low)", badge: "bg-slate-500/20 text-slate-400 border-slate-500/30" };
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-xl animate-pulse h-[400px] w-full" />
    );
  }

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

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Enterprise Support & Ticket Triage</h2>
            <span className="text-[10px] font-mono text-slate-400">Direct technical escalation pipeline to founders</span>
          </div>
        </div>

        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs uppercase tracking-wider font-bold rounded-lg cursor-pointer"
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
            placeholder="Search tickets by title, spec or category..."
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TICKET LIST (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-wider">// ENQUEUED TICKETS ({filteredTickets.length})</span>

          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 bg-[#0F172A] rounded-xl text-slate-400">
              <span className="font-mono text-[10px] text-slate-500">// QUEUE_EMPTY</span>
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
                          : t.status === "In Progress"
                          ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 font-sans">{t.description}</p>

                    {/* Quick action buttons row on card */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 w-full text-[9px] font-mono text-slate-400">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Layers className="h-3 w-3 text-cyan-400" />
                        {t.category}
                      </div>

                      <div className="flex items-center gap-1">
                        {t.status !== "In Progress" && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate("In Progress", t.id);
                            }}
                            className="bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded cursor-pointer font-bold"
                          >
                            ▶ In Progress
                          </span>
                        )}

                        {t.status !== "Resolved" && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate("Resolved", t.id);
                            }}
                            className="bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded cursor-pointer font-bold"
                          >
                            ✓ Done
                          </span>
                        )}

                        <span
                          onClick={(e) => openEditModal(t, e)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          ✎ Edit
                        </span>
                      </div>
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

              {/* ACTION CONTROL BAR */}
              <div className="p-3 bg-[#0A0D14] border border-cyan-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                  // TICKET ACTIONS
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedTicket)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-[10px] uppercase font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <Edit className="h-3 w-3 text-cyan-400" />
                    Edit Ticket
                  </button>

                  {selectedTicket.status !== "In Progress" && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate("In Progress")}
                      className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 font-mono text-[10px] uppercase font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="h-3 w-3" />
                      Set In Progress
                    </button>
                  )}

                  {selectedTicket.status !== "Resolved" ? (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate("Resolved")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark as Done / Resolved
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate("Open")}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-mono text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reopen Ticket
                    </button>
                  )}
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
                              {new Date(reply.timestamp).toLocaleDateString()}{" "}
                              {new Date(reply.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-xs font-sans text-slate-200 leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Admin Responder Selection */}
              {user?.role === "admin" && (
                <div className="p-3 bg-[#0A0D14] border border-slate-800 rounded-xl flex items-center justify-between gap-3">
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
                  <span className="text-[10px] font-mono text-slate-500">Escalated to 24/7 on-call founders</span>
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
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-12 text-center text-slate-400 font-mono text-xs">
              // NO TICKET SELECTED. SELECT AN INCIDENT STACK.
            </div>
          )}
        </div>
      </div>

      {/* Edit Ticket Modal */}
      {editingTicket && (
        <Modal
          isOpen={!!editingTicket}
          onClose={() => setEditingTicket(null)}
          title={`// EDIT TICKET: ${editingTicket.title}`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-white">
            <div>
              <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                Incident Title
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2 text-xs rounded-xl outline-none font-sans"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full bg-[#0A0D14] border border-slate-700 text-white px-3 py-2 text-xs rounded-xl outline-none font-mono cursor-pointer"
                >
                  <option value="Bug Report">Bug Report</option>
                  <option value="Change Request">Change Request</option>
                  <option value="General Question">General Question</option>
                  <option value="System Outage">System Outage</option>
                  <option value="Billing Query">Billing Query</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as any)}
                  className="w-full bg-[#0A0D14] border border-slate-700 text-white px-3 py-2 text-xs rounded-xl outline-none font-mono cursor-pointer"
                >
                  <option value="Low">Low (P4)</option>
                  <option value="Medium">Medium (P3)</option>
                  <option value="High">High (P2)</option>
                  <option value="Critical">Critical (P1)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full bg-[#0A0D14] border border-slate-700 text-white px-3 py-2 text-xs rounded-xl outline-none font-mono cursor-pointer"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                Description & System Specs
              </label>
              <textarea
                rows={4}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white p-3 text-xs rounded-xl outline-none font-sans"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingTicket(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs uppercase rounded-xl transition-colors cursor-pointer"
              >
                [CANCEL]
              </button>
              <Button
                type="submit"
                variant="accent"
                className="font-mono text-xs uppercase font-bold py-2 px-5 rounded-xl cursor-pointer"
                isLoading={savingEdit}
              >
                SAVE CHANGES
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Raise Ticket Modal */}
      {showCreateForm && (
        <Modal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="// RAISE NEW SUPPORT TICKET"
          size="md"
        >
          <form onSubmit={handleCreateTicket} className="space-y-4 text-white">
            <div>
              <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                Incident Title / Summary
              </label>
              <input
                type="text"
                required
                placeholder="e.g. WebSocket latency on UK matching node..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2 text-xs rounded-xl outline-none font-sans placeholder-slate-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#0A0D14] border border-slate-700 text-white px-3.5 py-2 text-xs rounded-xl outline-none font-mono cursor-pointer"
                >
                  <option value="Bug Report">Bug Report</option>
                  <option value="Change Request">Change Request</option>
                  <option value="General Question">General Question</option>
                  <option value="System Outage">System Outage</option>
                  <option value="Billing Query">Billing Query</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  Priority SLA Impact
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-[#0A0D14] border border-slate-700 text-white px-3.5 py-2 text-xs rounded-xl outline-none font-mono cursor-pointer"
                >
                  <option value="Critical">Critical (P1 - 1h SLA)</option>
                  <option value="High">High (P2 - 4h SLA)</option>
                  <option value="Medium">Medium (P3 - 12h SLA)</option>
                  <option value="Low">Low (P4 - 24h SLA)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                Detailed Technical Specifications
              </label>
              <textarea
                required
                rows={5}
                placeholder="Include error codes, reproduction steps, API payloads, or affected accounts..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white p-3 text-xs rounded-xl outline-none font-sans placeholder-slate-600"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs uppercase rounded-xl transition-colors cursor-pointer"
              >
                [CANCEL]
              </button>
              <Button
                type="submit"
                variant="accent"
                className="font-mono text-xs uppercase font-bold py-2 px-5 rounded-xl cursor-pointer"
                isLoading={submitting}
              >
                SUBMIT TICKET
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
