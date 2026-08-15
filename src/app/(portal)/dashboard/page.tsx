"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CheckCircle,
  ChevronRight,
  Activity,
  AlertCircle,
  MessageSquare,
  PhoneCall,
  HelpCircle,
  DownloadCloud,
  FileSignature,
  CreditCard,
} from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { CircularProgress } from "@/src/components/ui/progress";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import toast from "react-hot-toast";

// Seed local/session database keys or use static fallbacks
interface ProjectInfo {
  id: string;
  name: string;
  phase: string;
  progress: number;
  upcomingMilestoneName: string;
  upcomingMilestoneDate: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const { loading: dataLoading, project, approvals, invoices, contracts } = usePortalData();

  // Compute pending actions dynamically from centralized state
  const pendingActions = React.useMemo(() => {
    const actions: Array<{
      id: string;
      type: "approve" | "pay" | "sign";
      title: string;
      description: string;
      badge: string;
      link: string;
    }> = [];

    if (!user) return actions;

    // 1. Approvals (Pending)
    approvals
      .filter((a) => a.status === "Pending")
      .forEach((a) => {
        actions.push({
          id: a.id,
          type: "approve" as const,
          title: `Approve ${a.name}`,
          description: a.description,
          badge: "Critical",
          link: "/approvals",
        });
      });

    // 2. Invoices (Sent/Overdue)
    invoices
      .filter((i) => i.status === "Sent" || i.status === "Overdue")
      .forEach((i) => {
        actions.push({
          id: i.id,
          type: "pay" as const,
          title: i.description || `Pay Invoice ${i.invoiceNumber}`,
          description: `Razorpay (@shivamsurajdube) payment for ${i.invoiceNumber} is ${i.status.toLowerCase()}.`,
          badge: i.status === "Overdue" ? "High Priority" : "Action Needed",
          link: "/billing",
        });
      });

    // 3. Contracts (Pending Signature)
    contracts
      .filter((c) => c.status === "Pending Signature")
      .forEach((c) => {
        actions.push({
          id: c.id,
          type: "sign" as const,
          title: c.name,
          description: c.description,
          badge: "Urgent",
          link: "/contracts",
        });
      });

    return actions;
  }, [user, approvals, invoices, contracts]);

  const handleActionClick = (type: string, link: string) => {
    toast.success(`Redirecting to: ${type.toUpperCase()}`);
    router.push(link);
  };

  const activities = [
    { text: "Shivam Dube committed core trading matching API architecture", time: "2 hours ago" },
    { text: "Invoice BF-2026-002 was marked as Paid in full via Stripe Webhook", time: "1 day ago" },
    { text: "Digvijay Kadam uploaded updated Figma interface specifications v2", time: "3 days ago" },
    { text: "Contract 'Master NDA between SCG & Binary Froster' signed successfully", time: "April 11, 2026" },
  ];

  if (dataLoading || !project) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 font-mono" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-64 rounded-card border border-border-custom bg-bg-card" />
          <Skeleton className="h-64 rounded-card border border-border-custom bg-bg-card" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-card border border-border-custom bg-bg-card" />
          <Skeleton className="h-80 rounded-card border border-border-custom bg-bg-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-white">
            Welcome Back, <span className="text-accent-primary">{user?.name}</span>
          </h1>
          <p className="font-mono text-xs text-text-secondary uppercase tracking-wider mt-1">
            // ACTIVE ENVIRONMENT PATH: {project.name}
          </p>
        </div>

