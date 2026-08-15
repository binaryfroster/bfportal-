"use client";

import * as React from "react";
import { GitPullRequest, Plus, Clock, AlertTriangle, CheckCircle2, DollarSign } from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

export default function ChangeRequestsPage() {
  const { user } = useUser();
  const { changeRequests, createChangeRequest } = usePortalData();

  const [showModal, setShowModal] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [businessImpact, setBusinessImpact] = React.useState("");
  const [priority, setPriority] = React.useState<"Low" | "Medium" | "High" | "Critical">("Medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    createChangeRequest({
      projectId: "project-swap",
      title,
      description,
      priority,
      businessImpact,
      estimatedCost: 3500,
      estimatedHours: 18,
      status: "Submitted",
      requestedByName: user?.name || "John Sterling",
    });

    setShowModal(false);
    setTitle("");
    setDescription("");
    setBusinessImpact("");
    toast.success("Change request submitted for engineering scope evaluation");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <GitPullRequest className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // SCOPE CHANGE REQUEST PIPELINE
          </span>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          variant="accent"
          className="font-mono text-xs uppercase font-bold cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          NEW CHANGE REQUEST
        </Button>
      </div>

      {/* Change Requests List */}
      <div className="space-y-4">
        {changeRequests.map((cr) => (
          <Card key={cr.id} className="bg-bg-card border-border-custom p-6 space-y-4">
            <div className="flex flex-wrap justify-between items-start gap-4 pb-3 border-b border-border-custom/50">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Badge variant="cyan" className="font-mono text-[9px]">
                    {cr.id}
                  </Badge>
                  <h3 className="font-sans text-base font-bold text-white">{cr.title}</h3>
                </div>
                <p className="font-mono text-[10px] text-text-muted">
                  Requested by {cr.requestedByName} on {new Date(cr.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    cr.status === "Completed"
                      ? "success"
                      : cr.status === "In Progress"
                      ? "cyan"
                      : "warning"
                  }
                  className="font-mono text-[9px]"
                >
                  {cr.status}
                </Badge>
              </div>
            </div>

            <p className="font-sans text-xs text-text-secondary leading-relaxed">
              {cr.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[10px]">
              <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input">
                <span className="text-text-muted uppercase block">// BUSINESS IMPACT</span>
                <span className="text-white">{cr.businessImpact || "Standard enhancement"}</span>
              </div>
              <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input">
                <span className="text-text-muted uppercase block">// ESTIMATED COST</span>
                <span className="text-accent-primary font-bold">${cr.estimatedCost.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input">
                <span className="text-text-muted uppercase block">// ESTIMATED DURATION</span>
                <span className="text-white">{cr.estimatedHours} Hours Scope</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <Card className="w-full max-w-lg bg-bg-card border-border-custom p-6 space-y-4">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              // SUBMIT SCOPE CHANGE REQUEST
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                  Change Request Title
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Add Multi-Currency Settlement Support..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                  Detailed Scope Specifications
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the feature or workflow modification required..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white p-3 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                  Business Impact Rationale
                </label>
                <input
                  type="text"
                  placeholder="e.g. Necessary for UK/US market compliance..."
                  value={businessImpact}
                  onChange={(e) => setBusinessImpact(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-bg-secondary text-text-muted hover:text-white font-mono text-xs rounded-input cursor-pointer"
                >
                  [CANCEL]
                </button>
                <Button type="submit" variant="accent" className="font-mono text-xs font-bold uppercase cursor-pointer">
                  SUBMIT REQUEST
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
