import React, { useState, useEffect } from "react";
import { Task, Project } from "../types";
import { api } from "../lib/api";
import {
  Kanban,
  User,
  Clock,
  AlertCircle,
  FileText,
  CheckCircle,
  ChevronRight,
  X,
  Reply,
  Check,
  CornerDownRight,
  Loader2,
  Plus,
  RefreshCw,
  Edit,
  Play,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface KanbanBoardProps {
  project: Project;
  userRole: "client" | "admin";
}

export default function KanbanBoard({ project, userRole }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Edit task states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<string>("High");
  const [editColumn, setEditColumn] = useState<string>("In Progress");
  const [savingEdit, setSavingEdit] = useState(false);
  
  // Feedback / change request states
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackPriority, setFeedbackPriority] = useState("High");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Load project tasks
  async function loadTasks() {
    try {
      const data = await api.getTasks(project.id);
      setTasks(data);
      // Keep selected task state updated
      if (activeTask) {
        const refreshed = data.find((t) => t.id === activeTask.id);
        if (refreshed) setActiveTask(refreshed);
      }
    } catch (err) {
      console.error("Failed loading tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 15000);
    return () => clearInterval(interval);
  }, [project, activeTask]);

  const COLUMNS: Array<"To Do" | "In Progress" | "In Review" | "Completed"> = [
    "To Do",
    "In Progress",
    "In Review",
    "Completed"
  ];

  // Drag and Drop simulation + quick moves
  const handleMoveTask = async (taskId: string, targetCol: string) => {
    try {
      await api.moveTask(taskId, targetCol);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, column: targetCol as any } : t)));
      if (activeTask && activeTask.id === taskId) {
        setActiveTask((prev) => (prev ? { ...prev, column: targetCol as any } : null));
      }
    } catch (err) {
      console.error("Failed to move task:", err);
    }
  };

  const handleApproveTask = async (taskId: string) => {
    await handleMoveTask(taskId, "Completed");
    setActiveTask(null);
  };

  const openEditModal = (task: Task, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
    setEditColumn(task.column);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle) return;

    setSavingEdit(true);
    try {
      await api.saveTask({
        id: editingTask.id,
        title: editTitle,
        description: editDescription,
        priority: editPriority as any,
        column: editColumn as any,
      });

      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, title: editTitle, description: editDescription, priority: editPriority as any, column: editColumn as any }
            : t
        )
      );

      if (activeTask && activeTask.id === editingTask.id) {
        setActiveTask((prev) =>
          prev
            ? { ...prev, title: editTitle, description: editDescription, priority: editPriority as any, column: editColumn as any }
            : null
        );
      }

      setEditingTask(null);
    } catch (err) {
      console.error("Failed saving task edit:", err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !feedbackText) return;
    
    setSubmittingFeedback(true);
    try {
      await api.submitTaskFeedback(activeTask.id, feedbackText, feedbackPriority);
      setShowFeedbackForm(false);
      setFeedbackText("");
      setActiveTask(null);
      await loadTasks();
    } catch (err) {
      console.error("Failed requesting changes:", err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "Critical": return "bg-brand-error/15 text-brand-error border-brand-error/20";
      case "High": return "bg-brand-warning/15 text-brand-warning border-brand-warning/20";
      case "Medium": return "bg-accent-primary/15 text-accent-primary border-accent-primary/20";
      default: return "bg-text-muted/10 text-text-secondary border-border-custom";
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 animate-pulse">
        <div className="h-96 bg-bg-card rounded-card border border-border-custom"></div>
        <div className="h-96 bg-bg-card rounded-card border border-border-custom"></div>
        <div className="h-96 bg-bg-card rounded-card border border-border-custom"></div>
        <div className="h-96 bg-bg-card rounded-card border border-border-custom"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kanban Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Kanban className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">// SECURE SCRUM KANBAN</span>
        </div>
        
        {userRole === "admin" && (
          <p className="font-mono text-[10px] text-accent-primary uppercase tracking-wider">
            [ADMIN CONTROL ENABLED]
          </p>
        )}
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((colName) => {
          const colTasks = tasks.filter((t) => t.column === colName);
          
          return (
            <div 
              key={colName}
              className="bg-bg-card/40 border border-border-custom/80 p-4 rounded-card min-h-[500px] flex flex-col space-y-4"
            >
              {/* Column Label */}
              <div className="flex items-center justify-between pb-2 border-b border-border-custom/50">
                <span className="font-sans text-xs font-bold text-text-primary tracking-wide">{colName}</span>
                <span className="font-mono text-[10px] bg-bg-secondary border border-border-custom/80 px-2 py-0.5 rounded text-text-secondary">
                  {colTasks.length}
                </span>
              </div>

              {/* Task list inside column */}
              <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
                {colTasks.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-border-custom/50 rounded-input bg-bg-secondary/10">
                    <span className="font-mono text-[9px] text-text-muted">// EMPTY_STACK</span>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layoutId={task.id}
                      onClick={() => { setActiveTask(task); setShowFeedbackForm(false); }}
                      className="p-4 bg-bg-card border border-border-custom hover:border-accent-primary/50 rounded-input shadow-sm hover:shadow-glow cursor-pointer transition-all space-y-3 relative group"
                    >
                      {/* Priority Tag */}
                      <div className="flex items-center justify-between">
                        <span className={`font-mono text-[8px] px-1.5 py-0.5 border rounded uppercase ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            type="button"
                            title="Edit task"
                            onClick={(e) => openEditModal(task, e)}
                            className="text-[9px] font-mono text-accent-primary hover:bg-accent-primary/20 bg-bg-secondary px-1.5 py-0.5 border border-accent-primary/30 rounded cursor-pointer flex items-center gap-1"
                          >
                            <Edit className="h-2.5 w-2.5" />
                            Edit
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h4 className="font-sans text-xs font-semibold text-text-primary group-hover:text-accent-primary transition-colors leading-snug">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      {/* Quick Action Button Row */}
                      <div className="pt-2 border-t border-border-custom/30 flex flex-wrap gap-1.5">
                        {task.column !== "In Progress" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveTask(task.id, "In Progress");
                            }}
                            className="text-[9px] font-mono font-bold bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
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
                            className="text-[9px] font-mono font-bold bg-brand-success/10 hover:bg-brand-success/25 text-brand-success border border-brand-success/30 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                            Mark Done
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => openEditModal(task, e)}
                          className="text-[9px] font-mono text-text-muted hover:text-white bg-bg-secondary hover:bg-slate-800 border border-border-custom px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ml-auto"
                        >
                          <Edit className="h-2.5 w-2.5" />
                          Edit
                        </button>
                      </div>

                      {/* Footer: User + Date */}
                      <div className="flex justify-between items-center pt-2.5 border-t border-border-custom/40">
                        {/* Assigned developer */}
                        <div className="flex items-center gap-1.5">
                          <img 
                            src={task.assignedToAvatar} 
                            alt={task.assignedToName} 
                            referrerPolicy="no-referrer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-bg-card border border-border-custom rounded-card p-6 w-full max-w-lg shadow-glow space-y-4 text-text-primary">
            <div className="flex justify-between items-center border-b border-border-custom pb-3">
              <h3 className="font-mono text-xs uppercase tracking-wider text-accent-primary font-bold">
                // EDIT TASK: {editingTask.title}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="text-text-muted hover:text-white p-1 rounded-full border border-border-custom bg-bg-secondary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">Description</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary p-3 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-mono cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-text-muted uppercase mb-1">Status Column</label>
                  <select
                    value={editColumn}
                    onChange={(e) => setEditColumn(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-mono cursor-pointer"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-custom">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 bg-bg-secondary hover:bg-slate-800 text-text-secondary font-mono text-xs uppercase rounded-input transition-colors cursor-pointer"
                >
                  [CANCEL]
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs uppercase font-bold rounded-input transition-all flex items-center gap-2 cursor-pointer shadow-glow"
                >
                  {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : "SAVE CHANGES"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Side Detail Panel / Sidebar drawer */}
      <AnimatePresence>
        {activeTask && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => { setActiveTask(null); setShowFeedbackForm(false); }}
              className="absolute inset-0 bg-black"
            ></motion.div>

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
                onClick={() => { setActiveTask(null); setShowFeedbackForm(false); }}
                className="absolute top-6 right-6 p-1.5 rounded-full border border-border-custom bg-bg-secondary hover:text-accent-primary hover:border-accent-primary/40 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header category */}
              <div className="flex items-center gap-2 mb-6 text-text-secondary">
                <Kanban className="h-4 w-4 text-accent-primary" />
                <span className="font-mono text-[10px] uppercase tracking-widest">// TASK_MANAGING_CONSOLE</span>
              </div>

              {/* Body details */}
              <div className="space-y-6 flex-grow">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-[9px] px-2 py-0.5 border rounded uppercase ${getPriorityColor(activeTask.priority)}`}>
                      {activeTask.priority} Priority
                    </span>
                    <span className="font-mono text-[9px] text-accent-primary border border-accent-primary/30 px-2 py-0.5 rounded">
                      Column: {activeTask.column}
                    </span>
                  </div>
                  <h2 className="font-sans text-lg font-bold text-text-primary tracking-tight leading-snug">
                    {activeTask.title}
                  </h2>
                </div>

                {/* Primary Action Console */}
                <div className="p-4 bg-bg-secondary border border-accent-primary/30 rounded-input space-y-3">
                  <span className="block font-mono text-[9px] text-accent-primary uppercase tracking-widest font-bold">
                    // QUICK ACTION CONTROLS
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(activeTask)}
                      className="py-2 px-3 bg-bg-card hover:bg-slate-800 text-text-primary font-mono text-[10px] uppercase font-bold rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-border-custom"
                    >
                      <Edit className="h-3 w-3 text-accent-primary" />
                      Edit Task
                    </button>

                    {activeTask.column !== "In Progress" && (
                      <button
                        type="button"
                        onClick={() => handleMoveTask(activeTask.id, "In Progress")}
                        className="py-2 px-3 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary border border-accent-primary/40 font-mono text-[10px] uppercase font-bold rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="h-3 w-3" />
                        In Progress
                      </button>
                    )}

                    {activeTask.column !== "Completed" && (
                      <button
                        type="button"
                        onClick={() => handleApproveTask(activeTask.id)}
                        className="py-2 px-3 bg-brand-success/20 hover:bg-brand-success/30 text-brand-success border border-brand-success/40 font-mono text-[10px] uppercase font-bold rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="h-3 w-3 stroke-[2.5]" />
                        Mark as Done
                      </button>
                    )}

                    {activeTask.column !== "To Do" && (
                      <button
                        type="button"
                        onClick={() => handleMoveTask(activeTask.id, "To Do")}
                        className="py-2 px-3 bg-bg-card hover:bg-slate-800 text-text-secondary border border-border-custom font-mono text-[10px] uppercase rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Move to To Do
                      </button>
                    )}
                  </div>
                </div>

                {/* Developer block */}
                <div className="p-4 bg-bg-secondary border border-border-custom rounded-input space-y-3">
                  <span className="block font-mono text-[9px] text-text-muted uppercase">// PRIMARY INTEGRATOR</span>
                  <div className="flex items-center gap-3">
                    <img 
                      src={activeTask.assignedToAvatar} 
                      alt={activeTask.assignedToName}
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-full border border-accent-primary/20 bg-bg-primary object-cover shadow-glow" 
                    />
                    <div className="space-y-0.5">
                      <span className="block font-sans text-xs font-semibold text-text-primary">{activeTask.assignedToName}</span>
                      <span className="block font-mono text-[9px] text-text-muted uppercase">Binary Froster Engineer</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block font-mono text-[9px] text-text-muted uppercase">// TECHNICAL REQUIREMENTS SPEC</span>
                  <p className="font-sans text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                    {activeTask.description}
                  </p>
                </div>

                {activeTask.files && activeTask.files.length > 0 && (
                  <div className="space-y-2">
                    <span className="block font-mono text-[9px] text-text-muted uppercase">// DELIVERED ARTIFACTS</span>
                    <div className="space-y-1.5">
                      {activeTask.files.map((f, i) => (
                        <a 
                          key={i}
                          href={f.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-3 bg-bg-secondary border border-border-custom hover:border-accent-primary/30 rounded-input flex items-center gap-2.5 text-xs text-text-primary transition-colors group cursor-pointer"
                        >
                          <FileText className="h-4 w-4 text-accent-primary group-hover:animate-bounce" />
                          <span className="underline select-none font-mono text-[10px]">{f.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. CLIENT ACTION CONTROLS ON IN REVIEW */}
                {activeTask.column === "In Review" && userRole === "client" && !showFeedbackForm && (
                  <div className="pt-6 border-t border-border-custom/50 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleApproveTask(activeTask.id)}
                      className="py-3 bg-brand-success hover:bg-brand-success/90 text-bg-primary font-mono text-xs uppercase tracking-widest font-bold rounded-input transition-colors flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow-glow"
                    >
                      <Check className="h-4 w-4 stroke-[2.5]" />
                      APPROVE & SIGN
                    </button>
                    <button
                      onClick={() => setShowFeedbackForm(true)}
                      className="py-3 bg-bg-secondary border border-brand-warning/40 text-brand-warning hover:bg-brand-warning/10 font-mono text-xs uppercase tracking-widest font-bold rounded-input transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Reply className="h-4 w-4" />
                      REQUEST REVISION
                    </button>
                  </div>
                )}

                {/* Section Feedback interactive form */}
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
                        Submit explicit functional notes. Triggers immediate pager notifications resetting target column state.
                      </p>
                    </div>

                    <div>
                      <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                        Revision Urgency Priority
                      </label>
                      <select
                        value={feedbackPriority}
                        onChange={(e) => setFeedbackPriority(e.target.value)}
                        className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-mono"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority (FCA compliance Block)</option>
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
                        className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary p-3 text-xs rounded-input outline-none font-sans"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setShowFeedbackForm(false)}
                        className="py-2.5 bg-bg-secondary border border-border-custom text-text-secondary hover:text-text-primary font-mono text-[10px] uppercase rounded-input transition-colors cursor-pointer"
                      >
                        [CANCEL]
                      </button>
                      <button
                        type="submit"
                        disabled={submittingFeedback || !feedbackText}
                        className="py-2.5 bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-[10px] uppercase tracking-wider font-bold rounded-input transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow-glow"
                      >
                        {submittingFeedback ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "DISPATCH COMMAND"
                        )}
                      </button>
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
