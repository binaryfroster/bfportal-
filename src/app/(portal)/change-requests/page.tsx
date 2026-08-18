"use client";

import * as React from "react";
import { GitPullRequest, Plus, Clock, AlertTriangle, CheckCircle2, DollarSign, Edit, Play, Check, RotateCcw, X } from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Modal } from "@/src/components/ui/modal";
import toast from "react-hot-toast";
import { ChangeRequest } from "@/src/types";

export default function ChangeRequestsPage() {
  const { user } = useUser();
  const { changeRequests, createChangeRequest, updateChangeRequest } = usePortalData();

  const [showModal, setShowModal] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [businessImpact, setBusinessImpact] = React.useState("");
  const [priority, setPriority] = React.useState<"Low" | "Medium" | "High" | "Critical">("Medium");

  // Edit states
  const [editingCR, setEditingCR] = React.useState<ChangeRequest | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editDesc, setEditDesc] = React.useState("");
  const [editImpact, setEditImpact] = React.useState("");
  const [editCost, setEditCost] = React.useState("");
  const [editHours, setEditHours] = React.useState("");
  const [editPriority, setEditPriority] = React.useState<ChangeRequest["priority"]>("Medium");
  const [editStatus, setEditStatus] = React.useState<ChangeRequest["status"]>("In Progress");
  const [savingEdit, setSavingEdit] = React.useState(false);

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

  const handleStatusChange = (id: string, status: ChangeRequest["status"]) => {
    updateChangeRequest(id, { status });
    toast.success(`Change request status updated to ${status}`);
  };

  const openEditModal = (cr: ChangeRequest) => {
    setEditingCR(cr);
    setEditTitle(cr.title);
    setEditDesc(cr.description);
    setEditImpact(cr.businessImpact || "");
    setEditCost(String(cr.estimatedCost || 0));
    setEditHours(String(cr.estimatedHours || 0));
    setEditPriority(cr.priority);
    setEditStatus(cr.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCR || !editTitle) return;

    setSavingEdit(true);
    updateChangeRequest(editingCR.id, {
      title: editTitle,
      description: editDesc,
      businessImpact: editImpact,
      estimatedCost: parseFloat(editCost) || 0,
      estimatedHours: parseFloat(editHours) || 0,
      priority: editPriority,
      status: editStatus,
    });
    setSavingEdit(false);
    setEditingCR(null);
    toast.success("Change request specifications updated successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <GitPullRequest className="h-4.5 w-4.5 text-accent-primary" />
          <h1 className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // SCOPE CHANGE REQUEST PIPELINE
          </h1>
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

            {/* ACTION BUTTON ROW */}
            <div className="pt-3 border-t border-border-custom/40 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(cr)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-[10px] uppercase font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <Edit className="h-3 w-3 text-cyan-400" />
                  Edit Request
                </button>

                {cr.status !== "In Progress" && cr.status !== "Completed" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(cr.id, "In Progress")}
                    className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 font-mono text-[10px] uppercase font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="h-3 w-3" />
                    Set In Progress
                  </button>
                )}

                {cr.status !== "Completed" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(cr.id, "Completed")}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-mono text-[10px] uppercase font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-3 w-3 stroke-[2.5]" />
                    Mark as Done
                  </button>
                )}

                {cr.status === "Completed" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(cr.id, "In Progress")}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono text-[10px] uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reopen
                  </button>
                )}
              </div>

              <span className="font-mono text-[9px] text-text-muted uppercase">
                // PRIORITY: {cr.priority}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Change Request Modal */}
      {editingCR && (
        <Modal
          isOpen={!!editingCR}
          onClose={() => setEditingCR(null)}
          title={`// EDIT CHANGE REQUEST: ${editingCR.id}`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-white">
            <div>
              <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                Change Request Title
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
                  <option value="Submitted">Submitted</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  Estimated Cost ($)
                </label>
                <input
                  type="number"
                  value={editCost}
                  onChange={(e) => setEditCost(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2 text-xs rounded-xl outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2 text-xs rounded-xl outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                Business Impact
              </label>
              <input
                type="text"
                value={editImpact}
                onChange={(e) => setEditImpact(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2 text-xs rounded-xl outline-none font-sans"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                Detailed Scope Specifications
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
                onClick={() => setEditingCR(null)}
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
                  placeholder="Describe technical alterations and integration points..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white p-3 text-xs rounded-input outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                    Business Impact Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Compliance / Speed..."
                    value={businessImpact}
                    onChange={(e) => setBusinessImpact(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-mono cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border-custom/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-bg-secondary border border-border-custom text-text-secondary hover:text-white font-mono text-xs uppercase rounded-input cursor-pointer"
                >
                  [CANCEL]
                </button>
                <Button
                  type="submit"
                  variant="accent"
                  className="font-mono text-xs uppercase font-bold cursor-pointer"
                >
                  SUBMIT SPEC
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
