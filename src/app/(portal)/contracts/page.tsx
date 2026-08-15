"use client";

import * as React from "react";
import {
  ShieldCheck,
  FileText,
  Clock,
  ChevronRight,
  PenTool,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

interface Contract {
  id: string;
  name: string;
  description: string;
  status: "Draft" | "Pending Signature" | "Fully Executed";
  fileUrl: string;
  signedName: string | null;
  signedAt: string | null;
  ipAddress: string | null;
}

export default function ContractsPage() {
  const { user } = useUser();
  const { loading: dataLoading, contracts, signContract } = usePortalData();
  const [selectedContractId, setSelectedContractId] = React.useState<string | null>(null);

  // E-Signature Drawer State
  const [showSignForm, setShowSignForm] = React.useState(false);
  const [typedName, setTypedName] = React.useState("");
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [signing, setSigning] = React.useState(false);

  const loading = dataLoading;

  React.useEffect(() => {
    if (contracts.length > 0 && !selectedContractId) {
      setSelectedContractId(contracts[0].id);
    }
  }, [contracts, selectedContractId]);

  const selectedContract = contracts.find((c) => c.id === selectedContractId) || null;

  const handleSignContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId || !typedName || !acceptTerms) return;

    setSigning(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    signContract(selectedContractId, typedName);

    setShowSignForm(false);
    setTypedName("");
    setAcceptTerms(false);
    setSigning(false);

    toast.success("Contract e-signed and sealed successfully");
  };

  if (loading) {
    return <Skeleton className="h-64 bg-bg-card border border-border-custom w-full" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: Contracts List */}
      <div className="lg:col-span-1 space-y-3">
        <span className="block font-mono text-[9px] text-text-muted uppercase tracking-wider">
          // LEGALLY SEALED DOCUMENTS
        </span>

        {contracts.map((con) => {
          const isSelected = selectedContract?.id === con.id;

          return (
            <button
              key={con.id}
              onClick={() => {
                setSelectedContractId(con.id);
                setShowSignForm(false);
              }}
              className={`w-full text-left p-4 rounded-input border transition-all flex flex-col gap-2.5 cursor-pointer outline-none ${
                isSelected
                  ? "bg-accent-primary/5 border-accent-primary shadow-glow"
                  : "bg-bg-card border-border-custom hover:border-border-custom/80 text-white"
              }`}
            >
              <div className="space-y-1 w-full min-w-0">
                <h4 className="font-sans text-xs font-bold truncate">{con.name}</h4>
                <p className="text-[11px] text-text-secondary line-clamp-1">{con.description}</p>
              </div>

              <div className="flex justify-between items-center w-full">
                <Badge
                  variant={con.status === "Fully Executed" ? "success" : "warning"}
                  className="font-mono text-[8px]"
                >
                  {con.status}
                </Badge>
                <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
              </div>
            </button>
          );
        })}
      </div>

      {/* RIGHT: Document Preview & Signature Panel */}
      <div className="lg:col-span-2">
        {selectedContract ? (
          <Card className="relative overflow-hidden bg-bg-card border-border-custom p-6 space-y-6 text-white">
            <div className="absolute top-0 right-0 h-24 w-24 bg-accent-primary/5 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-border-custom/50">
              <div className="space-y-0.5">
                <span className="block font-mono text-[9px] text-text-muted uppercase">
                  // DEPLOYED AGREEMENT PREVIEW
                </span>
                <h3 className="font-sans text-base font-bold text-white">{selectedContract.name}</h3>
              </div>
              <Badge
                variant={selectedContract.status === "Fully Executed" ? "success" : "warning"}
                className="font-mono text-[9px] font-semibold"
              >
                {selectedContract.status}
              </Badge>
            </div>

            {/* Embed PDF Viewer */}
            <div className="border border-border-custom rounded h-[350px] overflow-hidden bg-bg-primary">
              <iframe
                src={`${selectedContract.fileUrl}#toolbar=0`}
                title="Contract PDF Viewer"
                className="w-full h-full border-none"
              />
            </div>

            {/* E-Signature Audit Block */}
            {selectedContract.status === "Fully Executed" ? (
              <div className="p-4 bg-brand-success/5 border border-brand-success/15 rounded-input space-y-2">
                <span className="block font-mono text-[9px] text-brand-success uppercase font-semibold">
                  // LEGALLY BINDING SEAL RECORDED
                </span>
                <div className="font-mono text-[10px] text-text-secondary space-y-1.5">
                  <p>
                    <span className="text-text-muted">Signed By:</span> {selectedContract.signedName}
                  </p>
                  <p>
                    <span className="text-text-muted">Timestamp:</span>{" "}
                    {new Date(selectedContract.signedAt!).toLocaleString()}
                  </p>
                  <p>
                    <span className="text-text-muted">IP Address:</span> {selectedContract.ipAddress}
                  </p>
                  <p>
                    <span className="text-text-muted">Cert Authority:</span> Binary Froster Ledger
                  </p>
                </div>
              </div>
            ) : (
              user?.role === "client" && (
                <div className="pt-4 border-t border-border-custom/50">
                  {!showSignForm ? (
                    <Button
                      onClick={() => setShowSignForm(true)}
                      variant="accent"
                      className="w-full font-mono text-xs uppercase font-bold py-3 cursor-pointer"
                    >
                      <PenTool className="h-4 w-4 mr-2" />
                      PROCEED TO SIGN AGREEMENT
                    </Button>
                  ) : (
                    <form onSubmit={handleSignContract} className="space-y-4">
                      <div>
                        <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                          Full Legal Name Signature
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="Type your full name to sign electronically..."
                          value={typedName}
                          onChange={(e) => setTypedName(e.target.value)}
                          className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
                        />
                      </div>

                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-text-secondary select-none leading-relaxed">
                        <input
                          required
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="mt-0.5"
                        />
                        <span>
                          I acknowledge that typing my legal name above acts as a legally-binding
                          electronic signature under the Electronic Signatures in Global and National
                          Commerce (ESIGN) Act.
                        </span>
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setShowSignForm(false)}
                          className="py-2.5 bg-bg-secondary border border-border-custom text-text-secondary hover:text-white font-mono text-[10px] uppercase rounded-input transition-colors cursor-pointer"
                        >
                          [CANCEL]
                        </button>
                        <Button
                          type="submit"
                          variant="accent"
                          className="font-mono text-[10px] uppercase cursor-pointer"
                          isLoading={signing}
                          disabled={!typedName || !acceptTerms}
                        >
                          SEAL AGREEMENT
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )
            )}
          </Card>
        ) : (
          <div className="h-full border border-dashed border-border-custom bg-bg-card/40 rounded-card flex flex-col items-center justify-center text-center p-12 text-text-secondary">
            <ShieldCheck className="h-10 w-10 text-text-muted mx-auto mb-3 animate-pulse" />
            <p className="font-sans text-xs font-semibold text-white">No contract selected</p>
            <p className="font-mono text-[10px] text-text-muted uppercase mt-0.5">
              // SELECT AN AGREEMENT INVENTORY SOURCE
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
