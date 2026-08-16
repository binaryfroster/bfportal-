import { useState, useEffect } from "react";
import { Project, Milestone, Invoice, Contract, ApprovalDeliverable, Notification } from "../types";
import { api } from "../lib/api";
import { LayoutDashboard, Calendar, Bell, FileText, CheckCircle, ChevronRight, Activity, AlertCircle, PlusCircle, MessageSquare, PhoneCall, HelpCircle, DownloadCloud, Lock, FileSignature, ArrowRight, CreditCard } from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  user: any;
  project: Project;
  onNavigate: (section: string) => void;
  // Trigger actions
  onActionClick: (type: "approve" | "pay" | "sign", data: any) => void;
}

export default function Dashboard({ user, project, onNavigate, onActionClick }: DashboardProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [approvals, setApprovals] = useState<ApprovalDeliverable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!project) return;
      try {
        const [mList, iList, cList, aList] = await Promise.all([
          api.getMilestones(project.id),
          api.getInvoices(project.id),
          api.getContracts(project.id),
          api.getApprovals(project.id)
        ]);
        setMilestones(mList);
        setInvoices(iList);
        setContracts(cList);
        setApprovals(aList);
      } catch (err) {
        console.error("Failed loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
    
    // Polling simulation every 15 seconds for real-time dashboard updates
    const interval = setInterval(loadDashboardData, 15000);
    return () => clearInterval(interval);
  }, [project]);

  // Determine dynamic pending actions
  const pendingActions: Array<{
    id: string;
    type: "approve" | "pay" | "sign";
    title: string;
    description: string;
    badge: string;
    raw: any;
  }> = [];

  approvals.forEach((a) => {
    if (a.status === "Pending") {
      pendingActions.push({
        id: a.id,
        type: "approve",
        title: "Approve Deliverable",
        description: `Review and lock '${a.name}'.`,
        badge: "Critical",
        raw: a
      });
    }
  });

  invoices.forEach((i) => {
    if (i.status === "Sent") {
      pendingActions.push({
        id: i.id,
        type: "pay",
        title: "Outstanding Invoice Balance",
        description: `Pay Invoice ${i.invoiceNumber} ($${i.total}) via Stripe.`,
        badge: "High Priority",
        raw: i
      });
    }
  });

  contracts.forEach((c) => {
    if (c.status === "Pending Signature") {
      pendingActions.push({
        id: c.id,
        type: "sign",
        title: "Contract E-Signature Required",
        description: `Legally execute '${c.name}' with legal metadata.`,
        badge: "Urgent",
        raw: c
      });
    }
  });

  // Circular progress calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (project.progress / 100) * circumference;

  // Render recent activity feed (mock compiled from database status)
  const activities = [
    { text: "Shivam Dube committed core trading matching API architecture", time: "2 hours ago", type: "code" },
    { text: "Invoice BF-2026-002 was marked as Paid in full via Stripe Webhook", time: "1 day ago", type: "billing" },
    { text: "Digvijay Kadam uploaded updated Figma interface specifications v2", time: "3 days ago", type: "document" },
    { text: "Contract 'Master NDA between SCG & Binary Froster' signed successfully", time: "April 11, 2026", type: "contract" },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 animate-pulse">
        <div className="h-64 bg-bg-card border border-border-custom rounded-card"></div>
        <div className="h-64 bg-bg-card border border-border-custom rounded-card"></div>
        <div className="h-64 bg-bg-card border border-border-custom rounded-card"></div>
        <div className="h-64 bg-bg-card border border-border-custom rounded-card"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-text-primary">
            Welcome Back, <span className="text-accent-primary">{user.name}</span>
          </h1>
          <p className="font-mono text-[11px] text-text-muted uppercase tracking-wider mt-1">
            // Connected to: {project.name}
          </p>
        </div>
        
        {/* Connection status indicator */}
        <div className="flex items-center gap-2 px-3 py-1 bg-accent-primary/5 border border-accent-primary/20 rounded-full">
          <span className="h-2 w-2 rounded-full bg-accent-primary animate-ping"></span>
          <span className="font-mono text-[10px] text-accent-primary uppercase tracking-wider">
            Supabase Sync: Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1 & 2: Project status card */}
        <div className="lg:col-span-2 bg-bg-card border border-border-custom p-6 rounded-card relative overflow-hidden card-glowing-hover">
          <div className="absolute top-0 right-0 h-24 w-24 bg-accent-primary/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-4">
            <LayoutDashboard className="h-4 w-4 text-accent-primary" />
            <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">// ACTIVE DEPLOYMENT STATE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left circular progress */}
            <div className="flex flex-col items-center text-center p-2 border-r border-border-custom/50">
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg className="absolute -rotate-90 h-full w-full">
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    className="stroke-bg-primary"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    className="stroke-accent-primary transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center">
                  <span className="font-sans text-2xl font-bold block text-text-primary">
                    {project.progress}%
                  </span>
                  <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest block mt-0.5">
                    DEVELOPED
                  </span>
                </div>
              </div>
              <p className="font-sans text-xs text-text-secondary font-medium mt-3">
                Current Phase: <span className="text-accent-primary font-bold">{project.phase}</span>
              </p>
            </div>

            {/* Right stats and milestone info */}
            <div className="md:col-span-2 space-y-4 md:pl-4">
              <div>
                <span className="block font-mono text-[10px] text-text-muted uppercase">// PROJECT MODULES</span>
                <h3 className="font-sans text-lg font-bold text-text-primary mt-1">
                  {project.name}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-custom/40">
                <div>
                  <span className="block font-mono text-[9px] text-text-muted uppercase tracking-widest">
                    Next Deliverable
                  </span>
                  <span className="block font-sans text-xs font-semibold text-text-primary mt-0.5">
                    {project.upcomingMilestoneName}
                  </span>
                </div>
                <div>
                  <span className="block font-mono text-[9px] text-text-muted uppercase tracking-widest">
                    Target Release Date
                  </span>
                  <span className="block font-sans text-xs font-semibold text-accent-primary mt-0.5">
                    {project.upcomingMilestoneDate}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => onNavigate("tracker")}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-accent-primary hover:text-text-primary transition-colors pt-2 cursor-pointer group"
              >
                [TRACK_COMPLETE_LIFECYCLE]
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Quick action panel */}
        <div className="bg-bg-card border border-border-custom p-6 rounded-card relative overflow-hidden card-glowing-hover">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-accent-primary" />
            <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">// COMMAND TERMINAL</span>
          </div>

          <p className="text-xs text-text-secondary mb-5 leading-relaxed">
            Execute direct operations on your active environment using the secure Binary Froster tunnel.
          </p>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate("tickets")}
              className="w-full py-3 bg-bg-secondary border border-border-custom hover:border-accent-primary/60 hover:bg-bg-primary text-text-primary font-mono text-xs text-left px-4 rounded-input flex items-center justify-between transition-all group cursor-pointer shadow-glow-hover"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-accent-primary group-hover:animate-bounce" />
                // RAISE_SUPPORT_TICKET
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
            </button>

            <button
              onClick={() => onNavigate("meetings")}
              className="w-full py-3 bg-bg-secondary border border-border-custom hover:border-accent-primary/60 hover:bg-bg-primary text-text-primary font-mono text-xs text-left px-4 rounded-input flex items-center justify-between transition-all group cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-accent-primary group-hover:animate-pulse" />
                // BOOK_PROJECT_CALL
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
            </button>

            <button
              onClick={() => onNavigate("tickets")}
              className="w-full py-3 bg-bg-secondary border border-border-custom hover:border-accent-primary/60 hover:bg-bg-primary text-text-primary font-mono text-xs text-left px-4 rounded-input flex items-center justify-between transition-all group cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-accent-primary" />
                // RAISE_SUPPORT_TICKET
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
            </button>

            <button
              onClick={() => onNavigate("billing")}
              className="w-full py-3 bg-bg-secondary border border-border-custom hover:border-accent-primary/60 hover:bg-bg-primary text-text-primary font-mono text-xs text-left px-4 rounded-input flex items-center justify-between transition-all group cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <DownloadCloud className="h-4 w-4 text-accent-primary" />
                // EXPORT_LATEST_INVOICE
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions widgets */}
        <div className="bg-bg-card border border-border-custom p-6 rounded-card card-glowing-hover">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-accent-primary" />
              <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">// ACTIONS REQUIRED</span>
            </div>
            {pendingActions.length > 0 && (
              <span className="font-mono text-[10px] px-2 py-0.5 bg-brand-error/10 text-brand-error border border-brand-error/20 rounded">
                {pendingActions.length} ACTIONABLE
              </span>
            )}
          </div>

          {pendingActions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border-custom rounded-input bg-bg-secondary/40">
              <CheckCircle className="h-8 w-8 text-brand-success mx-auto mb-3" />
              <p className="font-sans text-xs text-text-primary font-medium">All systems green.</p>
              <p className="font-mono text-[10px] text-text-muted uppercase mt-0.5">// NO OUTSTANDING APPROVALS OR PAYMENTS</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingActions.map((action) => (
                <div 
                  key={action.id}
                  className="p-4 bg-bg-secondary border border-border-custom rounded-input flex items-center justify-between gap-4 hover:border-accent-primary/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold ${
                        action.badge === "Critical" ? "bg-brand-error/10 text-brand-error border border-brand-error/20" :
                        action.badge === "Urgent" ? "bg-brand-warning/10 text-brand-warning border border-brand-warning/20" :
                        "bg-accent-primary/10 text-accent-primary border border-accent-primary/20"
                      }`}>
                        {action.badge}
                      </span>
                      <h4 className="font-sans text-xs font-bold text-text-primary">{action.title}</h4>
                    </div>
                    <p className="text-xs text-text-secondary">{action.description}</p>
                  </div>

                  <button
                    onClick={() => onActionClick(action.type, action.raw)}
                    className="px-4 py-2 bg-bg-primary hover:bg-accent-primary hover:text-bg-primary text-accent-primary border border-accent-primary/30 font-mono text-[10px] font-bold uppercase rounded-input transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    {action.type === "approve" && (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" />
                        [REVIEW]
                      </>
                    )}
                    {action.type === "pay" && (
                      <>
                        <CreditCard className="h-3.5 w-3.5" />
                        [PAY_NOW]
                      </>
                    )}
                    {action.type === "sign" && (
                      <>
                        <FileSignature className="h-3.5 w-3.5" />
                        [E-SIGN]
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-bg-card border border-border-custom p-6 rounded-card card-glowing-hover">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="h-4 w-4 text-accent-primary" />
            <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">// RECENT INTEGRATION ACTIVITY</span>
          </div>

          <div className="relative border-l border-border-custom/50 ml-2.5 pl-5 space-y-5 py-2">
            {activities.map((act, index) => (
              <div key={index} className="relative">
                {/* Node circle */}
                <div className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-accent-primary border border-bg-card shadow-glow"></div>
                
                <div className="space-y-0.5">
                  <p className="font-sans text-xs text-text-primary font-medium leading-relaxed">
                    {act.text}
                  </p>
                  <span className="font-mono text-[9px] text-text-muted uppercase">
                    {act.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EXECUTIVE FOUNDERS & LEADERSHIP DIRECTORY */}
        <div className="bg-[#0F172A] border border-cyan-500/30 p-6 rounded-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-white">
                BINARY FROSTER // EXECUTIVE LEADERSHIP DIRECTORY
              </h3>
            </div>
            <span className="font-mono text-[9px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
              VERIFIED MANAGEMENT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Shivam Dube */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl flex items-center gap-3.5 transition-all group">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Shivam Dube"
                className="w-12 h-12 rounded-xl object-cover border border-cyan-500/40 group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="space-y-0.5 overflow-hidden">
                <h4 className="font-sans text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                  Shivam Dube
                </h4>
                <p className="font-mono text-[10px] text-cyan-400 font-bold uppercase truncate">
                  Founder & AI Lead
                </p>
                <p className="font-mono text-[9px] text-slate-400 truncate">
                  shivam@binaryfroster.com
                </p>
              </div>
            </div>

            {/* Jawad Khan Hakim */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl flex items-center gap-3.5 transition-all group">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
                alt="Jawad Khan Hakim"
                className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40 group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="space-y-0.5 overflow-hidden">
                <h4 className="font-sans text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                  Jawad Khan Hakim
                </h4>
                <p className="font-mono text-[10px] text-emerald-400 font-bold uppercase truncate">
                  Backend Architect
                </p>
                <p className="font-mono text-[9px] text-slate-400 truncate">
                  jawad@binaryfroster.com
                </p>
              </div>
            </div>

            {/* Digvijay Kadam */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-xl flex items-center gap-3.5 transition-all group">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt="Digvijay Kadam"
                className="w-12 h-12 rounded-xl object-cover border border-purple-500/40 group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="space-y-0.5 overflow-hidden">
                <h4 className="font-sans text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                  Digvijay Kadam
                </h4>
                <p className="font-mono text-[10px] text-purple-400 font-bold uppercase truncate">
                  Product UI/UX Director
                </p>
                <p className="font-mono text-[9px] text-slate-400 truncate">
                  digvijay@binaryfroster.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
