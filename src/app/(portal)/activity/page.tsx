"use client";

import * as React from "react";
import {
  Activity,
  Search,
  Download,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  User,
  Clock,
  Terminal,
  FileSpreadsheet,
} from "lucide-react";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { exportToCSV } from "@/src/lib/export";
import toast from "react-hot-toast";

export default function ActivityPage() {
  const { auditLogs } = usePortalData();
  const [search, setSearch] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("ALL");
  const [resultFilter, setResultFilter] = React.useState("ALL");

  const actionCategories = [
    "ALL",
    "LOGIN_SESSION",
    "EXECUTE_CONTRACT",
    "SETTLE_INVOICE",
    "APPROVE_DELIVERABLE",
    "CREATE_SUPPORT_TICKET",
    "ROTATE_VAULT_CREDENTIAL",
    "DEPLOY_MILESTONE",
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.includes(search));

    const matchesAction =
      actionFilter === "ALL" || log.action.toUpperCase() === actionFilter.toUpperCase();

    const matchesResult =
      resultFilter === "ALL" || log.result.toUpperCase() === resultFilter.toUpperCase();

    return matchesSearch && matchesAction && matchesResult;
  });

  const totalLogs = auditLogs.length;
  const successCount = auditLogs.filter((l) => l.result === "SUCCESS").length;
  const successRate = totalLogs > 0 ? Math.round((successCount / totalLogs) * 100) : 100;
  const uniqueActors = new Set(auditLogs.map((l) => l.actorName)).size;

  const handleExportCSV = () => {
    if (!filteredLogs.length) {
      toast.error("No audit records to export");
      return;
    }
    exportToCSV(
      filteredLogs.map((l) => ({
        ID: l.id,
        Timestamp: l.timestamp,
        Actor: l.actorName,
        Role: l.actorRole,
        Action: l.action,
        Resource: l.resource,
        Result: l.result,
        IPAddress: l.ipAddress || "N/A",
      })),
      "binary_froster_audit_logs"
    );
    toast.success("Audit log report exported as CSV");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-accent-primary animate-pulse" />
          <h1 className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // AUDIT LOGS & REAL-TIME ACTIVITY STREAM
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs font-mono"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            EXPORT CSV
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-bg-card border-border-custom p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-text-muted uppercase">Total Events</span>
            <Terminal className="w-3.5 h-3.5 text-accent-primary" />
          </div>
          <p className="text-xl font-bold font-mono text-white">{totalLogs}</p>
          <span className="text-[10px] text-emerald-400 font-mono">100% Tamper-Evident</span>
        </Card>

        <Card className="bg-bg-card border-border-custom p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-text-muted uppercase">Conformity Rate</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-mono text-emerald-400">{successRate}%</p>
          <span className="text-[10px] text-text-muted font-mono">{successCount} successful events</span>
        </Card>

        <Card className="bg-bg-card border-border-custom p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-text-muted uppercase">Active Actors</span>
            <User className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-xl font-bold font-mono text-white">{uniqueActors}</p>
          <span className="text-[10px] text-text-muted font-mono">Authenticated identities</span>
        </Card>

        <Card className="bg-bg-card border-border-custom p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-text-muted uppercase">Ingress Security</span>
            <Clock className="w-3.5 h-3.5 text-accent-primary" />
          </div>
          <p className="text-xl font-bold font-mono text-white">ACTIVE</p>
          <span className="text-[10px] text-cyan-400 font-mono">IP + SHA-256 Verified</span>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card className="bg-bg-card border-border-custom p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by actor name, action, resource, or IP address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white pl-9 pr-4 py-2 text-xs rounded-input outline-none font-sans"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-bg-secondary border border-border-custom text-white text-xs px-3 py-2 rounded-input outline-none font-mono"
            >
              {actionCategories.map((cat) => (
                <option key={cat} value={cat}>
                  Action: {cat}
                </option>
              ))}
            </select>

            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="bg-bg-secondary border border-border-custom text-white text-xs px-3 py-2 rounded-input outline-none font-mono"
            >
              <option value="ALL">Result: ALL</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILURE">FAILURE</option>
              <option value="DENIED">DENIED</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Activity Table */}
      <Card className="bg-bg-card border-border-custom overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-custom bg-bg-secondary/60 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Token</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Ingress Node</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom/50 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No activity logs match the current query filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-text-muted whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}{" "}
                      <span className="text-[9px] text-text-muted/60">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-[9px] font-mono text-accent-primary">
                          {log.actorName.charAt(0)}
                        </div>
                        <div>
                          <span>{log.actorName}</span>
                          <span className="block text-[9px] text-text-muted font-mono">
                            {log.actorRole}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono bg-bg-secondary px-2 py-0.5 rounded border border-border-custom text-accent-primary">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-secondary font-sans max-w-xs truncate">
                      {log.resource}
                    </td>
                    <td className="py-3 px-4 text-[10px] text-text-muted whitespace-nowrap">
                      {log.ipAddress || "Internal System"}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Badge
                        variant={
                          log.result === "SUCCESS"
                            ? "success"
                            : log.result === "DENIED"
                            ? "error"
                            : "warning"
                        }
                        className="text-[9px]"
                      >
                        {log.result}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
