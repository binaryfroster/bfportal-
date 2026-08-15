import React, { useState, useEffect } from "react";
import { Task, Project } from "../types";
import { api } from "../lib/api";
import { Kanban, User, Clock, AlertCircle, FileText, CheckCircle, ChevronRight, X, Reply, Check, CornerDownRight, Loader2, Plus, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface KanbanBoardProps {
  project: Project;
  userRole: "client" | "admin";
}

export default function KanbanBoard({ project, userRole }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
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
      const { task } = await api.moveTask(taskId, targetCol);
      // optimistically update local state
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, column: targetCol as any } : t)));
    } catch (err) {
      console.error("Failed to move task:", err);
    }
  };

  const handleApproveTask = async (taskId: string) => {
    // Moves task to Completed column
    await handleMoveTask(taskId, "Completed");
    setActiveTask(null);
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
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                // drag and drop simulation handled on click, or we can listen to standard events
              }}
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
                        
                        {/* Drag indicator / admin quick shifts */}
                        {userRole === "admin" && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            {COLUMNS.filter(c => c !== colName).map(c => (
                              <button
                                key={c}
                                title={`Move to ${c}`}
                                onClick={(e) => { e.stopPropagation(); handleMoveTask(task.id, c); }}
                                className="text-[8px] font-mono hover:text-accent-primary bg-bg-secondary px-1 border border-border-custom rounded"
                              >
                                {c.charAt(0)}
                              </button>
                            ))}
                          </div>
                        )}
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
                  <span className={`font-mono text-[9px] px-2 py-0.5 border rounded uppercase ${getPriorityColor(activeTask.priority)}`}>
                    {activeTask.priority} Priority
                  </span>
                  <h2 className="font-sans text-lg font-bold text-text-primary tracking-tight leading-snug">
                    {activeTask.title}
                  </h2>
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
