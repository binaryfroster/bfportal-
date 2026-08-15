"use client";

import * as React from "react";
import { Activity, Shield, Clock, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

export default function MaintenancePage() {
  const { maintenancePlan } = usePortalData();

  const handleRenew = () => {
    toast.success("SLA Renewal Requisition dispatched to account team");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // ENTERPRISE MAINTENANCE & SLA CARE CENTER
          </span>
        </div>

        <Button onClick={handleRenew} variant="accent" className="font-mono text-xs uppercase font-bold cursor-pointer">
          <RefreshCw className="h-4 w-4 mr-1.5" />
          REQUEST PLAN RENEWAL
        </Button>
      </div>

      {/* SLA Plan Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-bg-card border-border-custom p-6 space-y-4 md:col-span-2">
          <div className="flex justify-between items-center pb-3 border-b border-border-custom/50">
            <div>
              <span className="block font-mono text-[9px] text-text-muted uppercase">// ACTIVE SLA COVERAGE PLAN</span>
              <h3 className="font-sans text-lg font-bold text-white">
                {maintenancePlan?.planName || "Enterprise Platinum SLA Care"}
              </h3>
            </div>
            <Badge variant="success" className="font-mono text-[9px]">
              STATUS: ACTIVE
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input">
              <span className="text-[9px] text-text-muted uppercase block">// RESPONSE SLA</span>
              <span className="text-accent-primary font-bold">&lt; {maintenancePlan?.slaResponseHours || 1} Hour</span>
            </div>
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input">
              <span className="text-[9px] text-text-muted uppercase block">// RESOLUTION SLA</span>
              <span className="text-white font-bold">&lt; {maintenancePlan?.slaResolutionHours || 8} Hours</span>
            </div>
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input">
              <span className="text-[9px] text-text-muted uppercase block">// UPTIME GUARANTEE</span>
              <span className="text-brand-success font-bold">{maintenancePlan?.uptimeGuarantee || 99.95}%</span>
            </div>
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input">
              <span className="text-[9px] text-text-muted uppercase block">// EXPIRY DATE</span>
              <span className="text-white font-bold">{maintenancePlan?.expiryDate || "2026-12-31"}</span>
            </div>
          </div>
        </Card>

        {/* Support Hours Usage Meter */}
        <Card className="bg-bg-card border-border-custom p-6 space-y-4">
          <span className="block font-mono text-[9px] text-text-muted uppercase">// MONTHLY SUPPORT HOURS USAGE</span>
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-text-muted">Utilized</span>
              <span className="text-white font-bold">
                {maintenancePlan?.usedSupportHours || 18} / {maintenancePlan?.monthlySupportHours || 50} Hours
              </span>
            </div>
            <div className="w-full h-3 bg-bg-secondary rounded-full overflow-hidden border border-border-custom">
              <div
                className="h-full bg-accent-primary rounded-full transition-all duration-500"
                style={{
                  width: `${((maintenancePlan?.usedSupportHours || 18) / (maintenancePlan?.monthlySupportHours || 50)) * 100}%`,
                }}
              />
            </div>
          </div>
          <p className="font-mono text-[10px] text-text-muted leading-relaxed">
            Support hours reset on the 1st of every month. Unused hours roll over up to 20 hours.
          </p>
        </Card>
      </div>

      {/* Incident & Maintenance History */}
      <Card className="bg-bg-card border-border-custom p-6 space-y-4">
        <span className="block font-mono text-[9px] text-text-muted uppercase">// INCIDENT & MAINTENANCE HISTORY LOGS</span>
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3.5 bg-bg-secondary/40 border border-border-custom/50 rounded-input flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-brand-success" />
              <div>
                <p className="text-white font-bold">Scheduled Security Patch & DB Vacuum</p>
                <p className="text-[9px] text-text-muted">Executed on 2026-06-28T02:00:00Z • Zero Downtime</p>
              </div>
            </div>
            <Badge variant="cyan" className="font-mono text-[8px]">
              MAINTENANCE
            </Badge>
          </div>

          <div className="p-3.5 bg-bg-secondary/40 border border-border-custom/50 rounded-input flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-brand-success" />
              <div>
                <p className="text-white font-bold">Staging Ledger Buffer Allocation Adjustment</p>
                <p className="text-[9px] text-text-muted">Executed on 2026-06-15T14:30:00Z • Resolved in 35 mins (SLA Met)</p>
              </div>
            </div>
            <Badge variant="cyan" className="font-mono text-[8px]">
              INCIDENT RESOLVED
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
