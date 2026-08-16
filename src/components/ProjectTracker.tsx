import React, { useState } from "react";
import { Project, Milestone } from "../types";
import {
  Compass,
  Layout,
  Code2,
  TestTube2,
  Rocket,
  Headphones,
  CheckCircle2,
  PlayCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  Edit,
  Play,
  Check,
  RotateCcw,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProjectTrackerProps {
  project: Project;
  onRefresh?: () => void;
}

const PHASES = [
  { name: "Discover", icon: Compass, desc: "Scope & Architecture" },
  { name: "Design", icon: Layout, desc: "High Fidelity Prototypes" },
  { name: "Build", icon: Code2, desc: "Core Engine & Ledger" },
  { name: "Test", icon: TestTube2, desc: "PenTest & Load Stress" },
  { name: "Launch", icon: Rocket, desc: "DNS Cutover & Ingress" },
  { name: "Support", icon: Headphones, desc: "SLA Tier 1 Operations" },
];

export default function ProjectTracker({ project, onRefresh }: ProjectTrackerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>(project.milestones || []);

  // Edit states
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editStatus, setEditStatus] = useState<"Upcoming" | "In Progress" | "Completed" | "Delayed">("In Progress");
  const [savingEdit, setSavingEdit] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStatusChange = (id: string, status: "Upcoming" | "In Progress" | "Completed" | "Delayed", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status, completedDate: status === "Completed" ? new Date().toISOString().split("T")[0] : null }
          : m
      )
    );
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
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === editingMilestone.id
          ? {
              ...m,
              title: editTitle,
              description: editDesc,
              dueDate: editDueDate,
              status: editStatus,
              completedDate: editStatus === "Completed" ? new Date().toISOString().split("T")[0] : null,
            }
          : m
      )
    );
    setSavingEdit(false);
    setEditingMilestone(null);
  };

  const currentPhaseIndex = PHASES.findIndex((p) => p.name === project.phase);
  const activePhase = currentPhaseIndex >= 0 ? currentPhaseIndex : 2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">// PROJECT WORKSPACE ARCHITECTURE</span>
        </div>
      </div>

      {/* Stepper horizontal (6 phases) */}
      <div className="bg-bg-card border border-border-custom p-6 rounded-card shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {PHASES.map((phase, index) => {
            const isCompleted = index < activePhase;
            const isCurrent = index === activePhase;
            const Icon = phase.icon;

            return (
              <div 
                key={phase.name} 
                className={`p-3.5 rounded-input border transition-all flex flex-col justify-between space-y-2 ${
                  isCurrent ? "bg-accent-primary/10 border-accent-primary shadow-glow" :
                  isCompleted ? "bg-brand-success/5 border-brand-success/30" :
                  "bg-bg-secondary/40 border-border-custom/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-text-muted uppercase">0{index + 1}</span>
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
                    <Icon className={`h-3.5 w-3.5 ${isCurrent ? "text-accent-primary" : isCompleted ? "text-brand-success" : "text-text-muted"}`} />
                    <h4 className="font-sans text-xs font-bold text-text-primary">{phase.name}</h4>
                  </div>
                  <p className="font-mono text-[9px] text-text-secondary line-clamp-1">{phase.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestones Accordion */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">// CONTRACTED MILESTONES HISTORY ({milestones.length})</span>
        </div>

        <div className="space-y-3">
          {milestones.map((m) => {
            const isExpanded = expandedId === m.id;

            return (
              <div 
                key={m.id}
                className={`bg-bg-card border rounded-card transition-all overflow-hidden ${
                  isExpanded ? "border-accent-primary/60 shadow-glow" : "border-border-custom hover:border-border-custom/80"
                }`}
              >
                {/* Header click bar */}
                <div 
                  onClick={() => toggleExpand(m.id)}
                  className="w-full text-left p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer outline-none select-none"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex-shrink-0">
                      {m.status === "Completed" && <CheckCircle2 className="h-5 w-5 text-brand-success" />}
                      {m.status === "In Progress" && <PlayCircle className="h-5 w-5 text-accent-primary animate-pulse" />}
                      {m.status === "Delayed" && <AlertTriangle className="h-5 w-5 text-brand-error" />}
                      {m.status === "Upcoming" && <Clock className="h-5 w-5 text-text-muted" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-sans text-xs font-bold text-text-primary">{m.title}</span>
                        {/* Status badges */}
                        <span className={`font-mono text-[8px] px-1.5 py-0.5 border rounded uppercase ${
                          m.status === "Completed" ? "bg-brand-success/10 border-brand-success/20 text-brand-success" :
                          m.status === "In Progress" ? "bg-accent-primary/10 border-accent-primary/20 text-accent-primary" :
                          m.status === "Delayed" ? "bg-brand-error/10 border-brand-error/20 text-brand-error" :
                          "bg-bg-secondary border-border-custom text-text-muted"
                        }`}>
                          {m.status}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-text-secondary">
                        Due Target: <span className="text-text-primary font-semibold">{m.dueDate}</span>
                        {m.completedDate && (
                          <span className="text-brand-success ml-3 font-semibold font-mono">
                            // SEALED: {m.completedDate}
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
                        className="text-[9px] font-mono font-bold bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30 px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="h-2.5 w-2.5" />
                        In Progress
                      </button>
                    )}

                    {m.status !== "Completed" && (
                      <button
                        type="button"
                        onClick={(e) => handleStatusChange(m.id, "Completed", e)}
                        className="text-[9px] font-mono font-bold bg-brand-success/10 hover:bg-brand-success/25 text-brand-success border border-brand-success/30 px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                        Mark Done
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => openEditModal(m, e)}
                      className="text-[9px] font-mono text-text-muted hover:text-white bg-bg-secondary hover:bg-slate-800 border border-border-custom px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="h-2.5 w-2.5" />
                      Edit
                    </button>

                    <div className="p-1 text-text-muted ml-1">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-border-custom/50 bg-bg-secondary/40 text-xs text-text-secondary leading-relaxed space-y-4">
                        <p className="font-sans text-text-secondary text-xs">{m.description}</p>
                        
                        <div className="p-3.5 bg-bg-primary/50 border border-border-custom rounded-input space-y-1.5 font-mono text-[10px]">
                          <div>
                            <span className="text-text-muted">// PIPELINE ENFORCE INDEX:</span>{" "}
                            <span className="text-accent-primary">#{m.order}</span>
                          </div>
                          <div>
                            <span className="text-text-muted">// REGULATORY CONFORMITY:</span>{" "}
                            <span className="text-text-primary">SEALED BY SYSTEM SEED</span>
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
                            className="px-3 py-1.5 bg-bg-card hover:bg-slate-800 text-text-primary font-mono text-[10px] uppercase font-bold rounded transition-colors flex items-center gap-1.5 cursor-pointer border border-border-custom"
                          >
                            <Edit className="h-3 w-3 text-accent-primary" />
                            Edit Milestone
                          </button>

                          {m.status !== "In Progress" && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(m.id, "In Progress")}
                              className="px-3 py-1.5 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary border border-accent-primary/40 font-mono text-[10px] uppercase font-bold rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Play className="h-3 w-3" />
                              Set In Progress
                            </button>
                          )}

                          {m.status !== "Completed" && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(m.id, "Completed")}
                              className="px-3 py-1.5 bg-brand-success hover:bg-brand-success/90 text-bg-primary font-mono text-[10px] font-bold uppercase rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-glow"
                            >
                              <Check className="h-3 w-3 stroke-[2.5]" />
                              Mark Completed
                            </button>
                          )}

                          {m.status !== "Upcoming" && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(m.id, "Upcoming")}
                              className="px-3 py-1.5 bg-bg-card hover:bg-slate-800 text-text-secondary border border-border-custom font-mono text-[10px] uppercase rounded transition-colors flex items-center gap-1.5 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-bg-card border border-border-custom rounded-card p-6 w-full max-w-lg shadow-glow space-y-4 text-text-primary">
            <div className="flex justify-between items-center border-b border-border-custom pb-3">
              <h3 className="font-mono text-xs uppercase tracking-wider text-accent-primary font-bold">
                // EDIT MILESTONE: {editingMilestone.title}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMilestone(null)}
                className="text-text-muted hover:text-white p-1 rounded-full border border-border-custom bg-bg-secondary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e: any) => setEditStatus(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-mono cursor-pointer"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">Due Target Date</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3 py-2 text-xs rounded-input outline-none font-mono cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">Description</label>
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
                  onClick={() => setEditingMilestone(null)}
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
