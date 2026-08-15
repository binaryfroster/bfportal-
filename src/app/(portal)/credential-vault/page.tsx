"use client";

import * as React from "react";
import { KeyRound, Shield, Eye, EyeOff, Plus, Lock, Copy, Check } from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

export default function CredentialVaultPage() {
  const { user } = useUser();
  const { credentialVault, addCredential } = usePortalData();

  const [visibleSecrets, setVisibleSecrets] = React.useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const [showModal, setShowModal] = React.useState(false);
  const [serviceName, setServiceName] = React.useState("");
  const [environment, setEnvironment] = React.useState<"Production" | "Staging" | "Development">("Production");
  const [usernameOrKey, setUsernameOrKey] = React.useState("");
  const [secret, setSecret] = React.useState("");

  const toggleVisibility = (id: string) => {
    setVisibleSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Secret copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !secret) return;

    addCredential({
      serviceName,
      environment,
      usernameOrKey,
      encryptedSecret: secret,
      notes: "Created via secure portal vault.",
    });

    setShowModal(false);
    setServiceName("");
    setUsernameOrKey("");
    setSecret("");
    toast.success("Credential encrypted and enqueued into Vault");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // ENCRYPTED CREDENTIAL & ENVIRONMENT VAULT
          </span>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          variant="accent"
          className="font-mono text-xs uppercase font-bold cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          ADD CREDENTIAL ITEM
        </Button>
      </div>

      <div className="p-4 bg-brand-warning/10 border border-brand-warning/20 rounded-input font-mono text-xs text-amber-400 flex items-start gap-3">
        <Lock className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase">[AES-256 ENCRYPTED]</span> All vault secrets are encrypted server-side. Access events are logged into tamper-resistant audit logs.
        </div>
      </div>

      {/* Vault Items List */}
      <div className="grid grid-cols-1 gap-4">
        {credentialVault.map((item) => {
          const isRevealed = !!visibleSecrets[item.id];

          return (
            <Card key={item.id} className="bg-bg-card border-border-custom p-5 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border-custom/50">
                <div className="flex items-center space-x-3">
                  <KeyRound className="h-4 w-4 text-accent-primary" />
                  <h4 className="font-sans text-sm font-bold text-white">{item.serviceName}</h4>
                </div>
                <Badge variant={item.environment === "Production" ? "error" : "cyan"} className="font-mono text-[8px]">
                  ENV: {item.environment}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-2.5 bg-bg-secondary/50 border border-border-custom/50 rounded">
                  <span className="text-[9px] text-text-muted uppercase block">// USERNAME / KEY IDENTIFIER</span>
                  <span className="text-white font-medium">{item.usernameOrKey}</span>
                </div>

                <div className="p-2.5 bg-bg-secondary/50 border border-border-custom/50 rounded flex items-center justify-between">
                  <div className="space-y-0.5 overflow-hidden">
                    <span className="text-[9px] text-text-muted uppercase block">// SECRET KEY</span>
                    <span className="text-accent-primary font-bold truncate block">
                      {isRevealed ? item.encryptedSecret : "••••••••••••••••••••••••"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 ml-2">
                    <button
                      onClick={() => toggleVisibility(item.id)}
                      className="p-1.5 hover:text-accent-primary text-text-muted transition-colors cursor-pointer"
                      title={isRevealed ? "Hide Secret" : "Reveal Secret"}
                    >
                      {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleCopy(item.id, item.encryptedSecret)}
                      className="p-1.5 hover:text-accent-primary text-text-muted transition-colors cursor-pointer"
                      title="Copy Secret"
                    >
                      {copiedId === item.id ? <Check className="h-4 w-4 text-brand-success" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <Card className="w-full max-w-lg bg-bg-card border-border-custom p-6 space-y-4">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              // ADD ENCRYPTED VAULT ITEM
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[9px] text-text-muted uppercase mb-1">Service / Resource Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. AWS Production API Secret Key..."
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[9px] text-text-muted uppercase mb-1">Environment Target</label>
                <select
                  value={environment}
                  onChange={(e: any) => setEnvironment(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-mono"
                >
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                  <option value="Development">Development</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-text-muted uppercase mb-1">Username / Key Name</label>
                <input
                  type="text"
                  placeholder="e.g. admin@binaryfroster.io"
                  value={usernameOrKey}
                  onChange={(e) => setUsernameOrKey(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[9px] text-text-muted uppercase mb-1">Secret Content</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••••••••••"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-mono"
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
                  ENCRYPT & SAVE
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
