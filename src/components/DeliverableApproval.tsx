import React, { useState, useEffect } from "react";
import { ApprovalDeliverable, Project } from "../types";
import { api } from "../lib/api";
import {
  ShieldCheck,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  Eye,
  CornerDownRight,
  FileText,
  ArrowRight,
  Clock,
  MessageSquare,
  Loader2,
  ChevronRight,
  Edit,
  Play,
  Check,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DeliverableApprovalProps {
  project: Project;
  userRole: "client" | "admin";
  onActionComplete?: () => void;
}

export default function DeliverableApproval({ project, userRole, onActionComplete }: DeliverableApprovalProps) {
  const [deliverables, setDeliverables] = useState<ApprovalDeliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDel, setSelectedDel] = useState<ApprovalDeliverable | null>(null);
  
  // Feedback form states
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackPriority, setFeedbackPriority] = useState<"Low" | "Medium" | "High">("High");
  const [feedbackFile, setFeedbackFile] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit Deliverable states
  const [editingDel, setEditingDel] = useState<ApprovalDeliverable | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState<"Pending" | "Approved" | "Changes Requested">("Pending");
  const [savingEdit, setSavingEdit] = useState(false);

  const loadDeliverables = async () => {
    try {
      const data = await api.getApprovals(project.id);
      setDeliverables(data);
      if (selectedDel) {
        const refreshed = data.find((d) => d.id === selectedDel.id);
        if (refreshed) setSelectedDel(refreshed);
      }
    } catch (err) {
      console.error("Failed loading approval items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliverables();
    const interval = setInterval(loadDeliverables, 15000);
    return () => clearInterval(interval);
  }, [project, selectedDel]);

  const handleAction = async (action: "Approve" | "Request Changes") => {
    if (!selectedDel) return;
    setSubmitting(true);
    try {
      const fbPayload = action === "Request Changes" ? {
        sectionFeedback: feedbackText,
        priority: feedbackPriority,
        fileName: feedbackFile ? "screenshot.png" : undefined
      } : null;
      
      await api.actionApproval(selectedDel.id, action, fbPayload);
      setShowFeedback(false);
      setFeedbackText("");
      await loadDeliverables();
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error("Failed executing action on deliverable:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (id: string, status: "Pending" | "Approved" | "Changes Requested", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setDeliverables((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status } : d))
      );
      if (selectedDel && selectedDel.id === id) {
        setSelectedDel((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      console.error("Quick status update failed:", err);
    }
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
    setDeliverables((prev) =>
      prev.map((d) =>
        d.id === editingDel.id
          ? { ...d, name: editName, description: editDesc, status: editStatus }
          : d
      )
    );

    if (selectedDel && selectedDel.id === editingDel.id) {
      setSelectedDel((prev) =>
        prev ? { ...prev, name: editName, description: editDesc, status: editStatus } : null
      );
    }

    setSavingEdit(false);
    setEditingDel(null);
  };

  if (loading) {
    return (
      <div className="bg-bg-card border border-border-custom p-6 rounded-card animate-pulse space-y-4">
        <div className="h-8 bg-bg-secondary w-1/3 rounded"></div>
        <div className="h-20 bg-bg-secondary rounded"></div>
        <div className="h-20 bg-bg-secondary rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">// QUALITY CONFORMITY MATRIX</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deliverables List (Left 1 col on lg) */}
        <div className="lg:col-span-1 space-y-3">
          <span className="block font-mono text-[9px] text-text-muted uppercase tracking-wider">// COMMITTED DELIVERABLES ({deliverables.length})</span>
          
          {deliverables.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border-custom bg-bg-card rounded-card">
              <CheckCircle2 className="h-6 w-6 text-brand-success mx-auto mb-2" />
              <p className="font-sans text-xs text-text-primary">No deliverables registered.</p>
            </div>
          ) : (
            deliverables.map((del) => {
              const isActive = selectedDel?.id === del.id;
              
              return (
                <button
                  key={del.id}
                  onClick={() => { setSelectedDel(del); setShowFeedback(false); }}
                  className={`w-full text-left p-4 rounded-input border transition-all flex flex-col gap-2.5 cursor-pointer outline-none ${
                    isActive ? "bg-accent-primary/5 border-accent-primary shadow-glow" : "bg-bg-card border-border-custom hover:border-border-custom/80"
                  }`}
                >
                  <div className="space-y-1 w-full min-w-0">
                    <h4 className="font-sans text-xs font-bold text-text-primary truncate">{del.name}</h4>
                    <p className="text-[11px] text-text-secondary line-clamp-1">{del.description}</p>
                  </div>

                  <div className="flex justify-between items-center w-full pt-2 border-t border-border-custom/40">
                    <span className={`font-mono text-[8px] px-1.5 py-0.5 border rounded uppercase ${
                      del.status === "Approved" ? "bg-brand-success/15 border-brand-success/25 text-brand-success" :
                      del.status === "Changes Requested" ? "bg-brand-error/15 border-brand-error/25 text-brand-error" :
                      "bg-brand-warning/15 border-brand-warning/25 text-brand-warning animate-pulse"
                    }`}>
                      {del.status}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      {del.status !== "Approved" && (
                        <span
                          onClick={(e) => handleQuickStatus(del.id, "Approved", e)}
                          className="text-[8px] font-mono font-bold bg-brand-success/10 hover:bg-brand-success/25 text-brand-success border border-brand-success/30 px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          ✓ Approve
                        </span>
                      )}

                      {del.status !== "Pending" && (
                        <span
                          onClick={(e) => handleQuickStatus(del.id, "Pending", e)}
                          className="text-[8px] font-mono font-bold bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30 px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          ▶ Pending
                        </span>
                      )}

                      <span
                        onClick={(e) => openEditModal(del, e)}
                        className="text-[8px] font-mono text-text-muted hover:text-white bg-bg-secondary px-1.5 py-0.5 border border-border-custom rounded cursor-pointer"
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

        {/* Deliverable Review Panel (Right 2 cols on lg) */}
        <div className="lg:col-span-2">
          {selectedDel ? (
            <div className="bg-bg-card border border-border-custom p-6 rounded-card space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-accent-primary/5 rounded-full blur-2xl pointer-events-none"></div>

              {/* Status Header */}
              <div className="flex justify-between items-center pb-4 border-b border-border-custom/50">
                <div className="space-y-0.5">
                  <span className="block font-mono text-[9px] text-text-muted uppercase">// ACTIVE CONFORMITY REVIEW</span>
                  <h3 className="font-sans text-base font-bold text-text-primary">{selectedDel.name}</h3>
                </div>
                <span className={`font-mono text-[9px] px-2.5 py-1 border rounded uppercase font-semibold ${
                  selectedDel.status === "Approved" ? "bg-brand-success/15 border-brand-success/30 text-brand-success" :
                  selectedDel.status === "Changes Requested" ? "bg-brand-error/15 border-brand-error/30 text-brand-error" :
                  "bg-brand-warning/15 border-brand-warning/30 text-brand-warning"
                }`}>
                  {selectedDel.status}
                </span>
              </div>

              {/* ACTION CONTROL BAR */}
              <div className="p-3.5 bg-bg-secondary border border-accent-primary/30 rounded-input flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[10px] text-accent-primary uppercase font-bold tracking-wider">
                  // DELIVERABLE ACTIONS
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedDel)}
                    className="px-3 py-1.5 bg-bg-card hover:bg-slate-800 text-white font-mono text-[10px] uppercase font-bold rounded transition-colors flex items-center gap-1.5 cursor-pointer border border-border-custom"
                  >
                    <Edit className="h-3 w-3 text-accent-primary" />
                    Edit Spec
                  </button>

                  {selectedDel.status !== "Pending" && (
                    <button
                      type="button"
                      onClick={() => handleQuickStatus(selectedDel.id, "Pending")}
                      className="px-3 py-1.5 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary border border-accent-primary/40 font-mono text-[10px] uppercase font-bold rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="h-3 w-3" />
                      Set In Review
                    </button>
                  )}

                  {selectedDel.status !== "Approved" && (
                    <button
                      type="button"
                      onClick={() => handleAction("Approve")}
                      disabled={submitting}
                      className="px-3 py-1.5 bg-brand-success hover:bg-brand-success/90 text-bg-primary font-mono text-[10px] font-bold uppercase rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-glow"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      Approve & Lock
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <span className="block font-mono text-[9px] text-text-muted uppercase">// DESCRIPTION & UTILITY DESCRIPTION</span>
                <p className="font-sans text-xs text-text-secondary leading-relaxed">
                  {selectedDel.description}
                </p>
              </div>

              {/* Attachment PDF file */}
              <div className="space-y-2">
                <span className="block font-mono text-[9px] text-text-muted uppercase">// REVIEW TARGET</span>
                <div className="p-4 bg-bg-secondary border border-border-custom hover:border-accent-primary/20 rounded-input flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded bg-bg-primary border border-border-custom flex items-center justify-center text-accent-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="block font-sans text-xs font-semibold text-text-primary">Deliverable_Core_Artifact.pdf</span>
                      <span className="block font-mono text-[9px] text-text-muted uppercase">PDF DOCUMENT // SIGNATURE ENCRYPTED</span>
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
                <div className="p-4 bg-brand-error/5 border border-brand-error/10 rounded-input space-y-2">
                  <span className="block font-mono text-[9px] text-brand-error uppercase tracking-wider font-semibold">// REVISION SPECIFICATION DEMAND</span>
                  <div className="font-sans text-xs text-text-secondary leading-relaxed space-y-1.5">
                    <p><span className="font-mono text-[10px] text-brand-error font-bold">[Section Feedback]:</span> {selectedDel.feedback.sectionFeedback}</p>
                    <p><span className="font-mono text-[10px] text-brand-error font-bold">[Priority Impact]:</span> {selectedDel.feedback.priority} Impact Change</p>
                  </div>
                </div>
              )}

              {/* Immutable Audit Trail Log */}
              <div className="space-y-3 pt-4 border-t border-border-custom/50">
                <span className="block font-mono text-[9px] text-text-muted uppercase">// AUDIT TRAIL LOG [IMMUTABLE RECORDS]</span>
                <div className="space-y-2">
                  {selectedDel.auditTrail.map((log, index) => (
                    <div key={index} className="flex items-start gap-2.5 font-mono text-[10px] text-text-secondary bg-bg-secondary/40 p-2 border border-border-custom/50 rounded-input">
                      <Clock className="h-3.5 w-3.5 text-text-muted flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-accent-primary">[{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
                        <span className="text-text-primary font-medium">{log.event}</span>{" "}
                        <span className="text-text-muted">by {log.user}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approver Action buttons */}
              {selectedDel.status === "Pending" && !showFeedback && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-custom/50">
                  <button
                    onClick={() => handleAction("Approve")}
                    disabled={submitting}
                    className="py-3 bg-brand-success hover:bg-brand-success/90 text-bg-primary font-mono text-xs uppercase tracking-widest font-bold rounded-input transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-glow border border-transparent"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />}
                    APPROVE & LOCK DELIVERABLE
                  </button>
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
                  onSubmit={(e) => { e.preventDefault(); handleAction("Request Changes"); }}
                  className="pt-4 border-t border-border-custom/50 space-y-4"
                >
                  <div className="p-3.5 bg-brand-error/5 border border-brand-error/15 rounded-input text-xs text-brand-error leading-relaxed font-mono uppercase">
                    [COMPLIANCE CHECK] Formulating a Revision Request will freeze code production of related matching assets. Ensure sections are defined.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                        AMENDMENT LEVEL IMPACT
                      </label>
                      <select
                        value={feedbackPriority}
                        onChange={(e: any) => setFeedbackPriority(e.target.value)}
                        className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-mono"
                      >
                        <option value="Low">Low - Nice to have (doesn't hold release)</option>
                        <option value="Medium">Medium - UX/UI layout fix</option>
                        <option value="High">High - Crucial logic / FCA security gap</option>
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
                        className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                      SECTION-BY-SECTION DEFICIENCIES SPECS
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="State section numbers or layout nodes and describe explicit issues (e.g. Node v4 matching consensus contains 100ms lag on UK routing...)"
                      className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary p-3 text-xs rounded-input outline-none font-sans"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setShowFeedback(false)}
                      className="py-2.5 bg-bg-secondary border border-border-custom text-text-secondary hover:text-text-primary font-mono text-[10px] uppercase rounded-input transition-colors cursor-pointer"
                    >
                      [ABORT]
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !feedbackText}
                      className="py-2.5 bg-brand-error text-text-primary hover:bg-brand-error/90 font-mono text-[10px] uppercase tracking-widest font-bold rounded-input transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow-glow"
                    >
                      {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "TRANSMIT REVISION BLOCKS"}
                    </button>
                  </div>
                </motion.form>
              )}
            </div>
          ) : (
            <div className="h-full border border-dashed border-border-custom/50 bg-bg-card/40 rounded-card flex flex-col items-center justify-center text-center p-12 text-text-secondary">
              <ShieldCheck className="h-10 w-10 text-text-muted mx-auto mb-3 animate-pulse" />
              <p className="font-sans text-xs font-semibold text-text-primary">No deliverable selected</p>
              <p className="font-mono text-[10px] text-text-muted uppercase mt-0.5">// SELECT AN ARTIFACT FROM THE CONFORMITY COMPOST LIST</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Deliverable Modal */}
      {editingDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-bg-card border border-border-custom rounded-card p-6 w-full max-w-lg shadow-glow space-y-4 text-text-primary">
            <div className="flex justify-between items-center border-b border-border-custom pb-3">
              <h3 className="font-mono text-xs uppercase tracking-wider text-accent-primary font-bold">
                // EDIT DELIVERABLE SPEC: {editingDel.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingDel(null)}
                className="text-text-muted hover:text-white p-1 rounded-full border border-border-custom bg-bg-secondary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">Deliverable Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-mono cursor-pointer"
                >
                  <option value="Pending">Pending Review</option>
                  <option value="Approved">Approved & Locked</option>
                  <option value="Changes Requested">Changes Requested</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">Utility Description & Specs</label>
                <textarea
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary p-3 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-custom">
                <button
                  type="button"
                  onClick={() => setEditingDel(null)}
                  className="px-4 py-2 bg-bg-secondary hover:bg-slate-800 text-text-secondary font-mono text-xs uppercase rounded-input transition-colors cursor-pointer"
                >
                  [CANCEL]
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs uppercase font-bold rounded-input transition-all cursor-pointer shadow-glow"
                >
                  {savingEdit ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