        {/* Real-time sync badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-accent-primary/5 border border-accent-primary/20 rounded-full shrink-0">
          <span className="h-2 w-2 rounded-full bg-accent-primary animate-ping" />
          <span className="font-mono text-[9px] text-accent-primary uppercase tracking-wider">
            Supabase Realtime Sync: Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1 & 2: Project status card */}
        <Card className="lg:col-span-2 relative overflow-hidden bg-bg-card border-border-custom">
          <div className="absolute top-0 right-0 h-32 w-32 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />

          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <LayoutDashboard className="h-4 w-4 text-accent-primary mr-2" />
            <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
              // ACTIVE DEPLOYMENT STATE
            </span>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* Left circular progress */}
              <div className="flex flex-col items-center text-center p-2 sm:border-r border-border-custom/50">
                <CircularProgress value={project.progress} size={120} strokeWidth={8} />
                <p className="font-sans text-xs text-text-secondary font-medium mt-3">
                  Current Phase:{" "}
                  <span className="text-accent-primary font-bold">{project.phase}</span>
                </p>
              </div>

              {/* Right stats and milestone info */}
              <div className="sm:col-span-2 space-y-4 sm:pl-4">
                <div>
                  <span className="block font-mono text-[10px] text-text-muted uppercase">
                    // Active project
                  </span>
                  <h3 className="font-sans text-lg font-bold text-white mt-1">
                    {project.name}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-custom/40">
                  <div>
                    <span className="block font-mono text-[9px] text-text-muted uppercase tracking-widest">
                      Next Milestone
                    </span>
                    <span className="block font-sans text-xs font-semibold text-white mt-0.5 truncate">
                      {project.upcomingMilestoneName}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[9px] text-text-muted uppercase tracking-widest">
                      Release Date
                    </span>
                    <span className="block font-sans text-xs font-semibold text-accent-primary mt-0.5">
                      {project.upcomingMilestoneDate}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/project")}
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-accent-primary hover:text-white transition-colors pt-2 cursor-pointer group"
                >
                  [TRACK_COMPLETE_LIFECYCLE]
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* COLUMN 3: Quick action panel */}
        <Card className="relative overflow-hidden bg-bg-card border-border-custom">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Activity className="h-4 w-4 text-accent-primary mr-2" />
            <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
              // COMMAND TERMINAL
            </span>
          </CardHeader>
          <CardContent className="pt-2 space-y-3">
            <p className="text-xs text-text-secondary leading-relaxed">
              Execute direct operations on your active environment using the secure Binary Froster tunnel.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => router.push("/messages")}
                className="w-full py-3 bg-bg-secondary border border-border-custom hover:border-accent-primary/60 hover:bg-bg-primary text-white font-mono text-xs text-left px-4 rounded-input flex items-center justify-between transition-all group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-accent-primary group-hover:animate-bounce" />
                  // START_NEW_MESSAGE
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
              </button>

              <button
                onClick={() => router.push("/meetings")}
                className="w-full py-3 bg-bg-secondary border border-border-custom hover:border-accent-primary/60 hover:bg-bg-primary text-white font-mono text-xs text-left px-4 rounded-input flex items-center justify-between transition-all group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-accent-primary group-hover:animate-pulse" />
                  // BOOK_PROJECT_CALL
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
              </button>

              <button
                onClick={() => router.push("/tickets")}
                className="w-full py-3 bg-bg-secondary border border-border-custom hover:border-accent-primary/60 hover:bg-bg-primary text-white font-mono text-xs text-left px-4 rounded-input flex items-center justify-between transition-all group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-accent-primary" />
                  // RAISE_SUPPORT_TICKET
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
              </button>

              <button
                onClick={() => router.push("/billing")}
                className="w-full py-3 bg-bg-secondary border border-border-custom hover:border-accent-primary/60 hover:bg-bg-primary text-white font-mono text-xs text-left px-4 rounded-input flex items-center justify-between transition-all group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <DownloadCloud className="h-4 w-4 text-accent-primary" />
                  // EXPORT_LATEST_INVOICE
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions widgets */}
        <Card className="bg-bg-card border-border-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-accent-primary mr-2" />
              <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
                // ACTIONS REQUIRED
              </span>
            </div>
            {pendingActions.length > 0 && (
              <Badge variant="error" className="font-mono">
                {pendingActions.length} ACTIONABLE
              </Badge>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            {pendingActions.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border-custom rounded-input bg-bg-secondary/40">
                <CheckCircle className="h-8 w-8 text-brand-success mx-auto mb-3" />
                <p className="font-sans text-xs text-white font-medium">All systems green.</p>
                <p className="font-mono text-[9px] text-text-muted uppercase mt-0.5">
                  // NO OUTSTANDING APPROVALS OR PAYMENTS
                </p>
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
                        <span
                          className={`font-mono text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold ${
                            action.badge === "Critical"
                              ? "bg-brand-error/10 text-brand-error border border-brand-error/20"
                              : action.badge === "Urgent"
                              ? "bg-brand-warning/10 text-brand-warning border border-brand-warning/20"
                              : "bg-accent-primary/10 text-accent-primary border border-accent-primary/20"
                          }`}
                        >
                          {action.badge}
                        </span>
                        <h4 className="font-sans text-xs font-bold text-white">{action.title}</h4>
                      </div>
                      <p className="text-xs text-text-secondary">{action.description}</p>
                    </div>

                    <button
                      onClick={() => handleActionClick(action.type, action.link)}
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
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="bg-bg-card border-border-custom">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Activity className="h-4 w-4 text-accent-primary mr-2" />
            <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
              // RECENT INTEGRATION ACTIVITY
            </span>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="relative border-l border-border-custom ml-2.5 pl-5 space-y-5 py-2">
              {activities.map((act, index) => (
                <div key={index} className="relative">
                  {/* Node circle */}
                  <div className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-accent-primary border border-bg-card shadow-glow" />

                  <div className="space-y-0.5">
                    <p className="font-sans text-xs text-white font-medium leading-relaxed">
                      {act.text}
                    </p>
                    <span className="font-mono text-[9px] text-text-muted uppercase">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
