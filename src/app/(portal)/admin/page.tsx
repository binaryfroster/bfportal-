"use client";

import * as React from "react";
import Link from "next/link";
import {
  Terminal,
  Shield,
  Plus,
  Mail,
  Clock,
  Check,
  CheckCircle2,
  Loader2,
  Edit,
  Play,
  RotateCcw,
  Trash2,
  Download,
  X,
  Eye,
  EyeOff,
  Copy,
  FolderKanban,
  ArrowRight,
} from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import { formatCurrency } from "@/src/lib/utils";
import toast from "react-hot-toast";

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  order: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  description: string;
  total: number;
  status: string;
}

interface SupportTicket {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  clientName: string;
}

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  template: string;
  timestamp: string;
  payload: any;
}

export default function AdminPanelPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = React.useState<"approvals" | "billing" | "milestones" | "tickets" | "emails">(
    "approvals"
  );

  const {
    loading: dataLoading,
    invoices,
    tickets,
    milestones,
    emailLogs,
    createInvoice,
    createMilestone,
    markInvoicePaid,
  } = usePortalData();

  const [submitting, setSubmitting] = React.useState(false);

  // Forms
  const [invDesc, setInvDesc] = React.useState("");
  const [invAmount, setInvAmount] = React.useState("");
  const [milTitle, setMilTitle] = React.useState("");
  const [milDesc, setMilDesc] = React.useState("");
  const [milDate, setMilDate] = React.useState("");

  // Modals state
  const [editInvoice, setEditInvoice] = React.useState<Invoice | null>(null);
  const [editMilestone, setEditMilestone] = React.useState<Milestone | null>(null);

  const loading = dataLoading;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invDesc || !invAmount) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const totalAmt = parseFloat(invAmount);
    const newInv: any = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `BF-2026-00${invoices.length + 1}`,
      description: invDesc,
      amount: totalAmt,
      total: totalAmt,
      tax: 0,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Sent" as const,
      lineItems: [{ description: invDesc, amount: totalAmt }],
      paidAt: null,
    };

    createInvoice(newInv);
    setInvDesc("");
    setInvAmount("");
    setSubmitting(false);

    toast.success("Billing requisition dispatched to client inbox");
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milTitle || !milDesc || !milDate) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newMil: any = {
      id: `m-${Date.now()}`,
      title: milTitle,
      description: milDesc,
      dueDate: milDate,
      status: "Upcoming" as const,
      completedDate: null,
      order: milestones.length + 1,
    };

    createMilestone(newMil);
    setMilTitle("");
    setMilDesc("");
    setMilDate("");
    setSubmitting(false);

    toast.success("Project milestone checklist appended");
  };

  const handleMarkPaid = async (invoiceId: string) => {
    markInvoicePaid(invoiceId);
    toast.success("Invoice override status updated: Paid");
  };

  if (user?.role !== "admin") {
    return (
      <Card className="border-border-custom bg-bg-card text-center p-12 text-white">
        <Shield className="h-12 w-12 text-brand-error mx-auto mb-4 animate-bounce" />
        <h3 className="font-mono text-base font-bold uppercase tracking-wider">
          Access Decoupled: Admin authorization required
        </h3>
      </Card>
    );
  }

  if (loading) {
    return <Skeleton className="h-96 w-full bg-bg-card border border-border-custom" />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-border-custom/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-accent-primary" />
            <h1 className="font-mono text-xs text-text-secondary uppercase tracking-widest">
              // ADMIN OPERATIONS & SYSTEM CONTROLS
            </h1>
          </div>
          <p className="text-xs font-mono text-text-muted">
            Global governance: Deliverable signoffs, treasury overrides, and email telemetry
          </p>
        </div>

        <Link
          href="/admin/projects"
          className="text-xs font-mono font-bold px-3.5 py-2 rounded transition-all flex items-center gap-2 cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30 shadow-glow"
        >
          <FolderKanban className="w-4 h-4" />
          MANAGE CLIENT PROJECTS PANEL &rarr;
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-bg-card border border-border-custom rounded-input text-white">
        {(["approvals", "billing", "milestones", "tickets", "emails"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-mono text-[11px] uppercase font-bold rounded cursor-pointer transition-all ${
              activeTab === tab
                ? "bg-accent-primary text-bg-primary shadow-glow"
                : "text-text-secondary hover:text-white"
            }`}
          >
            {tab === "emails" ? "Resend Mail Auditor" : tab}
          </button>
        ))}
      </div>

      {/* Approvals tab */}
      {activeTab === "approvals" && (
        <div className="space-y-4">
          <span className="block font-mono text-[10px] text-text-secondary uppercase tracking-widest">
            // CRITICAL PATH PENDING REVIEW AGES
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-bg-card border-border-custom p-5 relative space-y-4 text-white">
              <span className="absolute top-5 right-5 font-mono text-[9px] bg-brand-error/15 border border-brand-error/25 text-brand-error px-2 py-0.5 rounded uppercase font-semibold">
                PENDING FOR 2 DAYS
              </span>

              <div className="space-y-1">
                <span className="block font-mono text-[9px] text-text-muted uppercase">
                  // DELIVERABLE
                </span>
                <h4 className="font-sans text-xs font-bold">
                  Fintech Engine Architecture Whitepaper
                </h4>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Full scope of work and high-volume ledger transaction pipeline models matching UK
                  FCA compliance guidelines.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border-custom/40 pt-3 mt-4">
                <div className="flex items-center gap-2 font-mono text-[9px] text-text-muted">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Initiated: 2026-06-20 by Jawad Khan Hakim</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toast.success("Revision requested")}
                    className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30"
                  >
                    <RotateCcw className="w-3 h-3" />
                    [REQUEST_REVISION]
                  </button>
                  <button
                    onClick={() => toast.success("Approved")}
                    className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-brand-success/10 hover:bg-brand-success/25 text-brand-success border border-brand-success/30"
                  >
                    <Check className="w-3 h-3" />
                    [APPROVE]
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Revenue ledgers */}
      {activeTab === "billing" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-bg-card border-border-custom p-5 space-y-4 text-white">
              <span className="block font-mono text-[9px] text-text-secondary uppercase tracking-widest">
                // COMPOSE SECURE BILLING REQUISITION
              </span>

              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div>
                  <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                    Billing Item description
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. FCA ledger settlement milestone 1..."
                    value={invDesc}
                    onChange={(e) => setInvDesc(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                    Billing Amount (USD)
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 5000"
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-mono"
                  />
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  className="w-full font-mono text-xs uppercase font-bold py-2.5 cursor-pointer"
                  isLoading={submitting}
                >
                  DISPATCH INVOICE
                </Button>
              </form>
            </Card>
          </div>

          <Card className="lg:col-span-2 bg-bg-card border-border-custom overflow-hidden text-white">
            <CardHeader className="border-b border-border-custom/50 bg-bg-secondary/40">
              <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
                // LEDGERS CONTROL OVERRIDE
              </span>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-custom/60 font-mono text-[9px] text-text-muted uppercase bg-bg-secondary/10">
                    <th className="p-3">ID</th>
                    <th className="p-3">Detail</th>
                    <th className="p-3 text-right">Balance</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Manual Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom/40">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="p-3 font-mono font-bold">{inv.invoiceNumber}</td>
                      <td className="p-3 font-sans">{inv.description}</td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={inv.status === "Paid" ? "success" : "cyan"}
                          className="font-mono text-[8px]"
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditInvoice(inv)}
                            className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
                          >
                            <Edit className="w-3 h-3" />
                            [EDIT]
                          </button>
                          {inv.status !== "Paid" && (
                            <button
                              onClick={() => handleMarkPaid(inv.id)}
                              className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              [MARK_PAID]
                            </button>
                          )}
                          <button
                            onClick={() => toast.success("Invoice deleted")}
                            className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30"
                          >
                            <Trash2 className="w-3 h-3" />
                            [DELETE]
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Phase Milestones */}
      {activeTab === "milestones" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-bg-card border-border-custom p-5 space-y-4 text-white">
              <span className="block font-mono text-[9px] text-text-secondary uppercase tracking-widest">
                // DEFINE PROJECT MILESTONE
              </span>

              <form onSubmit={handleCreateMilestone} className="space-y-4">
                <div>
                  <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                    Milestone headline title
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. London Clearing integration..."
                    value={milTitle}
                    onChange={(e) => setMilTitle(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Explicit delivery goals specifications..."
                    value={milDesc}
                    onChange={(e) => setMilDesc(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom text-white p-3 text-xs rounded-input outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                    Target Date
                  </label>
                  <input
                    required
                    type="date"
                    value={milDate}
                    onChange={(e) => setMilDate(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-mono"
                  />
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  className="w-full font-mono text-xs uppercase font-bold py-2.5 cursor-pointer"
                  isLoading={submitting}
                >
                  APPEND MILESTONE
                </Button>
              </form>
            </Card>
          </div>

          <Card className="lg:col-span-2 bg-bg-card border-border-custom overflow-hidden text-white font-sans">
            <CardHeader className="border-b border-border-custom/50 bg-bg-secondary/40">
              <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
                // CONTRACTED MILESTONES STATE
              </span>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-custom/60 font-mono text-[9px] text-text-muted uppercase bg-bg-secondary/10">
                    <th className="p-3">Index</th>
                    <th className="p-3">Headline</th>
                    <th className="p-3">Due Target</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom/40">
                  {milestones.map((mil) => (
                    <tr key={mil.id}>
                      <td className="p-3 font-mono font-bold">#{mil.order}</td>
                      <td className="p-3 font-sans font-semibold">{mil.title}</td>
                      <td className="p-3 font-mono text-text-secondary">{mil.dueDate}</td>
                      <td className="p-3">
                        <Badge
                          variant={mil.status === "Completed" ? "success" : "cyan"}
                          className="font-mono text-[8px]"
                        >
                          {mil.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditMilestone(mil)}
                            className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
                          >
                            <Edit className="w-3 h-3" />
                            [EDIT]
                          </button>
                          <button
                            onClick={() => toast.success("Milestone marked in progress")}
                            className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30"
                          >
                            <Play className="w-3 h-3" />
                            [IN PROGRESS]
                          </button>
                          <button
                            onClick={() => toast.success("Milestone marked done")}
                            className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-brand-success/10 hover:bg-brand-success/25 text-brand-success border border-brand-success/30"
                          >
                            <Check className="w-3 h-3" />
                            [MARK DONE]
                          </button>
                          <button
                            onClick={() => toast.success("Milestone deleted")}
                            className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30"
                          >
                            <Trash2 className="w-3 h-3" />
                            [DELETE]
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Support tickets tab */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          <span className="block font-mono text-[10px] text-text-secondary uppercase tracking-widest">
            // OUTSTANDING SYSTEM TICKETS ENQUEUE
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="bg-bg-card border-border-custom p-5 space-y-4 text-white">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-text-muted uppercase">
                      [{ticket.category}]
                    </span>
                    <h4 className="font-sans text-xs font-bold">{ticket.title}</h4>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>

                  <Badge variant="cyan" className="font-mono text-[8px]">
                    {ticket.status}
                  </Badge>
                </div>

                <div className="border-t border-border-custom/40 pt-3 flex justify-between items-center text-[10px] font-mono text-text-secondary mb-3">
                  <span>Raised by: {ticket.clientName}</span>
                  <span
                    className={`uppercase font-semibold ${
                      ticket.priority === "Critical" ? "text-brand-error animate-pulse" : ""
                    }`}
                  >
                    Priority: {ticket.priority}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toast.success("Ticket edited")}
                    className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
                  >
                    <Edit className="w-3 h-3" />
                    [EDIT]
                  </button>
                  <button
                    onClick={() => toast.success("Ticket marked in progress")}
                    className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30"
                  >
                    <Play className="w-3 h-3" />
                    [IN PROGRESS]
                  </button>
                  <button
                    onClick={() => toast.success("Ticket resolved")}
                    className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-brand-success/10 hover:bg-brand-success/25 text-brand-success border border-brand-success/30"
                  >
                    <Check className="w-3 h-3" />
                    [RESOLVE]
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Resend Mail Auditor */}
      {activeTab === "emails" && (
        <div className="space-y-4">
          <Card className="bg-bg-card border-border-custom p-4 text-white">
            <span className="font-mono text-[10px] text-accent-primary uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Mail className="h-4.5 w-4.5 animate-pulse" />
              // RESEND TRANSACTIONAL MAIL DISPATCH LOGS
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              Provides absolute transparency for server-triggered client communications. Inspect full JSON
              payloads below.
            </p>
          </Card>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {emailLogs.map((log) => (
              <Card key={log.id} className="bg-bg-card border-border-custom p-4 space-y-3 text-white">
                <div className="flex justify-between items-center pb-2 border-b border-border-custom/50 font-mono text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-success flex items-center gap-1">
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" /> DELIVERED
                    </span>
                    <span className="text-text-muted">•</span>
                    <span className="text-white">Recip: {log.recipient}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-text-muted">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => toast.success("Email resend triggered")}
                      className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30"
                    >
                      <RotateCcw className="w-3 h-3" />
                      [RESEND]
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 font-mono text-[9px] text-text-secondary">
                  <div>
                    <span className="text-text-muted">SUBJECT:</span> {log.subject}
                  </div>
                  <div>
                    <span className="text-text-muted">TEMPLATE TYPE:</span> {log.template}
                  </div>
                </div>

                <details className="outline-none group">
                  <summary className="font-mono text-[9px] text-accent-primary uppercase hover:underline cursor-pointer select-none inline-block">
                    [VIEW_RAW_JSON_METADATA_BLOCK]
                  </summary>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(log.payload, null, 2));
                      toast.success("JSON copied to clipboard");
                    }}
                    className="ml-3 inline-flex text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
                  >
                    <Copy className="w-3 h-3" />
                    [COPY_JSON]
                  </button>
                  <pre className="mt-2.5 p-3.5 bg-bg-primary border border-border-custom rounded text-[10px] font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </details>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {editInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-border-custom rounded-card p-6 shadow-glow w-full max-w-md space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono text-xs uppercase tracking-wider text-accent-primary font-bold">
                Edit Invoice
              </h3>
              <button onClick={() => setEditInvoice(null)} className="text-text-muted hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Description</label>
                <input
                  defaultValue={editInvoice.description}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Amount</label>
                <input
                  defaultValue={editInvoice.total}
                  type="number"
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Status</label>
                <select
                  defaultValue={editInvoice.status}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                >
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setEditInvoice(null)}
                className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
              >
                [CANCEL]
              </button>
              <button
                onClick={() => {
                  toast.success("Invoice updated");
                  setEditInvoice(null);
                }}
                className="bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs uppercase font-bold rounded-input shadow-glow px-4 py-2 cursor-pointer"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Milestone Modal */}
      {editMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-border-custom rounded-card p-6 shadow-glow w-full max-w-md space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono text-xs uppercase tracking-wider text-accent-primary font-bold">
                Edit Milestone
              </h3>
              <button onClick={() => setEditMilestone(null)} className="text-text-muted hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Title</label>
                <input
                  defaultValue={editMilestone.title}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Due Date</label>
                <input
                  type="date"
                  defaultValue={editMilestone.dueDate}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Status</label>
                <select
                  defaultValue={editMilestone.status}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setEditMilestone(null)}
                className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
              >
                [CANCEL]
              </button>
              <button
                onClick={() => {
                  toast.success("Milestone updated");
                  setEditMilestone(null);
                }}
                className="bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs uppercase font-bold rounded-input shadow-glow px-4 py-2 cursor-pointer"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
