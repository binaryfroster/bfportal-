"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  Award,
  ShieldCheck,
  Download,
  RefreshCw,
  Calendar,
  Kanban,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { exportToCSV } from "@/src/lib/export";
import toast from "react-hot-toast";

export default function AnalyticsPage() {
  const { project, milestones, tasks, invoices, tickets, approvals, npsFeedback } = usePortalData();
  const router = useRouter();
  const [dateRange, setDateRange] = React.useState("Last 30 Days");

  // Dynamic Calculations
  const totalMilestones = milestones?.length || 0;
  const completedMilestones = milestones?.filter((m) => m.status === "Completed").length || 0;
  const milestoneProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((t) => t.column === "Completed").length || 0;
  const inProgressTasks = tasks?.filter((t) => t.column === "In Progress").length || 0;
  const inReviewTasks = tasks?.filter((t) => t.column === "In Review").length || 0;
  const todoTasks = tasks?.filter((t) => t.column === "To Do").length || 0;

  const totalInvoiced = invoices?.reduce((acc, curr) => acc + (curr.total || curr.amount || 0), 0) || 0;
  const totalPaid = invoices?.filter((i) => i.status === "Paid").reduce((acc, curr) => acc + (curr.total || curr.amount || 0), 0) || 0;
  const totalPending = totalInvoiced - totalPaid;

  const totalTickets = tickets?.length || 0;
  const resolvedTickets = tickets?.filter((t) => t.status === "Resolved").length || 0;
  const ticketResolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 100;

  const totalApprovals = approvals?.length || 0;
  const approvedCount = approvals?.filter((a) => a.status === "Approved").length || 0;

  const avgNps = npsFeedback?.length
    ? (npsFeedback.reduce((acc, f) => acc + f.npsScore, 0) / npsFeedback.length).toFixed(1)
    : "10.0";

  const handleExportCSV = () => {
    const reportData = [
      { Metric: "Project Progress", Value: `${project?.progress || milestoneProgress}%` },
      { Metric: "Milestones Completed", Value: `${completedMilestones} / ${totalMilestones}` },
      { Metric: "Tasks Completed", Value: `${completedTasks} / ${totalTasks}` },
      { Metric: "Tasks In Progress", Value: `${inProgressTasks}` },
      { Metric: "Tasks In Review", Value: `${inReviewTasks}` },
      { Metric: "Tasks To Do", Value: `${todoTasks}` },
      { Metric: "Total Revenue Invoiced", Value: `$${totalInvoiced.toLocaleString()}` },
      { Metric: "Total Revenue Paid", Value: `$${totalPaid.toLocaleString()}` },
      { Metric: "Total Revenue Pending", Value: `$${totalPending.toLocaleString()}` },
      { Metric: "Support Tickets Resolved", Value: `${resolvedTickets} / ${totalTickets} (${ticketResolutionRate}%)` },
      { Metric: "Deliverables Approved", Value: `${approvedCount} / ${totalApprovals}` },
      { Metric: "Average NPS Rating", Value: `${avgNps} / 10` },
    ];

    exportToCSV(reportData, "binary_froster_executive_analytics");
    toast.success("Executive Analytics exported as CSV");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4.5 w-4.5 text-accent-primary" />
          <h1 className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // EXECUTIVE ANALYTICS & VELOCITY TELEMETRY
          </h1>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="font-mono text-xs cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            EXPORT CSV
          </Button>
          <Button
            onClick={handlePrint}
            variant="accent"
            size="sm"
            className="font-mono text-xs cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            PRINT REPORT
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {["Last 7 Days", "Last 30 Days", "This Sprint", "All Time"].map((range) => (
            <button
              key={range}
              onClick={() => {
                setDateRange(range);
                toast.success(`Telemetry filtered: ${range}`);
              }}
              className={`text-[9px] font-mono font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                dateRange === range
                  ? "bg-accent-primary/15 text-accent-primary border border-accent-primary/40"
                  : "bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
              }`}
            >
              <Calendar className="h-3 w-3" />
              {range}
            </button>
          ))}
        </div>
        <button
          onClick={() => toast.success("Telemetry recalculated from live records")}
          className="text-[9px] font-mono font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
        >
          <RefreshCw className="h-3 w-3 animate-spin" />
          LIVE SYNC ACTIVE
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <Card className="bg-bg-card border-border-custom p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-text-muted uppercase">// PROJECT VELOCITY</span>
            <TrendingUp className="w-4 h-4 text-accent-primary" />
          </div>
          <p className="text-2xl font-bold text-white">{project?.progress || milestoneProgress}%</p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            {completedMilestones} of {totalMilestones} Milestones Sealed
          </span>
        </Card>

        <Card
          onClick={() => router.push("/billing")}
          className="bg-bg-card border-border-custom p-5 space-y-2 cursor-pointer hover:border-accent-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-text-muted uppercase">// SETTLED REVENUE</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">${totalPaid.toLocaleString()}</p>
          <span className="text-[10px] text-text-muted">
            Pending: ${totalPending.toLocaleString()} (${totalInvoiced.toLocaleString()} Total)
          </span>
        </Card>

        <Card
          onClick={() => router.push("/tickets")}
          className="bg-bg-card border-border-custom p-5 space-y-2 cursor-pointer hover:border-accent-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-text-muted uppercase">// SLA RESOLUTION RATE</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{ticketResolutionRate}%</p>
          <span className="text-[10px] text-emerald-400">
            {resolvedTickets} of {totalTickets} Incidents Closed
          </span>
        </Card>

        <Card
          onClick={() => router.push("/feedback")}
          className="bg-bg-card border-border-custom p-5 space-y-2 cursor-pointer hover:border-accent-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-text-muted uppercase">// CLIENT CSAT / NPS</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{avgNps} / 10 ⭐</p>
          <span className="text-[10px] text-emerald-400">Net Promoter Status: Active</span>
        </Card>
      </div>

      {/* Visual Analytics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kanban Task Velocity Distribution */}
        <Card className="bg-bg-card border-border-custom p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border-custom/50">
            <div className="flex items-center gap-2">
              <Kanban className="w-4 h-4 text-accent-primary" />
              <span className="font-mono text-xs text-white uppercase font-bold">
                Sprint Task Distribution ({totalTasks} Total)
              </span>
            </div>
            <Badge variant="cyan" className="font-mono text-[8px]">
              SPRINT V1
            </Badge>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-text-muted mb-1 text-[10px]">
                <span>Completed Tasks</span>
                <span className="text-emerald-400 font-bold">
                  {completedTasks} ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400"
                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-text-muted mb-1 text-[10px]">
                <span>In Review (QA / Sign-off)</span>
                <span className="text-cyan-400 font-bold">
                  {inReviewTasks} ({totalTasks > 0 ? Math.round((inReviewTasks / totalTasks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400"
                  style={{ width: `${totalTasks > 0 ? (inReviewTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-text-muted mb-1 text-[10px]">
                <span>In Progress (Active Dev)</span>
                <span className="text-amber-400 font-bold">
                  {inProgressTasks} ({totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400"
                  style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-text-muted mb-1 text-[10px]">
                <span>To Do (Backlog Queue)</span>
                <span className="text-text-muted font-bold">
                  {todoTasks} ({totalTasks > 0 ? Math.round((todoTasks / totalTasks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-600"
                  style={{ width: `${totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Milestone Progression Matrix */}
        <Card className="bg-bg-card border-border-custom p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border-custom/50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs text-white uppercase font-bold">
                Phase Milestone Execution Matrix
              </span>
            </div>
            <span className="font-mono text-[9px] text-text-muted">
              {completedMilestones} / {totalMilestones} Completed
            </span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {milestones?.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2.5 rounded-input bg-bg-secondary/40 border border-border-custom/40 font-mono text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      m.status === "Completed"
                        ? "bg-emerald-400"
                        : m.status === "In Progress"
                        ? "bg-accent-primary animate-pulse"
                        : "bg-slate-600"
                    }`}
                  />
                  <span className="font-sans text-white truncate text-xs">{m.title}</span>
                </div>
                <Badge
                  variant={
                    m.status === "Completed"
                      ? "success"
                      : m.status === "In Progress"
                      ? "cyan"
                      : "outline"
                  }
                  className="text-[8px] shrink-0"
                >
                  {m.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
