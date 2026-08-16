"use client";

import * as React from "react";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Compass,
  Layout,
  Code2,
  TestTube2,
  Rocket,
  Headphones,
  Edit,
  Play,
  Check,
  RotateCcw,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortalData, Milestone } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import { Modal } from "@/src/components/ui/modal";
import { formatDate } from "@/src/lib/utils";
import toast from "react-hot-toast";

const PHASES = [
  { name: "Discover", icon: Compass, desc: "Scope & Architecture" },
  { name: "Design", icon: Layout, desc: "High Fidelity Prototypes" },
  { name: "Build", icon: Code2, desc: "Core Engine & Ledger" },
  { name: "Test", icon: TestTube2, desc: "PenTest & Load Stress" },
  { name: "Launch", icon: Rocket, desc: "DNS Cutover & Ingress" },
  { name: "Support", icon: Headphones, desc: "SLA Tier 1 Operations" },
];

export default function ProjectWorkspacePage() {
  const { loading: dataLoading, project, milestones, updateMilestone } = usePortalData();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  // Edit Milestone states
  const [editingMilestone, setEditingMilestone] = React.useState<Milestone | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editDesc, setEditDesc] = React.useState("");
  const [editDueDate, setEditDueDate] = React.useState("");
  const [editStatus, setEditStatus] = React.useState<Milestone["status"]>("In Progress");
  const [savingEdit, setSavingEdit] = React.useState(false);

  const loading = dataLoading;

  const currentPhaseIndex = PHASES.findIndex((p) => p.name === project?.phase);
  const activePhase = currentPhaseIndex >= 0 ? currentPhaseIndex : 2;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStatusChange = (id: string, status: Milestone["status"], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    updateMilestone(id, {
      status,
      completedDate: status === "Completed" ? new Date().toISOString() : null,
    });
    toast.success(`Milestone status updated to ${status}`);
  };

  const openEditModal = (m: Milestone, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingMilestone(m);
    setEditTitle(m.title);
    setEditDesc(m.description);
    setEditDueDate(m.dueDate);
    setEditStatus(m.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone || !editTitle) return;

    setSavingEdit(true);
    updateMilestone(editingMilestone.id, {
      title: editTitle,
      description: editDesc,
      dueDate: editDueDate,
      status: editStatus,
      completedDate: editStatus === "Completed" ? new Date().toISOString() : null,
    });
    setSavingEdit(false);
    setEditingMilestone(null);
    toast.success("Milestone updated successfully!");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-4.5 w-4.5 text-brand-success" />;
      case "In Progress":
        return <Clock className="h-4.5 w-4.5 text-accent-primary animate-pulse" />;
      case "Delayed":
        return <AlertTriangle className="h-4.5 w-4.5 text-brand-error" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-border-custom bg-bg-secondary" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // PROJECT WORKSPACE ARCHITECTURE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="cyan" className="font-mono text-[9px] uppercase">
            PHASE: {project?.phase || "Build"}
          </Badge>
          <Badge variant="success" className="font-mono text-[9px] uppercase">
            {project?.progress || 68}% COMPLETED
          </Badge>
        </div>
      </div>

      {/* Stepper horizontal */}
      <Card className="bg-bg-card border-border-custom p-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {PHASES.map((phase, index) => {
            const isCompleted = index < activePhase;
            const isCurrent = index === activePhase;
            const Icon = phase.icon;

            return (
              <div
                key={phase.name}
                className={`p-3.5 rounded-input border transition-all flex flex-col justify-between space-y-2 ${
                  isCurrent
                    ? "bg-accent-primary/10 border-accent-primary shadow-glow"
                    : isCompleted
                    ? "bg-brand-success/5 border-brand-success/30"
                    : "bg-bg-secondary/40 border-border-custom/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-text-muted uppercase">
                    0{index + 1}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-brand-success" />
                  ) : isCurrent ? (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
                    </span>
                  ) : null}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      className={`h-3.5 w-3.5 ${
                        isCurrent
                          ? "text-accent-primary"
                          : isCompleted
                          ? "text-brand-success"
                          : "text-text-muted"
                      }`}
                    />
                    <h4 className="font-sans text-xs font-bold text-white">{phase.name}</h4>
                  </div>
                  <p className="font-mono text-[9px] text-text-secondary line-clamp-1">{phase.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Milestones Accordion */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
            // CONTRACTED MILESTONES HISTORY ({milestones.length})
          </span>
        </div>

        <div className="space-y-3">
          {milestones.map((m) => {
            const isExpanded = expandedId === m.id;

            return (
              <div
                key={m.id}
                className={`bg-bg-card border rounded-card transition-all overflow-hidden ${
                  isExpanded
                    ? "border-accent-primary/60 shadow-glow"
                    : "border-border-custom hover:border-border-custom/80"
                }`}
              >
                {/* Header click bar */}
                <div
                  onClick={() => toggleExpand(m.id)}
                  className="w-full text-left p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer outline-none select-none"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex-shrink-0">{getStatusIcon(m.status)}</div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-sans text-sm font-bold text-white truncate">
                          {m.title}
                        </span>
                        <Badge
                          variant={
                            m.status === "Completed"
                              ? "success"
                              : m.status === "In Progress"
                              ? "cyan"
                              : m.status === "Delayed"
                              ? "error"
                              : "default"
                          }
                          className="font-mono text-[8px] tracking-wider"
                        >
                          {m.status}
                        </Badge>
                      </div>
                      <p className="font-mono text-[10px] text-text-secondary">
                        Due Target:{" "}
                        <span className="text-white font-semibold">
                          {formatDate(m.dueDate, "MMM dd, yyyy")}
                        </span>
                        {m.completedDate && (
                          <span className="text-brand-success ml-3 font-semibold font-mono">
                            // SEALED: {formatDate(m.completedDate, "MMM dd, yyyy")}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right Header Action Buttons */}
                  <div className="flex items-center gap-2">
                    {m.status !== "In Progress" && (
                      <button
                        type="button"
                        onClick={(e) => handleStatusChange(m.id, "In Progress", e)}
                        className="text-[9px] font-mono font-bold bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="h-2.5 w-2.5" />
                        In Progress
                      </button>
                    )}

                    {m.status !== "Completed" && (
                      <button
                        type="button"
                        onClick={(e) => handleStatusChange(m.id, "Completed", e)}
                        className="text-[9px] font-mono font-bold bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                        Mark Done
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => openEditModal(m, e)}
                      className="text-[9px] font-mono text-slate-400 hover:text-white bg-bg-secondary hover:bg-slate-800 border border-border-custom px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="h-2.5 w-2.5" />
                      Edit
                    </button>

                    <div className="p-1 text-text-muted ml-1">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-border-custom/50 bg-bg-secondary/20 text-xs text-text-secondary leading-relaxed space-y-4">
                        <p className="font-sans text-text-secondary text-xs">{m.description}</p>

                        <div className="p-3.5 bg-bg-primary/50 border border-border-custom rounded-input space-y-1.5 font-mono text-[10px]">
                          <div>
                            <span className="text-text-muted">// PIPELINE ENFORCE INDEX:</span>{" "}
                            <span className="text-accent-primary">#{m.order}</span>
                          </div>
                          <div>
                            <span className="text-text-muted">// REGULATORY CONFORMITY:</span>{" "}
                            <span className="text-white">SEALED BY SYSTEM SEED</span>
                          </div>
                          <div>
                            <span className="text-text-muted">// SYSTEM TELEMETRY AUDIT:</span>{" "}
                            <span className="text-brand-success">VERIFIED BY BINARY FROSTER</span>
                          </div>
                        </div>

                        {/* Expanded Actions Bar */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-custom/40">
                          <button
                            type="button"
                            onClick={() => openEditModal(m)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-[10px] uppercase font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
                          >
                            <Edit className="h-3 w-3 text-cyan-400" />
                            Edit Milestone
                          </button>

                          {m.status !== "In Progress" && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(m.id, "In Progress")}
                              className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 font-mono text-[10px] uppercase font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Play className="h-3 w-3" />
                              Set In Progress
                            </button>
                          )}

                          {m.status !== "Completed" && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(m.id, "Completed")}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check className="h-3 w-3 stroke-[2.5]" />
                              Mark Completed
                            </button>
                          )}

                          {m.status !== "Upcoming" && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(m.id, "Upcoming")}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono text-[10px] uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Reset to Upcoming
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Milestone Modal */}
      {editingMilestone && (
        <Modal
          isOpen={!!editingMilestone}
          onClose={() => setEditingMilestone(null)}
          title={`// EDIT MILESTONE: ${editingMilestone.title}`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-white">
            <div>
              <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                Milestone Title
              </label>
              <input
                required
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2 text-xs rounded-xl outline-none font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full bg-[#0A0D14] border border-slate-700 text-white px-3 py-2 text-xs rounded-xl outline-none font-mono cursor-pointer"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  Due Target Date
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3 py-2 text-xs rounded-xl outline-none font-mono cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                Description & Architectural Deliverables
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
                onClick={() => setEditingMilestone(null)}
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
