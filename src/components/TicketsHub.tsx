import React, { useState, useEffect } from "react";
import { SupportTicket, Project } from "../types";
import { api } from "../lib/api";
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
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TicketsHubProps {
  project: Project;
  user: any;
  userRole: "client" | "admin";
}

export default function TicketsHub({ project, user, userRole }: TicketsHubProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"Bug Report" | "Change Request" | "General Question" | "System Outage">("Bug Report");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Critical">("High");
  const [description, setDescription] = useState("");

  // Response states
  const [adminResponse, setAdminResponse] = useState("");
  const [adminSender, setAdminSender] = useState<"Shivam" | "Jawad" | "Digvijay">("Shivam");
  const [resolving, setResolving] = useState(false);

  const loadTickets = async () => {
    try {
      const data = await api.getTickets(project.id);
      setTickets(data);
      if (selectedTicket) {
        const refreshed = data.find((t) => t.id === selectedTicket.id);
        if (refreshed) setSelectedTicket(refreshed);
      } else if (data.length > 0) {
        setSelectedTicket(data[0]);
      }
    } catch (err) {
      console.error("Failed loading ticket hub:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 15000);
    return () => clearInterval(interval);
  }, [project]);

  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    try {
      await api.raiseTicket({
        projectId: project.id,
        title,
        category,
        priority: priority === "Critical" ? "Urgent" : priority,
        description,
      });
      setTitle("");
      setDescription("");
      setShowCreateForm(false);
      await loadTickets();
    } catch (err) {
      console.error("Failed creating ticket:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (e: React.FormEvent, statusChange?: "Resolved" | "In Progress") => {
    e.preventDefault();
    if (!selectedTicket || (!adminResponse && !statusChange)) return;

    setResolving(true);
    try {
      if (adminResponse) {
        const prefix = userRole === "admin" 
          ? `[${adminSender === "Shivam" ? "Shivam Dube (AI Lead)" : adminSender === "Jawad" ? "Jawad Khan (Backend Lead)" : "Digvijay Kadam (UX Lead)"}]: `
          : "";
        await api.replyTicket(selectedTicket.id, `${prefix}${adminResponse}`);
      }
      if (statusChange) {
        await api.updateTicketStatus(selectedTicket.id, statusChange);
      }
      setAdminResponse("");
      await loadTickets();
    } catch (err) {
      console.error("Ticket operation failed:", err);
    } finally {
      setResolving(false);
    }
  };

  const getSlaHours = (p: string) => {
    switch (p) {
      case "Critical":
      case "Urgent":
        return { text: "< 1 Hour Response (pager alert)", badge: "bg-red-500/20 text-red-400 border-red-500/30" };
      case "High":
        return { text: "< 4 Hours Response (high priority)", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
      case "Medium":
        return { text: "< 12 Hours Response", badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" };
      default:
        return { text: "< 24 Hours Response", badge: "bg-slate-500/20 text-slate-400 border-slate-500/30" };
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-xl animate-pulse h-[400px] w-full" />
    );
  }

  const openTicketsCount = tickets.filter((t) => t.status !== "Resolved").length;
  const criticalCount = tickets.filter((t) => (t.priority === "Critical" || t.priority === "Urgent") && t.status !== "Resolved").length;

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
            <span className="text-[10px] font-mono text-slate-400">Direct technical escalation pipeline</span>
          </div>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs uppercase tracking-wider font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          RAISE SUPPORT TICKET
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-[#0F172A]/80 border border-slate-800 rounded-xl">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets..."
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
        {/* Ticket List column (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-wider">// ENQUEUED TICKETS ({filteredTickets.length})</span>

          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 bg-[#0F172A] rounded-xl text-slate-400">
              <span className="font-mono text-[10px] text-slate-500">// QUEUE_EMPTY</span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                const sla = getSlaHours(t.priority);

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2.5 cursor-pointer outline-none ${
                      isSelected
                        ? "bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                        : "bg-[#0F172A] border-slate-800 hover:border-slate-700 text-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 w-full">
                      <h4 className="font-sans text-xs font-bold text-white truncate flex-1">{t.title}</h4>
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

        {/* Selected Ticket detailed Thread view (7 cols) */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-xl space-y-6 relative overflow-hidden text-white">
              {/* Status header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="space-y-0.5">
                  <span className="block font-mono text-[9px] text-slate-400 uppercase">// TICKET STACK</span>
                  <h3 className="font-sans text-base font-bold text-white">{selectedTicket.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-[9px] px-2.5 py-1 rounded-lg border font-bold uppercase ${
                    selectedTicket.status === "Resolved"
                      ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                      : "bg-cyan-500/20 border-cyan-500/30 text-cyan-400 animate-pulse"
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-[#0A0D14] border border-slate-800 rounded-xl space-y-2">
                <span className="block font-mono text-[9px] text-slate-400 uppercase">// DESCRIPTION & SYSTEM SPECS</span>
                <p className="font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                  {selectedTicket.description}
                </p>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-mono text-[9px] text-slate-400">
                  <span>SLA Guarantee: {getSlaHours(selectedTicket.priority).text}</span>
                  <span>Raised by: {selectedTicket.clientName}</span>
                </div>
              </div>

              {/* Conversations feed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="block font-mono text-[9px] text-slate-400 uppercase">// MESSAGING THREAD HISTORY ({selectedTicket.replies?.length || 0})</span>
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Support Channel
                  </span>
                </div>

                {selectedTicket.replies && selectedTicket.replies.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 font-mono text-[9px] border border-dashed border-slate-800 rounded-xl">
                    // AWAITING_ENGINEERING_RESPONSE
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                    {selectedTicket.replies?.map((hist, i) => (
                      <div key={i} className="p-3.5 bg-[#0A0D14] border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center font-mono text-[9px]">
                          <span className="text-cyan-400 font-bold flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-cyan-400" />
                            {hist.senderName}
                          </span>
                          <span className="text-slate-500">
                            {new Date(hist.timestamp).toLocaleDateString()}{" "}
                            {new Date(hist.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-slate-200 leading-relaxed">
                          {hist.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Admin switcher & action bar */}
              {userRole === "admin" && (
                <div className="p-3 bg-[#0A0D14] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Reply As:</span>
                    <select
                      value={adminSender}
                      onChange={(e: any) => setAdminSender(e.target.value)}
                      className="bg-[#0F172A] border border-slate-700 text-cyan-400 font-mono text-[10px] px-2 py-1 rounded-lg outline-none cursor-pointer"
                    >
                      <option value="Shivam">Shivam Dube (AI)</option>
                      <option value="Jawad">Jawad Khan (Backend)</option>
                      <option value="Digvijay">Digvijay Kadam (Design)</option>
                    </select>
                  </div>

                  {selectedTicket.status !== "Resolved" && (
                    <button
                      type="button"
                      onClick={(e) => handleRespond(e, "Resolved")}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
                    >
                      [MARK_RESOLVED]
                    </button>
                  )}
                </div>
              )}

              {/* Reply box */}
              {selectedTicket.status !== "Resolved" && (
                <form onSubmit={handleRespond} className="space-y-3 pt-2">
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide technical investigation details or clarification..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white p-3 text-xs rounded-xl outline-none font-sans"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!adminResponse.trim() || resolving}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {resolving ? "DISPATCHING..." : "DISPATCH REPLY"}
                    </button>
                  </div>
                </form>
              )}
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
                    <span className="text-[10px] font-mono text-slate-400">Direct technical pipeline to engineers</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 rounded-lg bg-slate-800 hover:text-cyan-400 border border-slate-700 cursor-pointer"
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
                    placeholder="e.g. FCA ledger latency lag on matching engine..."
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
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full bg-[#0A0D14] border border-slate-700 text-white px-3 py-2 text-xs rounded-xl outline-none font-mono cursor-pointer"
                    >
                      <option value="Bug Report">Technical Bug Report</option>
                      <option value="Change Request">Change / Feature Request</option>
                      <option value="General Question">General Question / Inquiry</option>
                      <option value="System Outage">System Outage / Emergency</option>
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
                    placeholder="Provide console logs or detailed description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white p-3 text-xs rounded-xl outline-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs uppercase rounded-xl transition-colors cursor-pointer"
                  >
                    [CANCEL]
                  </button>
                  <button
                    type="submit"
                    disabled={!title || !description || submitting}
                    className="py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs uppercase rounded-xl cursor-pointer transition-all"
                  >
                    {submitting ? "ENQUEUING..." : "DISPATCH_TICKET"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
