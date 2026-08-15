"use client";

import * as React from "react";
import {
  HelpCircle,
  Plus,
  AlertTriangle,
  X,
  Loader2,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

interface Reply {
  senderName: string;
  senderRole: "client" | "admin";
  content: string;
  timestamp: string;
}

interface SupportTicket {
  id: string;
  title: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved";
  description: string;
  clientName: string;
  replies: Reply[];
}

export default function TicketsPage() {
  const { user } = useUser();
  const { loading: dataLoading, tickets, createTicket, replyToTicket, resolveTicket } = usePortalData();
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null);

  // Form states
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("Bug");
  const [priority, setPriority] = React.useState<SupportTicket["priority"]>("High");
  const [description, setDescription] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Response states
  const [response, setResponse] = React.useState("");
  const [replying, setReplying] = React.useState(false);

  const loading = dataLoading;
  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    createTicket({
      title,
      category,
      priority,
      status: "Open" as const,
      description,
      clientName: user?.name || "Client User",
    });

    setShowCreateForm(false);
    setTitle("");
    setDescription("");
    setSubmitting(false);

    toast.success("Incident enqueued successfully");
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !response) return;

    setReplying(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newReply: Reply = {
      senderName: user?.name || "Client User",
      senderRole: (user?.role || "client") as "client" | "admin",
      content: response,
      timestamp: new Date().toISOString(),
    };

    replyToTicket(selectedTicketId, newReply);
    setResponse("");
    setReplying(false);

    toast.success("Reply enqueued");
  };

  const handleResolveTicket = async () => {
    if (!selectedTicketId) return;

    resolveTicket(selectedTicketId);

    toast.success("Incident resolved and closed");
  };

  const getSlaHours = (p: SupportTicket["priority"]) => {
    switch (p) {
      case "Critical":
        return "SLA Guarantee: <1 Hour Response (pager alert)";
      case "High":
        return "SLA Guarantee: <4 Hours Response";
      case "Medium":
        return "SLA Guarantee: <12 Hours Response";
      default:
        return "SLA Guarantee: <24 Hours Response";
    }
  };

  React.useEffect(() => {
    if (tickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  if (loading) {
    return <Skeleton className="h-64 bg-bg-card border border-border-custom w-full" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // SECURE HELPDESK ENGINE
          </span>
        </div>

        <Button
          id="raise-ticket-button"
          onClick={() => setShowCreateForm(true)}
          variant="accent"
          className="font-mono text-xs uppercase font-bold cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" />
          RAISE SUPPORT TICKET
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Ticket Queue */}
        <div className="lg:col-span-1 space-y-3">
          <span className="block font-mono text-[9px] text-text-muted uppercase tracking-wider">
            // ENQUEUED TICKETS
          </span>

          {tickets.length === 0 ? (
            <Card className="bg-bg-card border-border-custom p-8 text-center text-text-muted">
              <span className="font-mono text-[10px] text-text-muted">// QUEUE_EMPTY</span>
            </Card>
          ) : (
            tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full text-left p-4 rounded-input border transition-all flex flex-col gap-2.5 cursor-pointer outline-none ${
                    isSelected
                      ? "bg-accent-primary/5 border-accent-primary shadow-glow"
                      : "bg-bg-card border-border-custom hover:border-border-custom/80 text-white"
                  }`}
                >
                  <div className="space-y-1 w-full min-w-0">
                    <h4 className="font-sans text-xs font-bold truncate">{t.title}</h4>
                    <p className="font-mono text-[8px] text-accent-primary uppercase tracking-wider">
                      Category: {t.category}
                    </p>
                  </div>

                  <div className="flex items-center justify-between w-full font-mono text-[8px]">
                    <Badge
                      variant={
                        t.priority === "Critical"
                          ? "error"
                          : t.priority === "High"
                          ? "warning"
                          : "cyan"
                      }
                      className="font-mono text-[8px]"
                    >
                      {t.priority}
                    </Badge>

                    <Badge
                      variant={t.status === "Resolved" ? "success" : "cyan"}
                      className="font-mono text-[8px]"
                    >
                      {t.status}
                    </Badge>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* RIGHT: Ticket Details & Thread */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="relative overflow-hidden bg-bg-card border-border-custom p-6 space-y-6 text-white">
              <div className="absolute top-0 right-0 h-24 w-24 bg-accent-primary/5 rounded-full blur-2xl pointer-events-none" />

              {/* Detail Header */}
              <div className="flex justify-between items-center pb-4 border-b border-border-custom/50">
                <div className="space-y-0.5">
                  <span className="block font-mono text-[9px] text-text-muted uppercase">
                    // TICKET STACK
                  </span>
                  <h3 className="font-sans text-base font-bold text-white">{selectedTicket.title}</h3>
                </div>
                <Badge
                  variant={selectedTicket.status === "Resolved" ? "success" : "cyan"}
                  className="font-mono text-[9px] font-semibold"
                >
                  {selectedTicket.status}
                </Badge>
              </div>

              {/* Specs */}
              <div className="p-4 bg-bg-secondary border border-border-custom rounded-input space-y-2 text-white">
                <span className="block font-mono text-[9px] text-text-muted uppercase">
                  // DESCRIPTION & SPECS
                </span>
                <p className="font-sans text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                  {selectedTicket.description}
                </p>
                <div className="pt-2 border-t border-border-custom/30 flex justify-between font-mono text-[9px] text-text-muted">
                  <span>SLA: {getSlaHours(selectedTicket.priority)}</span>
                  <span>Raised by: {selectedTicket.clientName}</span>
                </div>
              </div>

              {/* Replies */}
              <div className="space-y-3">
                <span className="block font-mono text-[9px] text-text-muted uppercase">
                  // MESSAGING THREAD HISTORY
                </span>

                {selectedTicket.replies && selectedTicket.replies.length === 0 ? (
                  <div className="text-center py-6 text-text-muted font-mono text-[9px] border border-dashed border-border-custom/50 rounded">
                    // AWAITING_COGNITIVE_RESPONSE
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {selectedTicket.replies.map((hist, i) => (
                      <div
                        key={i}
                        className="p-3 bg-bg-secondary/50 border border-border-custom/60 rounded-input space-y-1.5"
                      >
                        <div className="flex justify-between items-center font-mono text-[9px]">
                          <span className="text-accent-primary font-bold">{hist.senderName}</span>
                          <span className="text-text-muted">
                            {new Date(hist.timestamp).toLocaleDateString()}{" "}
                            {new Date(hist.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-text-secondary leading-relaxed">
                          {hist.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Input Form */}
              {selectedTicket.status !== "Resolved" && (
                <form
                  onSubmit={handleReplySubmit}
                  className="space-y-3 pt-4 border-t border-border-custom/50"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] text-text-muted uppercase">
                      // APPEND MESSAGE RESPONSE
                    </span>
                    {user?.role === "admin" && (
                      <Button
                        type="button"
                        onClick={handleResolveTicket}
                        variant="accent"
                        size="sm"
                        className="font-mono text-[9px] font-bold uppercase cursor-pointer"
                      >
                        [RESOLVE_TICKET]
                      </Button>
                    )}
                  </div>

                  <textarea
                    required
                    rows={3}
                    placeholder="Provide follow-up details..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white p-3 text-xs rounded-input outline-none font-sans"
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="accent"
                      className="font-mono text-xs font-bold uppercase cursor-pointer"
                      isLoading={replying}
                    >
                      DISPATCH_REPLY
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          ) : (
            <div className="h-full border border-dashed border-border-custom bg-bg-card/40 rounded-card flex flex-col items-center justify-center text-center p-12 text-text-secondary">
              <HelpCircle className="h-10 w-10 text-text-muted mx-auto mb-3 animate-pulse" />
              <p className="font-sans text-xs font-semibold text-white">No ticket selected</p>
              <p className="font-mono text-[10px] text-text-muted uppercase mt-0.5">
                // CHOOSE AN ACTIVE STACK TO RESPOND
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW SUPPORT TICKET MODAL */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateForm(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-bg-card border border-border-custom rounded-card p-6 shadow-glow overflow-hidden space-y-5"
            >
              <div className="flex justify-between items-center pb-3 border-b border-border-custom/50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-accent-primary animate-pulse" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">
                    // INITIALIZE TICKET PIPELINE
                  </span>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 rounded-full bg-bg-secondary hover:text-accent-primary border border-border-custom cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                    Issue Headline
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. FCA ledger latency lag on matching engine..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white px-3 py-2 text-xs rounded-input outline-none font-sans font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                      Impact Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-mono cursor-pointer"
                    >
                      <option value="Bug">Technical Bug</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Inquiry">General Inquiry</option>
                      <option value="System Outage">Consensus System Outage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                      Urgency Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e: any) => setPriority(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-mono cursor-pointer"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Critical">Critical Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                    Deficiency Specifications details
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide console logs or detailed description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white p-3 text-xs rounded-input outline-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="py-2.5 bg-bg-secondary border border-border-custom text-text-secondary hover:text-white font-mono text-[10px] uppercase rounded-input transition-colors cursor-pointer"
                  >
                    [ABORT]
                  </button>
                  <Button
                    type="submit"
                    variant="accent"
                    className="font-mono text-[10px] uppercase cursor-pointer"
                    isLoading={submitting}
                    disabled={!title || !description}
                  >
                    DISPATCH_TICKET
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
