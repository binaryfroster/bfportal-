"use client";

import * as React from "react";
import { Sparkles, Building2, User, Phone, Mail, Globe, Shield, Activity, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

export default function Client360Page() {
  const { user } = useUser();
  const { project, milestones, invoices, tickets, maintenancePlan } = usePortalData();

  const healthScore = 96;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // CLIENT 360° RELATIONSHIP MATRIX
          </span>
        </div>
        <Badge variant="cyan" className="font-mono text-[9px]">
          ORGANIZATION: {user?.companyName || "Sterling Capital Group"}
        </Badge>
      </div>

      {/* Top Grid: Health Score & Org Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Gauge */}
        <Card className="bg-bg-card border-border-custom p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="block font-mono text-[9px] text-text-muted uppercase">
              // CLIENT HEALTH SCORE INDICATOR
            </span>
            <h3 className="font-sans text-lg font-bold text-white">Relationship Health Index</h3>
          </div>

          <div className="my-6 flex items-center justify-center">
            <div className="relative w-36 h-36 rounded-full border-4 border-accent-primary/20 flex flex-col items-center justify-center shadow-glow">
              <span className="font-mono text-4xl font-extrabold text-white">{healthScore}</span>
              <span className="font-mono text-[9px] text-accent-primary uppercase tracking-widest mt-1">
                / 100 HEALTHY
              </span>
            </div>
          </div>

          <div className="p-3 bg-brand-success/10 border border-brand-success/20 rounded-input font-mono text-[10px] text-brand-success leading-relaxed">
            [OPTIMAL] Milestones completed on schedule. No overdue invoices. SLA response targets 100% met.
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
                  {user?.companyName || "Sterling Capital Group"}
                </h3>
                <p className="font-mono text-[10px] text-text-muted uppercase">
                  FINANCIAL SERVICES & ALGORITHMIC TRADING
                </p>
              </div>
            </div>
            <Badge variant="success" className="font-mono text-[9px]">
              TIER 1 ENTERPRISE CLIENT
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-text-secondary">
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input space-y-1">
              <span className="text-[9px] text-text-muted uppercase block">// PRIMARY CONTACT OFFICER</span>
              <p className="text-white font-semibold flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-accent-primary" /> {user?.name || "John Sterling"}
              </p>
            </div>
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input space-y-1">
              <span className="text-[9px] text-text-muted uppercase block">// OFFICIAL EMAIL NODE</span>
              <p className="text-white font-semibold flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-accent-primary" /> {user?.email || "john@sterling.com"}
              </p>
            </div>
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input space-y-1">
              <span className="text-[9px] text-text-muted uppercase block">// TELEPHONE CONTACT</span>
              <p className="text-white font-semibold flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-accent-primary" /> {user?.phone || "+44 20 7946 0192"}
              </p>
            </div>
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input space-y-1">
              <span className="text-[9px] text-text-muted uppercase block">// DESIGNATED ACCOUNT MANAGER</span>
              <p className="text-white font-semibold flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-accent-primary" /> Shivam Dube (Founder & AI Lead)
              </p>
            </div>
          </div>
        </Card>
      </div>

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
            <span className="text-brand-success font-bold">Uptime: 99.95%</span>
          </div>
        </Card>

        <Card className="bg-bg-card border-border-custom p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] text-text-muted uppercase">// FINANCES OVERVIEW</span>
            <FileText className="h-4 w-4 text-accent-primary" />
          </div>
          <p className="font-sans text-sm font-bold text-white">$70,000 Total Billed</p>
          <div className="flex justify-between font-mono text-[10px]">
            <span className="text-text-muted">Paid: $35,000</span>
            <span className="text-amber-400 font-bold">Pending: $35,000</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
