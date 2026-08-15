import { useState, useEffect } from "react";
import { Project, Milestone } from "../types";
import { api } from "../lib/api";
import { Compass, Calendar, CheckCircle2, PlayCircle, Clock, AlertTriangle, ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProjectTrackerProps {
  project: Project;
}

export default function ProjectTracker({ project }: ProjectTrackerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const PHASES = ["Discover", "Design", "Build", "Test", "Launch", "Support"];

  useEffect(() => {
    async function loadMilestones() {
      if (!project) return;
      try {
        const list = await api.getMilestones(project.id);
        setMilestones(list);
      } catch (err) {
        console.error("Failed loading milestones:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMilestones();
    
    // Polling simulation every 15s for admin real-time modifications
    const interval = setInterval(loadMilestones, 15000);
    return () => clearInterval(interval);
  }, [project]);

  // Determine completed phase index
  const currentPhaseIndex = PHASES.indexOf(project.phase);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="bg-bg-card border border-border-custom p-6 rounded-card animate-pulse space-y-6">
        <div className="h-12 bg-bg-secondary rounded-input"></div>
        <div className="space-y-4">
          <div className="h-20 bg-bg-secondary rounded-input"></div>
          <div className="h-20 bg-bg-secondary rounded-input"></div>
          <div className="h-20 bg-bg-secondary rounded-input"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. HORIZONTAL STEPPED PHASES INDICATOR */}
      <div className="bg-bg-card border border-border-custom p-8 rounded-card relative overflow-hidden card-glowing-hover">
        <div className="absolute top-0 right-0 h-32 w-32 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-2 mb-8">
          <Compass className="h-4 w-4 text-accent-primary" />
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">// DEPLOYMENT PHASE STEPPER</span>
        </div>

        {/* Phase Stepper Wrapper */}
        <div className="relative w-full overflow-x-auto pb-4 pt-2">
          <div className="min-w-[700px] flex items-center justify-between relative">
            {/* Background Line */}
            <div className="absolute left-[5%] right-[5%] top-4 h-[2px] bg-border-custom/60 z-0"></div>
            
            {/* Saturated progress filling line */}
            <div 
              className="absolute left-[5%] top-4 h-[2px] bg-accent-primary z-0 transition-all duration-700 ease-out"
              style={{
                width: `${(currentPhaseIndex / (PHASES.length - 1)) * 90}%`
              }}
            ></div>

            {PHASES.map((phase, idx) => {
              const isCompleted = idx < currentPhaseIndex;
              const isActive = idx === currentPhaseIndex;
              const isFuture = idx > currentPhaseIndex;

              return (
                <div key={phase} className="flex flex-col items-center text-center z-10 w-[15%]">
                  {/* Step bubble */}
                  <div className={`h-8.5 w-8.5 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isCompleted ? "bg-accent-primary border-accent-primary text-bg-primary shadow-glow" :
                    isActive ? "bg-bg-secondary border-accent-primary text-accent-primary cyan-pulse" :
                    "bg-bg-secondary border-border-custom text-text-muted"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-4.5 w-4.5 stroke-[2.5]" />
                    ) : (
                      <span className="font-mono text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <span className={`font-sans text-xs font-semibold mt-3 ${
                    isActive ? "text-accent-primary" :
                    isCompleted ? "text-text-primary" :
                    "text-text-muted"
                  }`}>
                    {phase}
                  </span>

                  {/* Small metadata status tag */}
                  <span className="font-mono text-[8px] uppercase text-text-muted mt-1 font-medium">
                    {isCompleted && "Completed"}
                    {isActive && "PULSING [LIVE]"}
                    {isFuture && "Awaiting"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. EXPANDABLE TIMELINE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-accent-primary" />
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">// CONTRACTED MILESTONES HISTORY</span>
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
                <button
                  onClick={() => toggleExpand(m.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer outline-none select-none"
                >
                  <div className="flex items-center gap-4">
                    {/* Status badge and icon */}
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

                  <div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-text-muted" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-text-muted" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-border-custom/50 bg-bg-secondary/40 text-xs text-text-secondary leading-relaxed space-y-3">
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
