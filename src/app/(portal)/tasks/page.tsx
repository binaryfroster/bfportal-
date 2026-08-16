"use client";

import * as React from "react";
import {
  Kanban,
  Clock,
  AlertCircle,
  FileText,
  CheckCircle,
  ChevronRight,
  X,
  Reply,
  Check,
  Plus,
  Edit,
  Play,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import { Modal } from "@/src/components/ui/modal";
import toast from "react-hot-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  assignedToName: string;
  assignedToAvatar: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  column: "To Do" | "In Progress" | "In Review" | "Completed";
  files: Array<{ name: string; url: string }>;
  feedback?: { text: string; priority: string; date: string } | null;
}

export default function KanbanBoardPage() {
  const { user } = useUser();
  const { loading: dataLoading, tasks, moveTask, submitTaskFeedback, updateTask } = usePortalData();
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  // Edit Task modal states
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editPriority, setEditPriority] = React.useState<Task["priority"]>("High");
  const [editColumn, setEditColumn] = React.useState<Task["column"]>("In Progress");
  const [savingEdit, setSavingEdit] = React.useState(false);

  // Revision / feedback states
  const [showFeedbackForm, setShowFeedbackForm] = React.useState(false);
  const [feedbackText, setFeedbackText] = React.useState("");
  const [feedbackPriority, setFeedbackPriority] = React.useState("High");
  const [submittingFeedback, setSubmittingFeedback] = React.useState(false);

  const loading = dataLoading;

  const COLUMNS = ["To Do", "In Progress", "In Review", "Completed"] as const;

  const handleMoveTask = (taskId: string, targetCol: Task["column"]) => {
    moveTask(taskId, targetCol);
    if (activeTask && activeTask.id === taskId) {
      setActiveTask((prev) => (prev ? { ...prev, column: targetCol } : null));
    }
    toast.success(`Task shifted to ${targetCol}`);
  };

  const handleApproveTask = (taskId: string) => {
    handleMoveTask(taskId, "Completed");
    setActiveTask(null);
    toast.success("Task approved and marked completed.");
  };

  const openEditModal = (task: Task, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
    setEditColumn(task.column);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle) return;

    setSavingEdit(true);
    updateTask(editingTask.id, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      column: editColumn,
    });

    if (activeTask && activeTask.id === editingTask.id) {
      setActiveTask((prev) =>
        prev
          ? {
              ...prev,
              title: editTitle,
              description: editDescription,
              priority: editPriority,
              column: editColumn,
            }
          : null
      );
    }

    setSavingEdit(false);
    setEditingTask(null);
    toast.success("Task updated successfully!");
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !feedbackText) return;

    setSubmittingFeedback(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    submitTaskFeedback(activeTask.id, {
      text: feedbackText,
      priority: feedbackPriority,
      date: new Date().toISOString(),
    });

    toast.success("Revision request dispatched to Binary Froster");
    setShowFeedbackForm(false);
    setFeedbackText("");
    setSubmittingFeedback(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Kanban className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // SECURE SCRUM KANBAN
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="cyan" className="font-mono text-[9px] uppercase">
            ACTIVE SPRINT
          </Badge>
          {user?.role === "admin" && (
            <Badge variant="cyan" className="font-mono text-[9px] uppercase">
              ADMIN CONTROL
            </Badge>
          )}
        </div>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((colName) => {
          const colTasks = tasks.filter((t) => t.column === colName);

          return (
            <div
              key={colName}
              className="bg-bg-card/40 border border-border-custom p-4 rounded-card min-h-[500px] flex flex-col space-y-4"
            >
              {/* Column Label */}
              <div className="flex items-center justify-between pb-2 border-b border-border-custom/50">
                <span className="font-sans text-xs font-bold text-white tracking-wide">{colName}</span>
                <span className="font-mono text-[10px] bg-bg-secondary border border-border-custom px-2 py-0.5 rounded text-text-secondary">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks list inside column */}
              <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
                {colTasks.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-border-custom/50 rounded-input bg-bg-secondary/10">
                    <span className="font-mono text-[9px] text-text-muted">// EMPTY_STACK</span>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      onClick={() => {
                        setActiveTask(task);
                        setShowFeedbackForm(false);
                      }}
                      className="p-4 bg-bg-card border border-border-custom hover:border-accent-primary/50 rounded-input shadow-sm hover:shadow-glow cursor-pointer transition-all space-y-3 relative group"
                    >
                      {/* Priority Tag & Admin Quick Moves */}
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            task.priority === "Critical"
                              ? "error"
                              : task.priority === "High"
                              ? "warning"
                              : task.priority === "Medium"
                              ? "cyan"
                              : "default"
                          }
                          className="font-mono text-[8px]"
                        >
                          {task.priority}
                        </Badge>

                        {/* Top quick shift tags */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            type="button"
                            title="Edit task"
                            onClick={(e) => openEditModal(task, e)}
                            className="text-[9px] font-mono text-cyan-400 hover:bg-cyan-500/20 bg-bg-secondary px-1.5 py-0.5 border border-cyan-500/30 rounded cursor-pointer flex items-center gap-1"
                          >
                            <Edit className="h-2.5 w-2.5" />
                            Edit
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h4 className="font-sans text-xs font-semibold text-white group-hover:text-accent-primary transition-colors leading-snug">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      {/* Action buttons bar on Card */}
                      <div className="pt-2 border-t border-border-custom/30 flex flex-wrap gap-1.5">
                        {task.column !== "In Progress" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveTask(task.id, "In Progress");
                            }}
                            className="text-[9px] font-mono font-bold bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="h-2.5 w-2.5" />
                            In Progress
                          </button>
                        )}

                        {task.column !== "Completed" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveTask(task.id, "Completed");
                            }}
                            className="text-[9px] font-mono font-bold bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                            Mark Done
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => openEditModal(task, e)}
                          className="text-[9px] font-mono text-slate-400 hover:text-white bg-bg-secondary hover:bg-slate-800 border border-border-custom px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ml-auto"
                        >
                          <Edit className="h-2.5 w-2.5" />
                          Edit
                        </button>
                      </div>

                      {/* Footer: User + Date */}
                      <div className="flex justify-between items-center pt-2 border-t border-border-custom/40">
                        {/* Assigned developer */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={task.assignedToAvatar}
                            alt={task.assignedToName}
                            className="h-4.5 w-4.5 rounded-full border border-accent-primary/20 bg-bg-secondary object-cover"
                          />
                          <span className="font-mono text-[9px] text-text-secondary truncate max-w-[80px]">
                            {task.assignedToName.split(" ")[0]}
                          </span>
                        </div>

                        {/* Due Date */}
                        <div className="flex items-center gap-1 font-mono text-[9px] text-text-muted">
                          <Clock className="h-3 w-3" />
                          <span>{task.dueDate.split("-").slice(1).join("/")}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <Modal
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          title={`// EDIT TASK: ${editingTask.title}`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-white">
            <div>
              <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                Task Title
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2 text-xs rounded-xl outline-none font-sans"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                Description & Technical Specs
              </label>
              <textarea
                rows={4}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white p-3 text-xs rounded-xl outline-none font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as any)}
                  className="w-full bg-[#0A0D14] border border-slate-700 text-white px-3 py-2 text-xs rounded-xl outline-none font-mono cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  Workflow Status Column
                </label>
                <select
                  value={editColumn}
                  onChange={(e) => setEditColumn(e.target.value as any)}
                  className="w-full bg-[#0A0D14] border border-slate-700 text-white px-3 py-2 text-xs rounded-xl outline-none font-mono cursor-pointer"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
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

      {/* Side Detail Panel / Drawer */}
      <AnimatePresence>
        {activeTask && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setActiveTask(null);
                setShowFeedbackForm(false);
              }}
              className="absolute inset-0 bg-black"
            />

            {/* Panel Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: "easeOut" }}
              className="relative w-full max-w-md bg-bg-card border-l border-border-custom h-full flex flex-col p-6 shadow-glow overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setActiveTask(null);
                  setShowFeedbackForm(false);
                }}
                className="absolute top-6 right-6 p-1.5 rounded-full border border-border-custom bg-bg-secondary hover:text-accent-primary hover:border-accent-primary/40 transition-all cursor-pointer text-text-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-2 mb-6 text-text-secondary">
                <Kanban className="h-4 w-4 text-accent-primary" />
                <span className="font-mono text-[10px] uppercase tracking-widest">
                  // TASK_MANAGING_CONSOLE
                </span>
              </div>

              {/* Body */}
              <div className="space-y-6 flex-grow">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        activeTask.priority === "Critical"
                          ? "error"
                          : activeTask.priority === "High"
                          ? "warning"
                          : activeTask.priority === "Medium"
                          ? "cyan"
                          : "default"
                      }
                      className="font-mono text-[9px] uppercase"
                    >
                      {activeTask.priority} Priority
                    </Badge>
                    <span className="font-mono text-[9px] text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">
                      Column: {activeTask.column}
                    </span>
                  </div>
                  <h2 className="font-sans text-lg font-bold text-white tracking-tight leading-snug">
                    {activeTask.title}
                  </h2>
                </div>

                {/* Primary Action Console */}
                <div className="p-4 bg-[#0A0D14] border border-cyan-500/30 rounded-xl space-y-3">
                  <span className="block font-mono text-[9px] text-cyan-400 uppercase tracking-widest font-bold">
                    // QUICK ACTION CONTROLS
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(activeTask)}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-mono text-[10px] uppercase font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                    >
                      <Edit className="h-3 w-3 text-cyan-400" />
                      Edit Task
                    </button>

                    {activeTask.column !== "In Progress" && (
                      <button
                        type="button"
                        onClick={() => handleMoveTask(activeTask.id, "In Progress")}
                        className="py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 font-mono text-[10px] uppercase font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="h-3 w-3" />
                        In Progress
                      </button>
                    )}

                    {activeTask.column !== "Completed" && (
                      <button
                        type="button"
                        onClick={() => handleApproveTask(activeTask.id)}
                        className="py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-mono text-[10px] uppercase font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="h-3 w-3 stroke-[2.5]" />
                        Mark as Done
                      </button>
                    )}

                    {activeTask.column !== "To Do" && (
                      <button
                        type="button"
                        onClick={() => handleMoveTask(activeTask.id, "To Do")}
                        className="py-2 px-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[10px] uppercase rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Move to To Do
                      </button>
                    )}
                  </div>
                </div>

                {/* Developer */}
                <div className="p-4 bg-bg-secondary border border-border-custom rounded-input space-y-3">
                  <span className="block font-mono text-[9px] text-text-muted uppercase">
                    // PRIMARY INTEGRATOR
                  </span>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeTask.assignedToAvatar}
                      alt={activeTask.assignedToName}
                      className="h-10 w-10 rounded-full border border-accent-primary/20 bg-bg-primary object-cover shadow-glow"
                    />
                    <div className="space-y-0.5">
                      <span className="block font-sans text-xs font-semibold text-white">
                        {activeTask.assignedToName}
                      </span>
                      <span className="block font-mono text-[9px] text-text-muted uppercase">
                        Binary Froster Engineer
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-2">
                  <span className="block font-mono text-[9px] text-text-muted uppercase">
                    // TECHNICAL REQUIREMENTS SPEC
                  </span>
                  <p className="font-sans text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                    {activeTask.description}
                  </p>
                </div>

                {/* Attachments */}
                {activeTask.files && activeTask.files.length > 0 && (
                  <div className="space-y-2">
                    <span className="block font-mono text-[9px] text-text-muted uppercase">
                      // DELIVERED ARTIFACTS
                    </span>
                    <div className="space-y-1.5">
                      {activeTask.files.map((f, i) => (
                        <a
                          key={i}
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 bg-bg-secondary border border-border-custom hover:border-accent-primary/30 rounded-input flex items-center gap-2.5 text-xs text-white transition-colors group cursor-pointer"
                        >
                          <FileText className="h-4 w-4 text-accent-primary group-hover:animate-bounce animate-duration-500" />
                          <span className="underline select-none font-mono text-[10px] truncate">
                            {f.name}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Client Approvals for "In Review" Column */}
                {activeTask.column === "In Review" && user?.role === "client" && !showFeedbackForm && (
                  <div className="pt-6 border-t border-border-custom/50 grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleApproveTask(activeTask.id)}
                      variant="accent"
                      className="py-3 font-mono text-xs uppercase tracking-widest font-bold cursor-pointer"
                    >
                      <Check className="h-4 w-4 stroke-[2.5] mr-1.5" />
                      APPROVE & SIGN
                    </Button>
                    <button
                      onClick={() => setShowFeedbackForm(true)}
                      className="py-3 bg-bg-secondary border border-brand-warning/45 text-brand-warning hover:bg-brand-warning/10 font-mono text-xs uppercase tracking-widest font-bold rounded-input transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Reply className="h-4 w-4" />
                      REQUEST REVISION
                    </button>
                  </div>
                )}

                {/* Feedback Form */}
                {showFeedbackForm && (
                  <motion.form
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmitFeedback}
                    className="pt-6 border-t border-border-custom/50 space-y-4"
                  >
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] text-brand-warning uppercase tracking-widest flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 animate-bounce" />
                        // COMPLIANCE FEEDBACK LOOP
                      </span>
                      <p className="text-[11px] text-text-secondary leading-normal">
                        Submit explicit functional notes. Triggers immediate pager notifications
                        resetting target column state.
                      </p>
                    </div>

                    <div>
                      <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                        Revision Urgency Priority
                      </label>
                      <select
                        value={feedbackPriority}
                        onChange={(e) => setFeedbackPriority(e.target.value)}
                        className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-mono cursor-pointer"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                        <option value="Critical">Critical Priority</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                        Explicit Revision Notes
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="State exactly what needs modification (e.g. FCA ledger latency should resolve in <150ms...)"
                        className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white p-3 text-xs rounded-input outline-none font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setShowFeedbackForm(false)}
                        className="py-2.5 bg-bg-secondary border border-border-custom text-text-secondary hover:text-white font-mono text-[10px] uppercase rounded-input transition-colors cursor-pointer"
                      >
                        [CANCEL]
                      </button>
                      <Button
                        type="submit"
                        variant="accent"
                        className="font-mono text-[10px] uppercase cursor-pointer"
                        isLoading={submittingFeedback}
                        disabled={!feedbackText}
                      >
                        DISPATCH COMMAND
                      </Button>
                    </div>
                  </motion.form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
