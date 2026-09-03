"use client";

import * as React from "react";
import {
  Sparkles,
  Building2,
  User,
  Phone,
  Mail,
  Shield,
  Activity,
  Calendar,
  FileText,
  CheckCircle2,
  Edit,
  Download,
  RotateCcw,
  X,
  Plus,
  Trash2,
  Clock,
  Tag,
  MessageSquare,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { exportToCSV } from "@/src/lib/export";

export default function Client360Page() {
  const { user } = useUser();
  const {
    project,
    milestones,
    invoices,
    tickets,
    maintenancePlan,
    clientNotes,
    addClientNote,
    deleteClientNote,
    npsFeedback,
    approvals,
  } = usePortalData();

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isNewNoteOpen, setIsNewNoteOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    companyName: user?.companyName || "Sterling Capital Group",
    name: user?.name || "John Sterling",
    email: user?.email || "john@sterling.com",
    phone: user?.phone || "+44 20 7946 0192",
  });

  // Note form state
  const [noteTag, setNoteTag] = React.useState<"Important" | "Billing" | "Technical" | "Relationship">("Important");
  const [noteContent, setNoteContent] = React.useState("");

  // Dynamic Health Score Algorithm
  // 1. Payment component (30 pts)
  const totalInvoiced = invoices?.reduce((acc, i) => acc + (i.total || i.amount || 0), 0) || 1;
  const totalPaid = invoices?.filter((i) => i.status === "Paid").reduce((acc, i) => acc + (i.total || i.amount || 0), 0) || 0;
  const paymentScore = Math.round((totalPaid / totalInvoiced) * 30);

  // 2. Ticket SLA resolution (25 pts)
  const totalTickets = tickets?.length || 1;
  const resolvedTickets = tickets?.filter((t) => t.status === "Resolved").length || 1;
  const ticketScore = Math.round((resolvedTickets / totalTickets) * 25);

  // 3. Milestone Progress (25 pts)
  const totalMilestones = milestones?.length || 1;
  const completedMilestones = milestones?.filter((m) => m.status === "Completed").length || 0;
  const milestoneScore = Math.round((completedMilestones / totalMilestones) * 25);

  // 4. CSAT/NPS (20 pts)
  const avgNps = npsFeedback?.length ? npsFeedback[0].npsScore : 10;
  const npsScoreComponent = Math.round((avgNps / 10) * 20);

  const calculatedHealthScore = Math.min(100, Math.max(20, paymentScore + ticketScore + milestoneScore + npsScoreComponent));

  const handleSaveContact = () => {
    setIsEditModalOpen(false);
    toast.success("Client profile updated successfully");
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      toast.error("Please enter note content");
      return;
    }
    addClientNote({
      authorName: user?.name || "Account Manager",
      authorRole: user?.role === "admin" ? "Super Admin" : "Account Executive",
      tag: noteTag,
      content: noteContent.trim(),
    });
    setNoteContent("");
    setIsNewNoteOpen(false);
    toast.success("Client intelligence note saved!");
  };

  const handleExportSummary = () => {
    const summaryData = [
      { Category: "Organization", Value: formData.companyName },
      { Category: "Primary Contact", Value: formData.name },
      { Category: "Email Node", Value: formData.email },
      { Category: "Phone", Value: formData.phone },
      { Category: "Health Score", Value: `${calculatedHealthScore}/100` },
      { Category: "Active Project", Value: project?.name || "SWAP Core Platform" },
      { Category: "Project Phase", Value: project?.phase || "Build" },
      { Category: "Total Revenue Invoiced", Value: `$${totalInvoiced.toLocaleString()}` },
      { Category: "Total Revenue Settled", Value: `$${totalPaid.toLocaleString()}` },
      { Category: "Open Support Tickets", Value: `${totalTickets - resolvedTickets}` },
      { Category: "SLA Plan", Value: maintenancePlan?.planName || "Enterprise SLA Care" },
    ];
    exportToCSV(summaryData, `${formData.companyName.toLowerCase().replace(/\s+/g, "_")}_client360`);
    toast.success("Client 360 overview exported as CSV");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-accent-primary" />
          <h1 className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // CLIENT 360° RELATIONSHIP & INTELLIGENCE MATRIX
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="cyan" className="font-mono text-[9px]">
            {formData.companyName}
          </Badge>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="text-[9px] font-mono font-bold px-2.5 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30"
          >
            <Edit className="w-3 h-3" /> EDIT PROFILE
          </button>
          <button
            onClick={handleExportSummary}
            className="text-[9px] font-mono font-bold px-2.5 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
          >
            <FileSpreadsheet className="w-3 h-3 text-emerald-400" /> EXPORT CSV
          </button>
        </div>
      </div>

      {/* Top Grid: Health Score & Org Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Gauge */}
        <Card className="bg-bg-card border-border-custom p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="block font-mono text-[9px] text-text-muted uppercase">
              // CLIENT HEALTH INDEX (CALCULATED)
            </span>
            <h3 className="font-sans text-lg font-bold text-white">Relationship Health</h3>
          </div>

          <div className="my-4 flex items-center justify-center">
            <div
              className={`relative w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-lg ${
                calculatedHealthScore >= 80
                  ? "border-emerald-400/40 text-emerald-400"
                  : calculatedHealthScore >= 60
                  ? "border-cyan-400/40 text-cyan-400"
                  : "border-amber-400/40 text-amber-400"
              }`}
            >
              <span className="font-mono text-4xl font-extrabold text-white">
                {calculatedHealthScore}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest mt-1">
                / 100 {calculatedHealthScore >= 80 ? "OPTIMAL" : "STABLE"}
              </span>
            </div>
          </div>

          <div className="p-3 bg-bg-secondary/60 border border-border-custom/50 rounded-input font-mono text-[10px] space-y-1 text-text-secondary">
            <div className="flex justify-between">
              <span>Payment Compliance:</span>
              <span className="text-emerald-400 font-bold">{paymentScore}/30 pts</span>
            </div>
            <div className="flex justify-between">
              <span>SLA Incident Triage:</span>
              <span className="text-cyan-400 font-bold">{ticketScore}/25 pts</span>
            </div>
            <div className="flex justify-between">
              <span>Milestone Delivery:</span>
              <span className="text-accent-primary font-bold">{milestoneScore}/25 pts</span>
            </div>
            <div className="flex justify-between">
              <span>CSAT / NPS Rating:</span>
              <span className="text-amber-400 font-bold">{npsScoreComponent}/20 pts</span>
            </div>
          </div>
        </Card>

        {/* Company Profile Details */}
        <Card className="lg:col-span-2 bg-bg-card border-border-custom p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-border-custom/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded bg-bg-secondary border border-border-custom flex items-center justify-center font-bold text-accent-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans text-base font-bold text-white">
                  {formData.companyName}
                </h3>
                <p className="font-mono text-[10px] text-text-muted uppercase">
                  ENTERPRISE ACCOUNT • TIER 1 PLATINUM
                </p>
              </div>
            </div>
            <Badge variant="success" className="font-mono text-[9px]">
              ACTIVE PARTNER
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-text-secondary">
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input space-y-1">
              <span className="text-[9px] text-text-muted uppercase block">// PRIMARY CONTACT OFFICER</span>
              <p className="text-white font-semibold flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-accent-primary" /> {formData.name}
              </p>
            </div>
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input space-y-1">
              <span className="text-[9px] text-text-muted uppercase block">// OFFICIAL EMAIL NODE</span>
              <p className="text-white font-semibold flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-accent-primary" /> {formData.email}
              </p>
            </div>
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input space-y-1">
              <span className="text-[9px] text-text-muted uppercase block">// TELEPHONE CONTACT</span>
              <p className="text-white font-semibold flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-accent-primary" /> {formData.phone}
              </p>
            </div>
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input space-y-1">
              <span className="text-[9px] text-text-muted uppercase block">// DESIGNATED LEAD ENGINEER</span>
              <p className="text-white font-semibold flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Shivam Dube (Founder & Lead)
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Internal Intelligence Notes Section */}
      <Card className="bg-bg-card border-border-custom p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-border-custom/50">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent-primary" />
            <h3 className="font-mono text-xs text-white uppercase font-bold">
              // INTERNAL ACCOUNT INTELLIGENCE & ENGINEERING NOTES
            </h3>
          </div>
          <Button
            size="sm"
            onClick={() => setIsNewNoteOpen(true)}
            className="flex items-center gap-1 text-xs font-mono"
          >
            <Plus className="w-3.5 h-3.5" />
            ADD NOTE
          </Button>
        </div>

        <div className="space-y-3">
          {(!clientNotes || clientNotes.length === 0) ? (
            <p className="font-mono text-xs text-text-muted py-4 text-center">
              // NO INTERNAL CLIENT NOTES RECORDED
            </p>
          ) : (
            clientNotes.map((note) => (
              <div
                key={note.id}
                className="p-3.5 rounded-input bg-bg-secondary/50 border border-border-custom/50 flex flex-col sm:flex-row justify-between items-start gap-3 group"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                        note.tag === "Important"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : note.tag === "Billing"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : note.tag === "Technical"
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                          : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                      }`}
                    >
                      {note.tag}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      By {note.authorName} ({note.authorRole}) •{" "}
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary font-sans leading-relaxed">
                    {note.content}
                  </p>
                </div>
                <button
                  onClick={() => {
                    deleteClientNote(note.id);
                    toast.success("Note deleted");
                  }}
                  className="p-1 rounded text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-80 group-hover:opacity-100"
                  title="Delete Note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Aggregate Modules Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-bg-card border-border-custom p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] text-text-muted uppercase">// ACTIVE DEPLOYMENT</span>
            <Activity className="h-4 w-4 text-accent-primary" />
          </div>
          <p className="font-sans text-sm font-bold text-white">{project?.name || "SWAP Core Platform"}</p>
          <div className="flex justify-between font-mono text-[10px]">
            <span className="text-text-muted">Phase: {project?.phase || "Build"}</span>
            <span className="text-accent-primary font-bold">{project?.progress || 68}% Complete</span>
          </div>
        </Card>

        <Card className="bg-bg-card border-border-custom p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] text-text-muted uppercase">// SLA CARE COVERAGE</span>
            <Shield className="h-4 w-4 text-brand-success" />
          </div>
          <p className="font-sans text-sm font-bold text-white">{maintenancePlan?.planName || "Platinum SLA"}</p>
          <div className="flex justify-between font-mono text-[10px]">
            <span className="text-text-muted">SLA Response: &lt;1 Hour</span>
            <span className="text-emerald-400 font-bold">Uptime: 99.95%</span>
          </div>
        </Card>

        <Card className="bg-bg-card border-border-custom p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] text-text-muted uppercase">// FINANCES OVERVIEW</span>
            <FileText className="h-4 w-4 text-accent-primary" />
          </div>
          <p className="font-sans text-sm font-bold text-white">${totalInvoiced.toLocaleString()} Total Billed</p>
          <div className="flex justify-between font-mono text-[10px]">
            <span className="text-emerald-400 font-bold">Paid: ${totalPaid.toLocaleString()}</span>
            <span className="text-amber-400 font-bold">Pending: ${(totalInvoiced - totalPaid).toLocaleString()}</span>
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-bg-card border border-border-custom rounded-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border-custom/50">
              <h2 className="font-mono text-xs uppercase tracking-wider text-accent-primary font-bold">
                // EDIT CLIENT CONTACT PROFILE
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-text-muted hover:text-white p-1 rounded bg-bg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">
                  Primary Contact Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border-custom/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                className="font-mono text-xs"
              >
                CANCEL
              </Button>
              <Button size="sm" onClick={handleSaveContact} className="font-mono text-xs">
                SAVE CHANGES
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Note Modal */}
      {isNewNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-bg-card border border-border-custom rounded-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border-custom/50">
              <h2 className="font-mono text-xs uppercase tracking-wider text-accent-primary font-bold">
                // ADD CLIENT INTELLIGENCE NOTE
              </h2>
              <button
                onClick={() => setIsNewNoteOpen(false)}
                className="text-text-muted hover:text-white p-1 rounded bg-bg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">
                  Note Classification Tag
                </label>
                <select
                  value={noteTag}
                  onChange={(e) => setNoteTag(e.target.value as any)}
                  className="w-full bg-bg-secondary border border-border-custom text-white text-xs px-3 py-2 rounded-input outline-none font-mono"
                >
                  <option value="Important">Important Priority</option>
                  <option value="Billing">Billing & Commercials</option>
                  <option value="Technical">Technical Requirements</option>
                  <option value="Relationship">Client Relationship</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">
                  Note Content
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Record strategic preferences, meeting takeaways, or technical constraints..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white text-xs p-3 rounded-input outline-none focus:border-accent-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-custom/50">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewNoteOpen(false)}
                  className="font-mono text-xs"
                >
                  CANCEL
                </Button>
                <Button type="submit" size="sm" className="font-mono text-xs">
                  SAVE NOTE
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
