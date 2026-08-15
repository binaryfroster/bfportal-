"use client";

import * as React from "react";
import { Plug, CheckCircle2, XCircle, RefreshCw, Lock } from "lucide-react";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

export default function IntegrationsPage() {
  const { integrations, toggleIntegration } = usePortalData();

  const handleToggle = (id: string, name: string, currentStatus: string) => {
    toggleIntegration(id);
    toast.success(
      currentStatus === "Connected"
        ? `${name} disconnected`
        : `${name} OAuth connection authorized!`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <Plug className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // ENTERPRISE INTEGRATIONS & OAUTH HUBS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => {
          const isConnected = item.status === "Connected";

          return (
            <Card key={item.id} className="bg-bg-card border-border-custom p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Badge variant={isConnected ? "success" : "error"} className="font-mono text-[8px]">
                    {item.status}
                  </Badge>
                  <span className="font-mono text-[9px] text-text-muted">{item.category}</span>
                </div>

                <h4 className="font-sans text-base font-bold text-white">{item.name}</h4>
                <p className="font-mono text-[10px] text-text-muted">
                  {isConnected ? `Last synced: ${item.lastSyncAt}` : "Integration standing job offline."}
                </p>
              </div>

              <Button
                onClick={() => handleToggle(item.id, item.name, item.status)}
                variant={isConnected ? "secondary" : "accent"}
                size="sm"
                className="w-full font-mono text-[10px] uppercase font-bold cursor-pointer"
              >
                {isConnected ? "[DISCONNECT]" : "[CONNECT_OAUTH]"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
