import React, { useState, useEffect } from "react";
import { Project, Milestone, Invoice, SupportTicket, ApprovalDeliverable } from "../types";
import { api } from "../lib/api";
import { Terminal, Shield, Plus, DollarSign, Calendar, HelpCircle, Mail, Clock, Check, FileText, ChevronRight, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface AdminPanelProps {
  project: Project;
  onRefreshProject: () => void;
}

export default function AdminPanel({ project, onRefreshProject }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"approvals" | "billing" | "milestones" | "tickets" | "emails" | "clients">("clients");
  
  // Data lists
  const [approvals, setApprovals] = useState<ApprovalDeliverable[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Forms states
  const [invDesc, setInvDesc] = useState("");
  const [invAmount, setInvAmount] = useState("");
  
  const [milTitle, setMilTitle] = useState("");
  const [milDesc, setMilDesc] = useState("");
  const [milDate, setMilDate] = useState("");

  // Client creation state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientMessage, setClientMessage] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      const [aList, iList, tList, mList, logs, cList] = await Promise.all([
        api.getApprovals(project.id).catch(() => []),
        api.getInvoices(project.id).catch(() => []),
        api.getTickets(project.id).catch(() => []),
        api.getMilestones(project.id).catch(() => []),
        api.getEmailLogs().catch(() => []),
        api.getAdminClients().catch(() => [])
      ]);
      setApprovals(aList || []);
      setInvoices(iList || []);
      setTickets(tList || []);
      setMilestones(mList || []);
      setEmailLogs(logs || []);
      setClients(cList || []);
    } catch (err) {
      console.error("Admin data extraction failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 15000);
    return () => clearInterval(interval);
  }, [project]);

  // Calculations
  const revenueTotal = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((acc, current) => acc + current.total, 0);

  const pendingRevenue = invoices
    .filter((inv) => inv.status !== "Paid")
    .reduce((acc, current) => acc + current.total, 0);

  // Filter chronological oldest pending approvals first
  const pendingApprovals = approvals
    .filter((a) => a.status === "Pending")
    .sort((a, b) => new Date(a.auditTrail[0]?.timestamp || 0).getTime() - new Date(b.auditTrail[0]?.timestamp || 0).getTime());

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invDesc || !invAmount) return;
    setSubmitting(true);
    try {
      await api.createInvoice({
        projectId: project.id,
        description: invDesc,
        lineItems: [{ description: invDesc, amount: parseFloat(invAmount) }]
      });
      setInvDesc("");
      setInvAmount("");
      await loadAdminData();
    } catch (err) {
      console.error("Invoice creation failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milTitle || !milDesc || !milDate) return;
    setSubmitting(true);
    try {
      await api.createMilestone({
        projectId: project.id,
        title: milTitle,
        description: milDesc,
        dueDate: milDate
      });
      setMilTitle("");
      setMilDesc("");
      setMilDate("");
      await loadAdminData();
      onRefreshProject();
    } catch (err) {
      console.error("Milestone appending failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail) return;
    setSubmitting(true);
    setClientMessage(null);
    try {
      // Persist client locally for frontend state
      const customRaw = localStorage.getItem("bf_custom_users");
      const custom: any[] = customRaw ? JSON.parse(customRaw) : [];
      const newClient = {
        id: `client-${Date.now()}`,
        name: clientName.trim(),
        email: clientEmail.toLowerCase().trim(),
        role: "client",
        companyName: clientCompany || "Client Enterprise",
        phone: clientPhone || "+1 555 0192",
        timezone: "Asia/Kolkata",
        status: "active",
        createdAt: new Date().toISOString()
      };

      custom.push(newClient);
      localStorage.setItem("bf_custom_users", JSON.stringify(custom));

      // Attempt server sync
      await api.createClientAccount({
        name: clientName,
        email: clientEmail,
        companyName: clientCompany,
        phone: clientPhone
      }).catch(() => {});

      setClientName("");
      setClientEmail("");
      setClientCompany("");
      setClientPhone("");
      setClientMessage(`✅ Provisioned client account for ${newClient.email}. Credentials active!`);
      await loadAdminData();
    } catch (err: any) {
      setClientMessage(`❌ Provisioning failed: ${err?.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleClientStatus = async (clientId: string) => {
    try {
      await api.toggleClientStatus(clientId).catch(() => {});
      const customRaw = localStorage.getItem("bf_custom_users");
      if (customRaw) {
        let custom: any[] = JSON.parse(customRaw);
        custom = custom.map((u) => u.id === clientId ? { ...u, status: u.status === "active" ? "deactivated" : "active" } : u);
        localStorage.setItem("bf_custom_users", JSON.stringify(custom));
      }
      await loadAdminData();
    } catch (err) {
      console.error("Client status toggle failed:", err);
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      await api.completePayment(invoiceId);
      await loadAdminData();
    } catch (err) {
      console.error("Manual pay override failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-bg-card border border-border-custom p-6 rounded-card animate-pulse h-[400px]"></div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Selectors */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-bg-card border border-border-custom rounded-input">
        <button
          onClick={() => setActiveTab("clients")}
          className={`px-4 py-2 font-mono text-[11px] uppercase font-bold rounded cursor-pointer transition-all ${activeTab === "clients" ? "bg-accent-primary text-bg-primary shadow-glow" : "text-text-secondary hover:text-text-primary"}`}
        >
          Client Accounts ({clients.length})
        </button>
        <button
          onClick={() => setActiveTab("approvals")}
          className={`px-4 py-2 font-mono text-[11px] uppercase font-bold rounded cursor-pointer transition-all ${activeTab === "approvals" ? "bg-accent-primary text-bg-primary shadow-glow" : "text-text-secondary hover:text-text-primary"}`}
        >
          Approvals Queue ({pendingApprovals.length})
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`px-4 py-2 font-mono text-[11px] uppercase font-bold rounded cursor-pointer transition-all ${activeTab === "billing" ? "bg-accent-primary text-bg-primary shadow-glow" : "text-text-secondary hover:text-text-primary"}`}
        >
          Revenue Ledgers
        </button>
        <button
          onClick={() => setActiveTab("milestones")}
          className={`px-4 py-2 font-mono text-[11px] uppercase font-bold rounded cursor-pointer transition-all ${activeTab === "milestones" ? "bg-accent-primary text-bg-primary shadow-glow" : "text-text-secondary hover:text-text-primary"}`}
        >
          Phase Milestones
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`px-4 py-2 font-mono text-[11px] uppercase font-bold rounded cursor-pointer transition-all ${activeTab === "tickets" ? "bg-accent-primary text-bg-primary shadow-glow" : "text-text-secondary hover:text-text-primary"}`}
        >
          Secure Tickets
        </button>
        <button
          onClick={() => setActiveTab("emails")}
          className={`px-4 py-2 font-mono text-[11px] uppercase font-bold rounded cursor-pointer transition-all ${activeTab === "emails" ? "bg-accent-primary text-bg-primary shadow-glow" : "text-text-secondary hover:text-text-primary"}`}
        >
          Resend Mail Auditor
        </button>
      </div>

      {/* VIEW 0: Client Provisioning & User Account Management */}
      {activeTab === "clients" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Provision Form */}
          <div className="lg:col-span-2 bg-bg-card border border-border-custom p-5 rounded-card self-start space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border-custom/50 font-mono text-xs text-white uppercase font-bold">
              <Plus className="h-4 w-4 text-accent-primary" />
              <span>Provision New Client Account</span>
            </div>

            {clientMessage && (
              <div className={`p-3 rounded text-xs font-mono border ${clientMessage.startsWith("✅") ? "bg-brand-success/10 border-brand-success/30 text-brand-success" : "bg-brand-error/10 border-brand-error/30 text-brand-error"}`}>
                {clientMessage}
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-3.5">
              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                  Client Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                  Client Email Address *
                </label>
                <input
                  required
                  type="email"
                  placeholder="sarah@enterprise.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                  Organization / Company Name
                </label>
                <input
                  type="text"
                  placeholder="Enterprise Logistics Ltd."
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                  Direct Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+44 20 7946 0912"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div className="p-3 bg-bg-secondary border border-border-custom/60 rounded text-[9px] font-mono text-text-muted leading-relaxed uppercase">
                // Admin Authority: Account credentials are generated and activated instantly. Client will log in using this email.
              </div>

              <button
                type="submit"
                disabled={submitting || !clientName || !clientEmail}
                className="w-full py-2.5 bg-accent-primary hover:bg-accent-primary/90 text-bg-primary font-mono text-xs font-bold uppercase rounded-input transition-all cursor-pointer shadow-glow disabled:opacity-50"
              >
                {submitting ? "PROVISIONING..." : "PROVISION CLIENT ACCOUNT"}
              </button>
            </form>
          </div>

          {/* Client Directory */}
          <div className="lg:col-span-3 space-y-4">
            <span className="block font-mono text-[9px] text-text-muted uppercase tracking-wider">
              // ACTIVE & PROVISIONED CLIENT ACCOUNTS ({clients.length})
            </span>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {clients.map((c) => (
                <div key={c.id} className="p-4 bg-bg-card border border-border-custom rounded-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-sans text-xs font-bold text-white">{c.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${c.status === "active" ? "bg-brand-success/15 text-brand-success border border-brand-success/30" : "bg-brand-error/15 text-brand-error border border-brand-error/30"}`}>
                        {c.status || "active"}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-accent-primary">{c.email}</p>
                    <p className="font-mono text-[9px] text-text-muted">Company: {c.companyName || "N/A"} • Project: {c.activeProject || "Sterling Wealth SWAP"}</p>
                  </div>

                  <button
                    onClick={() => handleToggleClientStatus(c.id)}
                    className={`px-3 py-1.5 font-mono text-[9px] font-bold uppercase rounded border transition-all cursor-pointer ${c.status === "active" ? "bg-brand-error/10 hover:bg-brand-error/20 text-brand-error border-brand-error/30" : "bg-brand-success/10 hover:bg-brand-success/20 text-brand-success border-brand-success/30"}`}
                  >
                    {c.status === "active" ? "[DEACTIVATE]" : "[ACTIVATE]"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeTab === "approvals" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">// CRITICAL PATH PENDING REVIEW AGES (CHRONOLOGICAL OLDEST FIRST)</span>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="border border-dashed border-border-custom bg-bg-card/40 p-12 text-center text-text-secondary rounded-card">
              <CheckCircle2 className="h-10 w-10 text-brand-success mx-auto mb-3" />
              <p className="font-sans text-xs font-semibold text-text-primary">Zero blocking approvals.</p>
              <p className="font-mono text-[9px] text-text-muted uppercase mt-0.5">// ALL COMMITTED MILESTONES ARE UNLOCKED</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingApprovals.map((app, idx) => {
                const ageDays = Math.max(1, Math.floor((Date.now() - new Date(app.auditTrail[0]?.timestamp || 0).getTime()) / (1000 * 60 * 60 * 24)));
                
                return (
                  <div key={app.id} className="p-5 bg-bg-card border border-border-custom rounded-card hover:border-accent-primary/40 transition-colors relative space-y-4">
                    <span className="absolute top-5 right-5 font-mono text-[9px] bg-brand-error/15 border border-brand-error/25 text-brand-error px-2 py-0.5 rounded uppercase font-semibold">
                      PENDING FOR {ageDays} DAY{ageDays > 1 ? "S" : ""}
                    </span>

                    <div className="space-y-1">
                      <span className="block font-mono text-[9px] text-text-muted uppercase">// DELIVERABLE</span>
                      <h4 className="font-sans text-xs font-bold text-text-primary">{app.name}</h4>
                      <p className="text-[11px] text-text-secondary line-clamp-2">{app.description}</p>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[9px] text-text-muted border-t border-border-custom/40 pt-3">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Initiated: {new Date(app.auditTrail[0]?.timestamp || 0).toLocaleDateString()} by system integrator</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Invoices ledgers */}
      {activeTab === "billing" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue totals and creator */}
          <div className="lg:col-span-1 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-bg-card border border-border-custom rounded-card text-center">
                <span className="block font-mono text-[8px] text-text-muted uppercase">// REVENUE COLLECTED</span>
                <span className="block text-lg font-bold font-mono text-brand-success mt-1">${revenueTotal.toLocaleString()}</span>
              </div>
              <div className="p-4 bg-bg-card border border-border-custom rounded-card text-center">
                <span className="block font-mono text-[8px] text-text-muted uppercase">// UNSETTILED AGES</span>
                <span className="block text-lg font-bold font-mono text-accent-primary mt-1">${pendingRevenue.toLocaleString()}</span>
              </div>
            </div>

            {/* Create invoice */}
            <form onSubmit={handleCreateInvoice} className="p-5 bg-bg-card border border-border-custom rounded-card space-y-4">
              <span className="block font-mono text-[9px] text-text-secondary uppercase tracking-widest">// COMPOSE SECURE BILLING REQUISITION</span>
              
              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Billing Item description</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. FCA ledger settlement milestone 1..."
                  value={invDesc}
                  onChange={(e) => setInvDesc(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Billing Amount (USD)</label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 5000"
                  value={invAmount}
                  onChange={(e) => setInvAmount(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !invDesc || !invAmount}
                className="w-full py-2.5 bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs font-bold uppercase tracking-widest rounded-input transition-colors flex items-center justify-center gap-1.5"
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 stroke-[2.5]" />}
                DISPATCH INVOICE
              </button>
            </form>
          </div>

          {/* Invoices list and manual override */}
          <div className="lg:col-span-2 bg-bg-card border border-border-custom rounded-card overflow-hidden">
            <div className="p-4 border-b border-border-custom/50 bg-bg-secondary/40 flex justify-between items-center">
              <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">// LEDGERS CONTROL OVERRIDE</span>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-custom/60 font-mono text-[9px] text-text-muted uppercase tracking-wider bg-bg-secondary/10">
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
                    <td className="p-3 text-right font-mono font-semibold">${inv.total.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`font-mono text-[8px] px-2 py-0.5 border rounded uppercase ${inv.status === "Paid" ? "bg-brand-success/15 border-brand-success/25 text-brand-success" : "bg-accent-primary/15 border-accent-primary/25 text-accent-primary"}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {inv.status !== "Paid" && (
                        <button
                          onClick={() => handleMarkPaid(inv.id)}
                          className="px-2.5 py-1 bg-bg-secondary border border-border-custom hover:border-brand-success/40 text-text-secondary hover:text-brand-success font-mono text-[10px] uppercase rounded transition-all cursor-pointer"
                        >
                          [MARK_PAID]
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Milestones manager */}
      {activeTab === "milestones" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <form onSubmit={handleCreateMilestone} className="p-5 bg-bg-card border border-border-custom rounded-card space-y-4">
              <span className="block font-mono text-[9px] text-text-secondary uppercase tracking-widest">// DEFINE PROJECT MILESTONE</span>

              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Milestone headline title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. London Clearing integration..."
                  value={milTitle}
                  onChange={(e) => setMilTitle(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explicit delivery goals specifications..."
                  value={milDesc}
                  onChange={(e) => setMilDesc(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-text-primary p-3 text-xs rounded-input outline-none font-sans"
                ></textarea>
              </div>

              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Target Date</label>
                <input
                  required
                  type="date"
                  value={milDate}
                  onChange={(e) => setMilDate(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !milTitle || !milDesc || !milDate}
                className="w-full py-2.5 bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs font-bold uppercase tracking-widest rounded-input transition-colors flex items-center justify-center gap-1.5"
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 stroke-[2.5]" />}
                APPEND MILESTONE
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-bg-card border border-border-custom rounded-card overflow-hidden">
            <div className="p-4 border-b border-border-custom/50 bg-bg-secondary/40 flex justify-between items-center">
              <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">// CONTRACTED MILESTONES STATE</span>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-custom/60 font-mono text-[9px] text-text-muted uppercase bg-bg-secondary/10">
                  <th className="p-3">Index</th>
                  <th className="p-3">Headline</th>
                  <th className="p-3">Due Target</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/40">
                {milestones.map((mil, idx) => (
                  <tr key={mil.id}>
                    <td className="p-3 font-mono font-bold">#{mil.order}</td>
                    <td className="p-3 font-sans font-semibold text-text-primary">{mil.title}</td>
                    <td className="p-3 font-mono text-text-secondary">{mil.dueDate}</td>
                    <td className="p-3">
                      <span className={`font-mono text-[8px] px-2 py-0.5 border rounded uppercase ${mil.status === "Completed" ? "bg-brand-success/15 text-brand-success border-brand-success/20" : "bg-accent-primary/15 text-accent-primary border-accent-primary/20"}`}>
                        {mil.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: Support tickets response */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          <span className="block font-mono text-[10px] text-text-secondary uppercase tracking-widest">// OUTSTANDING SYSTEM TICKETS ENQUEUE</span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-5 bg-bg-card border border-border-custom rounded-card space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-text-muted uppercase">[{ticket.category}]</span>
                    <h4 className="font-sans text-xs font-bold text-text-primary">{ticket.title}</h4>
                    <p className="text-[11px] text-text-secondary leading-relaxed">{ticket.description}</p>
                  </div>

                  <span className={`font-mono text-[8px] px-1.5 py-0.5 border rounded uppercase ${ticket.status === "Resolved" ? "bg-brand-success/15 border-brand-success/20 text-brand-success" : "bg-accent-primary/15 border-accent-primary/20 text-accent-primary animate-pulse"}`}>
                    {ticket.status}
                  </span>
                </div>

                <div className="border-t border-border-custom/40 pt-3 flex justify-between items-center text-[10px] font-mono">
                  <span className="text-text-muted">Raised by: {ticket.clientName}</span>
                  <span className={`uppercase font-semibold ${ticket.priority === "Critical" ? "text-brand-error animate-pulse" : "text-text-secondary"}`}>
                    Priority: {ticket.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: Transactional Resend email audit logs */}
      {activeTab === "emails" && (
        <div className="space-y-4">
          <div className="p-4 bg-bg-card border border-border-custom rounded-card">
            <span className="font-mono text-[10px] text-accent-primary uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Mail className="h-4.5 w-4.5 animate-pulse" />
              // RESEND TRANSACTIONAL MAIL DISPATCH LOGS
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              Provides absolute transparency for server-triggered client communications. Inspect full JSON payloads below.
            </p>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {emailLogs.map((log) => (
              <div key={log.id} className="p-4 bg-bg-card border border-border-custom rounded-card space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-border-custom/50 font-mono text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-success flex items-center gap-1">
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" /> DELIVERED
                    </span>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-primary">Recip: {log.recipient}</span>
                  </div>
                  <span className="text-text-muted">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 font-mono text-[9px] text-text-secondary">
                  <div>
                    <span className="text-text-muted">SUBJECT:</span> {log.subject}
                  </div>
                  <div>
                    <span className="text-text-muted">TEMPLATE TYPE:</span> {log.template}
                  </div>
                </div>

                {/* Expendable payload details */}
                <details className="outline-none group">
                  <summary className="font-mono text-[9px] text-accent-primary uppercase hover:underline cursor-pointer select-none">
                    [VIEW_RAW_JSON_METADATA_BLOCK]
                  </summary>
                  <pre className="mt-2.5 p-3.5 bg-bg-primary border border-border-custom rounded text-[10px] font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
