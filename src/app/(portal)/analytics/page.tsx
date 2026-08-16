"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, DollarSign, Clock, Award, ShieldCheck, Download, RefreshCw, Calendar } from "lucide-react";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

export default function AnalyticsPage() {
  const { project, milestones, tasks, invoices } = usePortalData();
  const router = useRouter();
  const [dateRange, setDateRange] = React.useState("Last 30 Days");

  const handleExport = (format: string) => {
    toast.success(`Executive Analytics exported as ${format}`);
  };

  const handleRefresh = () => {
    toast.success("Metrics recalculated from latest data");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // EXECUTIVE ANALYTICS & VELOCITY TELEMETRY
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport("CSV")}
            className="px-3 py-1.5 bg-bg-secondary border border-border-custom text-white font-mono text-[10px] uppercase rounded-input hover:border-accent-primary transition-colors cursor-pointer"
          >
            [EXPORT_CSV]
          </button>
          <Button onClick={() => handleExport("PDF")} variant="accent" size="sm" className="font-mono text-[10px] uppercase font-bold cursor-pointer">
            <Download className="h-3.5 w-3.5 mr-1" />
            [EXPORT_PDF]
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {["Last 7 Days", "Last 30 Days", "This Sprint", "All Time"].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                dateRange === range
                  ? "bg-accent-primary/10 text-accent-primary border border-accent-primary/30"
                  : "bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
              }`}
            >
              <Calendar className="h-3 w-3" />
              {range}
            </button>
          ))}
        </div>
        <button
          onClick={handleRefresh}
          className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-brand-success/10 hover:bg-brand-success/25 text-brand-success border border-brand-success/30"
        >
          <RefreshCw className="h-3 w-3" />
          [REFRESH_TELEMETRY]
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <Card className="bg-bg-card border-border-custom p-5 space-y-2">
          <span className="text-[9px] text-text-muted uppercase block">// PROJECT VELOCITY</span>
          <p className="text-2xl font-bold text-white">94.8%</p>
          <span className="text-[10px] text-brand-success flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +12.4% vs last sprint
          </span>
        </Card>

        <Card 
          onClick={() => router.push("/billing")}
          className="bg-bg-card border-border-custom p-5 space-y-2 cursor-pointer hover:border-accent-primary/50 transition-colors"
        >
          <span className="text-[9px] text-text-muted uppercase block">// BUDGET UTILIZATION</span>
          <p className="text-2xl font-bold text-white">$70,000</p>
          <span className="text-[10px] text-text-muted">Cap: $100,000 Total</span>
        </Card>

        <Card 
          onClick={() => router.push("/tickets")}
          className="bg-bg-card border-border-custom p-5 space-y-2 cursor-pointer hover:border-accent-primary/50 transition-colors"
        >
          <span className="text-[9px] text-text-muted uppercase block">// AVG SLA RESOLUTION</span>
          <p className="text-2xl font-bold text-white">1.4 Hours</p>
          <span className="text-[10px] text-brand-success">100% within SLA Target</span>
        </Card>

        <Card 
          onClick={() => router.push("/feedback")}
          className="bg-bg-card border-border-custom p-5 space-y-2 cursor-pointer hover:border-accent-primary/50 transition-colors"
        >
          <span className="text-[9px] text-text-muted uppercase block">// CLIENT CSAT SCORE</span>
          <p className="text-2xl font-bold text-amber-400">4.9 / 5.0 ⭐</p>
          <span className="text-[10px] text-brand-success">NPS: +92 (Promoter)</span>
        </Card>
      </div>

      {/* Analytics Visual Chart Placeholder */}
      <Card className="bg-bg-card border-border-custom p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-border-custom/50">
          <span className="font-mono text-[10px] text-text-muted uppercase">// MILESTONE COMPLETION BURNDOWN CHART</span>
          <Badge variant="cyan" className="font-mono text-[8px]">
            ACTIVE PHASE: BUILD
          </Badge>
        </div>

        <div className="h-64 bg-bg-secondary/40 border border-border-custom/50 rounded-input p-4 flex flex-col justify-between font-mono text-[10px] text-text-muted">
          <div className="flex justify-between border-b border-border-custom/30 pb-2">
            <span>Discover: Architecture</span>
            <span className="text-brand-success font-bold">100% Completed</span>
          </div>
          <div className="flex justify-between border-b border-border-custom/30 pb-2">
            <span>Design: Prototypes</span>
            <span className="text-brand-success font-bold">100% Completed</span>
          </div>
          <div className="flex justify-between border-b border-border-custom/30 pb-2">
            <span>Build: Core Ledger Engine</span>
            <span className="text-accent-primary font-bold">68% In Progress</span>
          </div>
          <div className="flex justify-between border-b border-border-custom/30 pb-2">
            <span>Test: PenTest & Load Test</span>
            <span className="text-text-muted">Upcoming</span>
          </div>
          <div className="flex justify-between">
            <span>Launch: Production Cutover</span>
            <span className="text-text-muted">Upcoming</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
