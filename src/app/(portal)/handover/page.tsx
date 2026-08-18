"use client";

import * as React from "react";
import { BookOpen, CheckCircle2, FileText, Download, Key, Code, ShieldCheck, AlertCircle } from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

export default function HandoverPage() {
  const { user } = useUser();
  const { projectHandover, signoffHandover } = usePortalData();

  const [typedName, setTypedName] = React.useState("");

  const handleSignoff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedName) return;

    signoffHandover(typedName);
    toast.success("Final Project Handover Signed Off & Sealed!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4.5 w-4.5 text-accent-primary" />
          <h1 className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // FORMAL PROJECT COMPLETION & HANDOVER VAULT
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.success("Handover package downloading as ZIP")}
            className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-brand-success/10 hover:bg-brand-success/25 text-brand-success border border-brand-success/30"
          >
            <Download className="w-3 h-3" />
            DOWNLOAD COMPLETE BUNDLE
          </button>
          <Badge variant={projectHandover?.stage === "Handover Complete" ? "success" : "warning"} className="font-mono text-[9px]">
            STAGE: {projectHandover?.stage || "Ready for Handover"}
          </Badge>
        </div>
      </div>

      {/* Handover Artifacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-bg-card border-border-custom p-6 space-y-4 flex flex-col">
          <div className="flex items-center space-x-3 pb-3 border-b border-border-custom/50">
            <Code className="h-5 w-5 text-accent-primary" />
            <h3 className="font-sans text-sm font-bold text-white">Source Code & Repository Access</h3>
          </div>
          <p className="font-mono text-xs text-text-secondary flex-grow">
            Production GitHub repository including complete commit history, automated CI/CD workflows, and release tags.
          </p>
          <a
            href={projectHandover?.repositoryUrl || "#"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-mono text-accent-primary hover:underline mb-2"
          >
            [ACCESS_GITHUB_REPOSITORY] &rarr;
          </a>
          <div className="flex items-center gap-2 pt-4 border-t border-border-custom/30 mt-auto">
            <button
              onClick={() => toast.success('Repository access verified successfully')}
              className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30"
            >
              <ShieldCheck className="w-3 h-3" />
              VERIFY ACCESS
            </button>
            <button
              onClick={() => toast.success('Missing item request submitted to engineering')}
              className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
            >
              <AlertCircle className="w-3 h-3" />
              REQUEST MISSING ITEM
            </button>
          </div>
        </Card>

        <Card className="bg-bg-card border-border-custom p-6 space-y-4 flex flex-col">
          <div className="flex items-center space-x-3 pb-3 border-b border-border-custom/50">
            <FileText className="h-5 w-5 text-accent-primary" />
            <h3 className="font-sans text-sm font-bold text-white">API Manuals & Deployment Docs</h3>
          </div>
          <p className="font-mono text-xs text-text-secondary flex-grow">
            OpenAPI v3.0 schemas, Postman collections, architecture diagrams, and staging/production Helm chart manifests.
          </p>
          <a
            href={projectHandover?.apiDocsUrl || "#"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-mono text-accent-primary hover:underline mb-2"
          >
            [OPEN_API_DOCUMENTATION] &rarr;
          </a>
          <div className="flex items-center gap-2 pt-4 border-t border-border-custom/30 mt-auto">
            <button
              onClick={() => toast.success('Missing item request submitted to engineering')}
              className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
            >
              <AlertCircle className="w-3 h-3" />
              REQUEST MISSING ITEM
            </button>
          </div>
        </Card>

        <Card className="bg-bg-card border-border-custom p-6 space-y-4 flex flex-col">
          <div className="flex items-center space-x-3 pb-3 border-b border-border-custom/50">
            <Key className="h-5 w-5 text-accent-primary" />
            <h3 className="font-sans text-sm font-bold text-white">Encrypted Credential Vault</h3>
          </div>
          <p className="font-mono text-xs text-text-secondary flex-grow">
            Encrypted environment variables, database superuser connection strings, and production API key manifests.
          </p>
          <a
            href="/credential-vault"
            className="inline-flex items-center gap-2 text-xs font-mono text-accent-primary hover:underline mb-2"
          >
            [OPEN_SECURE_CREDENTIAL_VAULT] &rarr;
          </a>
          <div className="flex items-center gap-2 pt-4 border-t border-border-custom/30 mt-auto">
            <button
              onClick={() => toast.success('Missing item request submitted to engineering')}
              className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
            >
              <AlertCircle className="w-3 h-3" />
              REQUEST MISSING ITEM
            </button>
          </div>
        </Card>

        <Card className="bg-bg-card border-border-custom p-6 space-y-4 flex flex-col">
          <div className="flex items-center space-x-3 pb-3 border-b border-border-custom/50">
            <Download className="h-5 w-5 text-accent-primary" />
            <h3 className="font-sans text-sm font-bold text-white">Database Backup & Asset Archives</h3>
          </div>
          <p className="font-mono text-xs text-text-secondary flex-grow">
            Signed SHA-256 verified Postgres SQL dump files, S3 storage archives, and Figma raw source files.
          </p>
          <a
            href={projectHandover?.backupManifestUrl || "#"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-mono text-accent-primary hover:underline mb-2"
          >
            [DOWNLOAD_BACKUP_MANIFEST] &rarr;
          </a>
          <div className="flex items-center gap-2 pt-4 border-t border-border-custom/30 mt-auto">
            <button
              onClick={() => toast.success('Missing item request submitted to engineering')}
              className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
            >
              <AlertCircle className="w-3 h-3" />
              REQUEST MISSING ITEM
            </button>
          </div>
        </Card>
      </div>

      {/* Formal Client Sign-off Box */}
      <Card className="bg-bg-card border-border-custom p-6 space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-border-custom/50">
          <ShieldCheck className="h-5 w-5 text-brand-success" />
          <h3 className="font-sans text-base font-bold text-white">Formal Handover Acceptance Sign-off</h3>
        </div>

        {projectHandover?.stage === "Handover Complete" ? (
          <div className="p-4 bg-brand-success/10 border border-brand-success/20 rounded-input font-mono text-xs text-brand-success space-y-1">
            <p className="font-bold uppercase">[HANDOVER COMPLETED & SIGNED OFF]</p>
            <p>Signed By: {projectHandover.clientSignoffName}</p>
            <p>Timestamp: {new Date(projectHandover.signoffTimestamp!).toLocaleString()}</p>
            <p>Status: Project transitioned to active Maintenance & SLA Care.</p>
          </div>
        ) : (
          <form onSubmit={handleSignoff} className="space-y-4 font-mono text-xs">
            <p className="text-text-secondary leading-relaxed">
              By signing below, you acknowledge full receipt of source code repositories, API documentation, database credentials, and system manuals for the project.
            </p>
            <div>
              <label className="block text-[9px] text-text-muted uppercase mb-1">
                Full Legal Name Sign-Off
              </label>
              <input
                required
                type="text"
                placeholder="Type full legal name..."
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
              />
            </div>
            <Button type="submit" variant="accent" className="font-mono text-xs uppercase font-bold cursor-pointer">
              EXECUTE FORMAL HANDOVER SIGN-OFF
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
