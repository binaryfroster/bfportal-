"use client";

import * as React from "react";
import {
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Terminal,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { formatDate } from "@/src/lib/utils";

// Interface for milestone state
interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completedDate: string | null;
  status: "Upcoming" | "In Progress" | "Completed" | "Delayed";
  order: number;
}

export default function ProjectTrackerPage() {
  const { loading: dataLoading, project, milestones } = usePortalData();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const PHASES = ["Discover", "Design", "Build", "Test", "Launch", "Support"];

  const projectPhase = project?.phase || "Build";
  const loading = dataLoading;

  const currentPhaseIndex = PHASES.indexOf(projectPhase);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusIcon = (status: Milestone["status"]) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-5 w-5 text-brand-success shrink-0" />;
      case "In Progress":
        return <Play className="h-5 w-5 text-accent-primary shrink-0 animate-pulse fill-accent-primary" />;
      case "Delayed":
        return <AlertTriangle className="h-5 w-5 text-brand-error shrink-0" />;
      default:
        return <Clock className="h-5 w-5 text-text-muted shrink-0" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-card border border-border-custom bg-bg-card" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. HORIZONTAL STEPPED PHASES INDICATOR */}
      <Card className="bg-bg-card border-border-custom relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Compass className="h-4 w-4 text-accent-primary mr-2" />
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
            // DEPLOYMENT PHASE STEPPER
          </span>
        </CardHeader>
        <CardContent className="pt-4 overflow-x-auto scrollbar-none">
          <div className="min-w-[700px] flex items-center justify-between relative py-6">
            {/* Background Line */}
            <div className="absolute left-[5%] right-[5%] top-1/2 -translate-y-1/2 h-[2px] bg-border-custom/60 z-0" />

            {/* Saturated progress filling line */}
            <div
              className="absolute left-[5%] top-1/2 -translate-y-1/2 h-[2px] bg-accent-primary z-0 transition-all duration-700 ease-out"
              style={{
                width: `${(currentPhaseIndex / (PHASES.length - 1)) * 90}%`,
              }}
            />

            {PHASES.map((phase, idx) => {
              const isCompleted = idx < currentPhaseIndex;
              const isActive = idx === currentPhaseIndex;
              const isFuture = idx > currentPhaseIndex;

              return (
                <div key={phase} className="flex flex-col items-center text-center z-10 w-[15%]">
                  {/* Step bubble */}
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isCompleted
                        ? "bg-accent-primary border-accent-primary text-bg-primary shadow-glow"
                        : isActive
                        ? "bg-bg-secondary border-accent-primary text-accent-primary cyan-pulse"
                        : "bg-bg-secondary border-border-custom text-text-muted"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                    ) : (
                      <span className="font-mono text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`font-sans text-xs font-semibold mt-3 ${
                      isActive ? "text-accent-primary" : isCompleted ? "text-white" : "text-text-muted"
                    }`}
                  >
                    {phase}
                  </span>

                  {/* Metadata status tag */}
                  <span className="font-mono text-[8px] uppercase text-text-muted mt-1 font-medium">
                    {isCompleted && "Completed"}
                    {isActive && "PULSING [LIVE]"}
                    {isFuture && "Awaiting"}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. EXPANDABLE TIMELINE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-accent-primary" />
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
            // CONTRACTED MILESTONES HISTORY
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
                <button
                  onClick={() => toggleExpand(m.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer outline-none select-none"
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
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-border-custom/50 bg-bg-secondary/20 text-xs text-text-secondary leading-relaxed space-y-3">
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
