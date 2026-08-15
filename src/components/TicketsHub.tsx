import React, { useState, useEffect } from "react";
import { SupportTicket, Project } from "../types";
import { api } from "../lib/api";
import { HelpCircle, Clock, AlertTriangle, CheckCircle, ChevronRight, MessageSquare, Plus, Loader2, X } from "lucide-react";
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

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"Bug" | "Feature Request" | "Inquiry" | "System Outage">("Bug");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Critical">("High");
  const [description, setDescription] = useState("");

  // Admin response states
  const [adminResponse, setAdminResponse] = useState("");
  const [resolving, setResolving] = useState(false);

  const loadTickets = async () => {
    try {
      const data = await api.getTickets(project.id);
      setTickets(data);
      if (selectedTicket) {
        const refreshed = data.find((t) => t.id === selectedTicket.id);
        if (refreshed) setSelectedTicket(refreshed);
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
  }, [project, selectedTicket]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    try {
      const catMap: Record<string, string> = {
        "Bug": "Bug Report",
        "Feature Request": "Change Request",
        "Inquiry": "General Question",
        "System Outage": "Bug Report"
      };
      await api.raiseTicket({
        projectId: project.id,
        title,
        category: catMap[category] || "General Question",
        priority: priority === "Critical" ? "Urgent" : priority,
        description
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

  const handleAdminRespond = async (e: React.FormEvent, statusChange?: "Resolved" | "In Progress") => {
    e.preventDefault();
    if (!selectedTicket || (!adminResponse && !statusChange)) return;

    setResolving(true);
    try {
      if (adminResponse) {
        await api.replyTicket(selectedTicket.id, adminResponse);
      }
      if (statusChange) {
        await api.updateTicketStatus(selectedTicket.id, statusChange);
      }
      setAdminResponse("");
      await loadTickets();
    } catch (err) {
      console.error("Admin ticket operation failed:", err);
    } finally {
      setResolving(false);
    }
  };

  const getSlaHours = (p: string) => {
    switch (p) {
      case "Critical": return "SLA Guarantee: <1 Hour Response (pager alert)";
      case "High": return "SLA Guarantee: <4 Hours Response (high priority)";
      case "Medium": return "SLA Guarantee: <12 Hours Response";
      default: return "SLA Guarantee: <24 Hours Response";
    }
  };

  if (loading) {
    return (
      <div className="bg-bg-card border border-border-custom p-6 rounded-card animate-pulse h-[400px]"></div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">// SECURE HELPDESK ENGINE</span>
        </div>

        {userRole === "client" && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs uppercase tracking-wider font-bold rounded-input transition-all flex items-center gap-1.5 cursor-pointer shadow-glow-strong"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            RAISE SUPPORT TICKET
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List column */}
        <div className="lg:col-span-1 space-y-3">
          <span className="block font-mono text-[9px] text-text-muted uppercase tracking-wider">// ENQUEUED TICKETS</span>

          {tickets.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border-custom bg-bg-card rounded-card text-text-secondary">
              <span className="font-mono text-[10px] text-text-muted">// QUEUE_EMPTY</span>
            </div>
          ) : (
            tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`w-full text-left p-4 rounded-input border transition-all flex flex-col gap-2.5 cursor-pointer outline-none ${
                    isSelected ? "bg-accent-primary/5 border-accent-primary shadow-glow" : "bg-bg-card border-border-custom hover:border-border-custom/80"
                  }`}
                >
                  <div className="space-y-1 w-full min-w-0">
                    <h4 className="font-sans text-xs font-bold text-text-primary truncate">{t.title}</h4>
                    <p className="font-mono text-[8px] text-accent-primary uppercase tracking-wider">Category: {t.category}</p>
                  </div>

                  <div className="flex items-center justify-between w-full font-mono text-[8px]">
                    <span className={`px-1.5 py-0.5 border rounded uppercase ${
                      t.priority === "Critical" ? "bg-brand-error/15 border-brand-error/25 text-brand-error animate-pulse" :
                      t.priority === "High" ? "bg-brand-warning/15 border-brand-warning/25 text-brand-warning" :
                      "bg-bg-secondary border-border-custom text-text-muted"
                    }`}>
                      {t.priority}
                    </span>

                    <span className={`px-1.5 py-0.5 border rounded uppercase ${
                      t.status === "Resolved" ? "bg-brand-success/15 border-brand-success/25 text-brand-success" :
                      "bg-accent-primary/15 border-accent-primary/25 text-accent-primary animate-pulse"
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Selected Ticket detailed Thread view */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-bg-card border border-border-custom p-6 rounded-card space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-accent-primary/5 rounded-full blur-2xl pointer-events-none"></div>

              {/* Status header */}
              <div className="flex justify-between items-center pb-4 border-b border-border-custom/50">
                <div className="space-y-0.5">
                  <span className="block font-mono text-[9px] text-text-muted uppercase">// TICKET STACK</span>
                  <h3 className="font-sans text-base font-bold text-text-primary">{selectedTicket.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-[9px] px-2 py-0.5 border rounded uppercase ${
                    selectedTicket.status === "Resolved" ? "bg-brand-success/15 border-brand-success/30 text-brand-success" :
                    "bg-accent-primary/15 border-accent-primary/30 text-accent-primary"
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-bg-secondary border border-border-custom rounded-input space-y-2">
                <span className="block font-mono text-[9px] text-text-muted uppercase">// DESCRIPTION & SYSTEM SPECS</span>
                <p className="font-sans text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                  {selectedTicket.description}
                </p>
                <div className="pt-2 border-t border-border-custom/30 flex justify-between font-mono text-[9px] text-text-muted">
                  <span>SLA Guarantee: {getSlaHours(selectedTicket.priority)}</span>
                  <span>Raised by: {selectedTicket.clientName}</span>
                </div>
              </div>

              {/* Conversations feed */}
              <div className="space-y-3">
                <span className="block font-mono text-[9px] text-text-muted uppercase">// MESSAGING THREAD HISTORY</span>
                
                {selectedTicket.replies && selectedTicket.replies.length === 0 ? (
                  <div className="text-center py-6 text-text-muted font-mono text-[9px] border border-dashed border-border-custom/50 rounded">
                    // AWAITING_COGNITIVE_RESPONSE
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {selectedTicket.replies?.map((hist, i) => (
                      <div key={i} className="p-3 bg-bg-secondary/50 border border-border-custom/60 rounded-input space-y-1.5">
                        <div className="flex justify-between items-center font-mono text-[9px]">
                          <span className="text-accent-primary font-bold">{hist.senderName}</span>
                          <span className="text-text-muted">{new Date(hist.timestamp).toLocaleDateString()} {new Date(hist.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="font-sans text-xs text-text-secondary leading-relaxed">
                          {hist.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply box */}
              {selectedTicket.status !== "Resolved" && (
                <form onSubmit={handleAdminRespond} className="space-y-3 pt-4 border-t border-border-custom/50">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] text-text-muted uppercase">// APPEND MESSAGE RESPONSE</span>
                    {userRole === "admin" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleAdminRespond(e, "Resolved")}
                          className="px-2.5 py-1 bg-brand-success/15 hover:bg-brand-success text-brand-success hover:text-bg-primary font-mono text-[9px] font-bold uppercase border border-brand-success/20 hover:border-transparent rounded"
                        >
                          [RESOLVE_TICKET]
                        </button>
                      </div>
                    )}
                  </div>

                  <textarea
                    required
                    rows={3}
                    placeholder={userRole === "admin" ? "Administrative response..." : "Provide follow-up specifics..."}
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary p-3 text-xs rounded-input outline-none font-sans"
                  ></textarea>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={resolving || !adminResponse}
                      className="px-6 py-2 bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs font-bold uppercase rounded-input tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-glow-strong"
                    >
                      {resolving ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "DISPATCH_REPLY"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="h-full border border-dashed border-border-custom/50 bg-bg-card/40 rounded-card flex flex-col items-center justify-center text-center p-12 text-text-secondary">
              <HelpCircle className="h-10 w-10 text-text-muted mx-auto mb-3 animate-pulse" />
              <p className="font-sans text-xs font-semibold text-text-primary">No ticket selected</p>
              <p className="font-mono text-[10px] text-text-muted uppercase mt-0.5">// CHOOSE AN ACTIVE STACK TO RESPOND</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW SUPPORT TICKET DIALOG MODAL */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateForm(false)}
              className="absolute inset-0 bg-black"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-bg-card border border-border-custom rounded-card p-6 shadow-glow overflow-hidden space-y-5"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-border-custom/50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-accent-primary animate-pulse" />
                  <span className="font-mono text-xs font-bold text-text-primary uppercase tracking-widest">// INITIALIZE TICKET PIPELINE</span>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 rounded-full bg-bg-secondary hover:text-accent-primary border border-border-custom cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Issue Headline</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. FCA ledger latency lag on matching engine..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3 py-2 text-xs rounded-input outline-none font-sans font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Impact Category</label>
                    <select
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-mono"
                    >
                      <option value="Bug">Technical Bug</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Inquiry">General Inquiry</option>
                      <option value="System Outage">Consensus System Outage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Urgency Priority</label>
                    <select
                      value={priority}
                      onChange={(e: any) => setPriority(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-mono"
                    >
                      <option value="Low">Low (no operational block)</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High (releasing hurdle)</option>
                      <option value="Critical">Critical Outage (pager breach)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Deficiency Specifications details</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide console logs or detail description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary p-3 text-xs rounded-input outline-none font-sans"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="py-2.5 bg-bg-secondary border border-border-custom text-text-secondary hover:text-text-primary font-mono text-[10px] uppercase rounded-input transition-colors cursor-pointer"
                  >
                    [ABORT]
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !title || !description}
                    className="py-2.5 bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-[10px] uppercase tracking-widest font-bold rounded-input transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow-glow"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "DISPATCH_TICKET"}
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
export { X };
