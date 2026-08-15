"use client";

import * as React from "react";
import { Terminal, Key, Plus, Trash2, Shield, Activity, Copy, Check } from "lucide-react";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

export default function ApiKeysPage() {
  const { apiKeys, createApiKey, revokeApiKey } = usePortalData();

  const [keyName, setKeyName] = React.useState("");
  const [showModal, setShowModal] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;

    createApiKey(keyName);
    setKeyName("");
    setShowModal(false);
    toast.success("New production API key generated");
  };

  const handleRevoke = (id: string) => {
    revokeApiKey(id);
    toast.error("API Key revoked");
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("API key prefix copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <Terminal className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // DEVELOPER API KEYS & WEBHOOK MANAGEMENT
          </span>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          variant="accent"
          className="font-mono text-xs uppercase font-bold cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          GENERATE API KEY
        </Button>
      </div>

      {/* API Keys Table */}
      <Card className="bg-bg-card border-border-custom p-6 space-y-4">
        <span className="block font-mono text-[9px] text-text-muted uppercase">// ACTIVE ORGANIZATION API KEYS</span>

        <div className="space-y-3 font-mono text-xs">
          {apiKeys.map((key) => (
            <div key={key.id} className="p-4 bg-bg-secondary/40 border border-border-custom/50 rounded-input flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-accent-primary" />
                  <span className="text-white font-bold">{key.keyName}</span>
                  <Badge variant={key.status === "active" ? "success" : "error"} className="font-mono text-[8px]">
                    {key.status}
                  </Badge>
                </div>
                <span className="text-text-muted text-[10px]">Prefix: {key.keyPrefix} • Rate limit: {key.rateLimitPerMin} req/min</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(key.id, key.keyPrefix)}
                  className="px-3 py-1.5 bg-bg-secondary border border-border-custom text-text-secondary hover:text-white font-mono text-[10px] rounded cursor-pointer"
                >
                  {copiedId === key.id ? "COPIED!" : "[COPY_PREFIX]"}
                </button>
                {key.status === "active" && (
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className="px-3 py-1.5 bg-brand-error/10 border border-brand-error/30 text-brand-error font-mono text-[10px] rounded cursor-pointer"
                  >
                    [REVOKE]
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <Card className="w-full max-w-lg bg-bg-card border-border-custom p-6 space-y-4">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              // GENERATE NEW API KEY
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[9px] text-text-muted uppercase mb-1">Key Name / Usage Label</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Production Webhook Integration Key..."
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-bg-secondary text-text-muted hover:text-white font-mono text-xs rounded-input cursor-pointer"
                >
                  [CANCEL]
                </button>
                <Button type="submit" variant="accent" className="font-mono text-xs font-bold uppercase cursor-pointer">
                  GENERATE KEY
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
