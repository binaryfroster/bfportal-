"use client";

import * as React from "react";
import { Terminal, Key, Plus, Trash2, Shield, Activity, Copy, Check, Edit, RotateCcw } from "lucide-react";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

export default function ApiKeysPage() {
  const { apiKeys, createApiKey, revokeApiKey, updateApiKey, deleteApiKey, regenerateApiKey } = usePortalData();

  const [keyName, setKeyName] = React.useState("");
  const [showModal, setShowModal] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const [editingKeyId, setEditingKeyId] = React.useState<string | null>(null);
  const [editKeyName, setEditKeyName] = React.useState("");
  const [editRateLimit, setEditRateLimit] = React.useState<number | "">("");

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

  const handleRegenerate = (id: string) => {
    regenerateApiKey(id);
    toast.success("API key prefix regenerated");
  };

  const handleDelete = (id: string) => {
    deleteApiKey(id);
    toast.success("API key deleted");
  };

  const openEditModal = (key: any) => {
    setEditingKeyId(key.id);
    setEditKeyName(key.keyName);
    setEditRateLimit(key.rateLimitPerMin);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKeyId || !editKeyName) return;

    updateApiKey(editingKeyId, {
      keyName: editKeyName,
      rateLimitPerMin: Number(editRateLimit) || 60,
    });
    setEditingKeyId(null);
    toast.success("API Key updated successfully");
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
                  className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
                >
                  {copiedId === key.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedId === key.id ? "COPIED!" : "COPY"}
                </button>
                {key.status === "active" ? (
                  <>
                    <button
                      onClick={() => openEditModal(key)}
                      className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
                    >
                      <Edit className="h-3 w-3" />
                      EDIT
                    </button>
                    <button
                      onClick={() => handleRegenerate(key.id)}
                      className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30"
                    >
                      <RotateCcw className="h-3 w-3" />
                      REGENERATE
                    </button>
                    <button
                      onClick={() => handleRevoke(key.id)}
                      className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30"
                    >
                      REVOKE
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleDelete(key.id)}
                    className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30"
                  >
                    <Trash2 className="h-3 w-3" />
                    DELETE
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Generate Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-bg-card border border-border-custom rounded-card p-6 shadow-glow space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-accent-primary font-bold">
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
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
                >
                  [CANCEL]
                </button>
                <button
                  type="submit"
                  className="bg-brand-success/10 hover:bg-brand-success/25 text-brand-success border border-brand-success/30 font-mono text-xs uppercase font-bold rounded-input shadow-glow px-4 py-2 cursor-pointer flex items-center gap-1"
                >
                  GENERATE KEY
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editingKeyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-bg-card border border-border-custom rounded-card p-6 shadow-glow space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-accent-primary font-bold">
              // EDIT API KEY
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[9px] text-text-muted uppercase mb-1">Key Name / Usage Label</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Production Webhook Integration Key..."
                  value={editKeyName}
                  onChange={(e) => setEditKeyName(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>
              <div>
                <label className="block text-[9px] text-text-muted uppercase mb-1">Rate Limit (req/min)</label>
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="e.g. 60"
                  value={editRateLimit}
                  onChange={(e) => setEditRateLimit(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingKeyId(null)}
                  className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
                >
                  [CANCEL]
                </button>
                <button
                  type="submit"
                  className="bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs uppercase font-bold rounded-input shadow-glow px-4 py-2 cursor-pointer"
                >
                  SAVE CHANGES
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

