"use client";

import * as React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Eye,
  FileText,
  Clock,
  ChevronRight,
  X,
  Edit,
  Play,
  RotateCcw,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import { Modal } from "@/src/components/ui/modal";
import { hasSignatoryAuthority } from "@/src/types";
import toast from "react-hot-toast";

interface AuditLog {
  event: string;
  user: string;
  timestamp: string;
}

interface ApprovalDeliverable {
  id: string;
  name: string;
  description: string;
  fileUrl: string;
  status: "Pending" | "Approved" | "Changes Requested";
  reviewerName: string | null;
  reviewerId: string | null;
  actionTimestamp: string | null;
  feedback: { sectionFeedback: string; priority: string; fileName?: string } | null;
  auditTrail: AuditLog[];
}

export default function DeliverableApprovalPage() {
  const { user } = useUser();
  const { loading: dataLoading, approvals: deliverables, approveDeliverable, requestChanges, updateApprovalDeliverable } = usePortalData();
  const [selectedDelId, setSelectedDelId] = React.useState<string | null>(null);

  // Revision form states
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [feedbackText, setFeedbackText] = React.useState("");
  const [feedbackPriority, setFeedbackPriority] = React.useState("High");
  const [feedbackFile, setFeedbackFile] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Edit deliverable states
  const [editingDel, setEditingDel] = React.useState<ApprovalDeliverable | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editDesc, setEditDesc] = React.useState("");
  const [editStatus, setEditStatus] = React.useState<ApprovalDeliverable["status"]>("Pending");
  const [savingEdit, setSavingEdit] = React.useState(false);

  const loading = dataLoading;

  React.useEffect(() => {
    if (deliverables.length > 0 && !selectedDelId) {
      setSelectedDelId(deliverables[0].id);
    }
  }, [deliverables, selectedDelId]);

  const selectedDel = deliverables.find((d) => d.id === selectedDelId) || null;

  const handleAction = async (action: "Approve" | "Request Changes") => {
    if (!selectedDelId) return;
    setSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    if (action === "Approve") {
      approveDeliverable(selectedDelId, user?.name || "Client User");
    } else {
      requestChanges(selectedDelId, user?.name || "Client User", {
        sectionFeedback: feedbackText,
        priority: feedbackPriority as any,
        fileName: feedbackFile ? "screenshot.png" : undefined,
      });
    }

    setShowFeedback(false);
    setFeedbackText("");
    setFeedbackFile("");
    setSubmitting(false);

    toast.success(
      action === "Approve"
        ? "Deliverable signed off successfully"
        : "Revision request dispatched to team"
    );
  };

  const handleQuickStatus = (id: string, status: ApprovalDeliverable["status"], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    updateApprovalDeliverable(id, {
      status,
      reviewerName: status === "Approved" ? (user?.name || "Reviewer") : null,
      actionTimestamp: new Date().toISOString(),
      auditTrail: [
        ...(deliverables.find((d) => d.id === id)?.auditTrail || []),
        { event: `Status updated to ${status}`, user: user?.name || "Reviewer", timestamp: new Date().toISOString() },
      ],
    });
    toast.success(`Deliverable status updated to ${status}`);
  };

  const openEditModal = (del: ApprovalDeliverable, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingDel(del);
    setEditName(del.name);
    setEditDesc(del.description);
    setEditStatus(del.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDel || !editName) return;

    setSavingEdit(true);
    updateApprovalDeliverable(editingDel.id, {
      name: editName,
      description: editDesc,
      status: editStatus,
    });
    setSavingEdit(false);
    setEditingDel(null);
    toast.success("Deliverable specifications updated!");
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <Skeleton className="h-64" />
        <Skeleton className="lg:col-span-2 h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // QUALITY CONFORMITY MATRIX
          </span>
        </div>

        <Badge variant="cyan" className="font-mono text-[9px] uppercase">
          E-SIGN VERIFIED LEDGERS
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deliverables List (Left 1 col) */}
        <div className="lg:col-span-1 space-y-3">
          <span className="block font-mono text-[9px] text-text-muted uppercase tracking-wider">
            // COMMITTED DELIVERABLES ({deliverables.length})
          </span>

          {deliverables.length === 0 ? (
            <Card className="bg-bg-card border-border-custom p-8 text-center border-dashed">
              <CheckCircle2 className="h-6 w-6 text-brand-success mx-auto mb-2" />
              <p className="font-sans text-xs text-white">No deliverables awaiting review.</p>
            </Card>
          ) : (
            deliverables.map((del) => {
              const isActive = selectedDelId === del.id;

              return (
                <button
                  key={del.id}
                  onClick={() => {
                    setSelectedDelId(del.id);
                    setShowFeedback(false);
                  }}
                  className={`w-full text-left p-4 rounded-input border transition-all flex flex-col gap-2.5 cursor-pointer outline-none ${
                    isActive
                      ? "bg-accent-primary/10 border-accent-primary shadow-glow"
                      : "bg-bg-card border-border-custom hover:border-border-custom/80"
                  }`}
                >
                  <div className="space-y-1 w-full min-w-0">
                    <h4 className="font-sans text-xs font-bold text-white truncate">{del.name}</h4>
                    <p className="text-[11px] text-text-secondary line-clamp-1">
                      {del.description}
                    </p>
                  </div>

                  {/* Card quick action bar */}
                  <div className="flex justify-between items-center w-full pt-2 border-t border-border-custom/40">
                    <Badge
                      variant={
                        del.status === "Approved"
                          ? "success"
                          : del.status === "Changes Requested"
                          ? "error"
                          : "warning"
                      }
                      className="font-mono text-[8px]"
                    >
                      {del.status}
                    </Badge>

                    <div className="flex items-center gap-1">
                      {del.status !== "Approved" && (
                        <span
                          onClick={(e) => handleQuickStatus(del.id, "Approved", e)}
                          className="text-[8px] font-mono font-bold bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          ✓ Approve
                        </span>
                      )}

                      {del.status !== "Pending" && (
                        <span
                          onClick={(e) => handleQuickStatus(del.id, "Pending", e)}
                          className="text-[8px] font-mono font-bold bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          ▶ Pending
                        </span>
                      )}

                      <span
                        onClick={(e) => openEditModal(del, e)}
                        className="text-[8px] font-mono text-slate-400 hover:text-white bg-bg-secondary px-1.5 py-0.5 border border-border-custom rounded cursor-pointer"
                      >
                        ✎ Edit
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Deliverable Review Panel (Right 2 cols) */}
        <div className="lg:col-span-2">
          {selectedDel ? (
            <Card className="bg-bg-card border-border-custom p-6 rounded-card space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-accent-primary/5 rounded-full blur-2xl pointer-events-none" />

              {/* Status Header */}
              <div className="flex justify-between items-center pb-4 border-b border-border-custom/50">
                <div className="space-y-0.5">
                  <span className="block font-mono text-[9px] text-text-muted uppercase">
                    // ACTIVE CONFORMITY REVIEW
                  </span>
                  <h3 className="font-sans text-base font-bold text-white">{selectedDel.name}</h3>
                </div>
                <Badge
                  variant={
                    selectedDel.status === "Approved"
                      ? "success"
                      : selectedDel.status === "Changes Requested"
                      ? "error"
                      : "warning"
                  }
                  className="font-mono text-[9px] uppercase font-semibold"
                >
                  {selectedDel.status}
                </Badge>
              </div>

              {/* ACTION CONTROL BAR */}
              <div className="p-3.5 bg-[#0A0D14] border border-cyan-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                  // DELIVERABLE ACTIONS
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedDel)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-[10px] uppercase font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <Edit className="h-3 w-3 text-cyan-400" />
                    Edit Spec
                  </button>

                  {selectedDel.status !== "Pending" && (
                    <button
                      type="button"
                      onClick={() => handleQuickStatus(selectedDel.id, "Pending")}
                      className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 font-mono text-[10px] uppercase font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="h-3 w-3" />
                      Set In Review
                    </button>
                  )}

                  {selectedDel.status !== "Approved" && (
                    hasSignatoryAuthority(user?.role) ? (
                      <button
                        type="button"
                        onClick={() => handleAction("Approve")}
                        disabled={submitting}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        Approve & Lock
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[9px] uppercase rounded" title="Requires client_admin or super_admin authority to sign off">
                        Signatory Required
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <span className="block font-mono text-[9px] text-text-muted uppercase">
                  // DESCRIPTION & UTILITY DESCRIPTION
                </span>
                <p className="font-sans text-xs text-text-secondary leading-relaxed">
                  {selectedDel.description}
                </p>
              </div>

              {/* Attachment PDF file */}
              <div className="space-y-2">
                <span className="block font-mono text-[9px] text-text-muted uppercase">
                  // REVIEW TARGET
                </span>
                <div className="p-4 bg-bg-secondary border border-border-custom hover:border-accent-primary/20 rounded-input flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded bg-bg-primary border border-border-custom flex items-center justify-center text-accent-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="block font-sans text-xs font-semibold text-white">
                        Deliverable_Core_Artifact.pdf
                      </span>
                      <span className="block font-mono text-[9px] text-text-muted uppercase">
                        PDF DOCUMENT // SIGNATURE ENCRYPTED
                      </span>
                    </div>
                  </div>
                  <a
                    href={selectedDel.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-bg-primary hover:bg-accent-primary hover:text-bg-primary text-accent-primary border border-accent-primary/30 font-mono text-[10px] font-bold uppercase rounded-input transition-colors cursor-pointer"
                  >
                    [OPEN_PREVIEW]
                  </a>
                </div>
              </div>

              {/* Feedback History log */}
              {selectedDel.status === "Changes Requested" && selectedDel.feedback && (
                <div className="p-4 bg-brand-error/5 border border-brand-error/15 rounded-input space-y-2">
                  <span className="block font-mono text-[9px] text-brand-error uppercase tracking-wider font-semibold">
                    // REVISION SPECIFICATION DEMAND
                  </span>
                  <div className="font-sans text-xs text-text-secondary leading-relaxed space-y-1.5">
                    <p>
                      <span className="font-mono text-[10px] text-brand-error font-bold">
                        [Section Feedback]:
                      </span>{" "}
                      {selectedDel.feedback.sectionFeedback}
                    </p>
                    <p>
                      <span className="font-mono text-[10px] text-brand-error font-bold">
                        [Priority Impact]:
                      </span>{" "}
                      {selectedDel.feedback.priority} Impact Change
                    </p>
                  </div>
                </div>
              )}

              {/* Immutable Audit Trail Log */}
              <div className="space-y-3 pt-4 border-t border-border-custom/50">
                <span className="block font-mono text-[9px] text-text-muted uppercase">
                  // AUDIT TRAIL LOG [IMMUTABLE RECORDS]
                </span>
                <div className="space-y-2">
                  {selectedDel.auditTrail.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2.5 font-mono text-[10px] text-text-secondary bg-bg-secondary/40 p-2 border border-border-custom/50 rounded-input"
                    >
                      <Clock className="h-3.5 w-3.5 text-text-muted flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-accent-primary">
                          [{new Date(log.timestamp).toLocaleDateString()}{" "}
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}]
                        </span>{" "}
                        <span className="text-white font-medium">{log.event}</span>{" "}
                        <span className="text-text-muted">by {log.user}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approver Action buttons for Client */}
              {selectedDel.status === "Pending" && !showFeedback && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-custom/50">
                  <Button
                    onClick={() => handleAction("Approve")}
                    variant="accent"
                    className="py-3 font-mono text-xs uppercase tracking-widest font-bold cursor-pointer"
                    isLoading={submitting}
                  >
                    <CheckCircle2 className="h-4 w-4 stroke-[2.5] mr-1.5" />
                    APPROVE & LOCK
                  </Button>
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="py-3 bg-bg-secondary border border-brand-error/40 text-brand-error hover:bg-brand-error/10 font-mono text-xs uppercase tracking-widest font-bold rounded-input transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <AlertOctagon className="h-4 w-4" />
                    REQUEST AMENDMENT
                  </button>
                </div>
              )}

              {/* Structured Changes form */}
              {showFeedback && (
                <motion.form
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAction("Request Changes");
                  }}
                  className="pt-4 border-t border-border-custom/50 space-y-4"
                >
                  <div className="p-3.5 bg-brand-error/5 border border-brand-error/15 rounded-input text-xs text-brand-error leading-relaxed font-mono uppercase">
                    [COMPLIANCE CHECK] Formulating a Revision Request will freeze code production of
                    related matching assets. Ensure sections are defined.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                        AMENDMENT LEVEL IMPACT
                      </label>
                      <select
                        value={feedbackPriority}
                        onChange={(e) => setFeedbackPriority(e.target.value)}
                        className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-mono cursor-pointer"
                      >
                        <option value="Low">Low - Nice to have (doesn't hold release)</option>
                        <option value="Medium">Medium - UX/UI layout fix</option>
                        <option value="High">High - Crucial logic / compliance gap</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                        Screen Capture / reference (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Paste image link or mock file path..."
                        value={feedbackFile}
                        onChange={(e) => setFeedbackFile(e.target.value)}
                        className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                      SECTION-BY-SECTION DEFICIENCIES SPECS
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="State section numbers or layout nodes and describe explicit issues..."
                      className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white p-3 text-xs rounded-input outline-none font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setShowFeedback(false)}
                      className="py-2.5 bg-bg-secondary border border-border-custom text-text-secondary hover:text-white font-mono text-[10px] uppercase rounded-input transition-colors cursor-pointer"
                    >
                      [ABORT]
                    </button>
                    <Button
                      type="submit"
                      variant="destructive"
                      className="font-mono text-[10px] uppercase tracking-widest cursor-pointer"
                      isLoading={submitting}
                      disabled={!feedbackText}
                    >
                      TRANSMIT REVISION
                    </Button>
                  </div>
                </motion.form>
              )}
            </Card>
          ) : (
            <Card className="h-full border-dashed border-border-custom/50 bg-bg-card/40 flex flex-col items-center justify-center text-center p-12 text-text-secondary">
              <ShieldCheck className="h-10 w-10 text-text-muted mx-auto mb-3 animate-pulse" />
              <p className="font-sans text-xs font-semibold text-white">No deliverable selected</p>
              <p className="font-mono text-[10px] text-text-muted uppercase mt-0.5">
                // SELECT AN ARTIFACT FROM THE CONFORMITY COMPOST LIST
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Deliverable Modal */}
      {editingDel && (
        <Modal
          isOpen={!!editingDel}
          onClose={() => setEditingDel(null)}
          title={`// EDIT DELIVERABLE SPEC: ${editingDel.name}`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-white">
            <div>
              <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                Deliverable Name
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2 text-xs rounded-xl outline-none font-sans"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full bg-[#0A0D14] border border-slate-700 text-white px-3 py-2 text-xs rounded-xl outline-none font-mono cursor-pointer"
              >
                <option value="Pending">Pending Review</option>
                <option value="Approved">Approved & Locked</option>
                <option value="Changes Requested">Changes Requested</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                Utility Description & Specs
              </label>
              <textarea
                rows={4}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white p-3 text-xs rounded-xl outline-none font-sans"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingDel(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs uppercase rounded-xl transition-colors cursor-pointer"
              >
                [CANCEL]
              </button>
              <Button
                type="submit"
                variant="accent"
                className="font-mono text-xs uppercase font-bold py-2 px-5 rounded-xl cursor-pointer"
                isLoading={savingEdit}
              >
                SAVE CHANGES
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
