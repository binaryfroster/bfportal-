"use client";

import * as React from "react";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Layers,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Github,
  Globe,
  Server,
  User,
  Shield,
  Edit,
  Trash2,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Check,
  X,
  RefreshCw,
  Sliders,
  ChevronRight,
  Briefcase,
  GitPullRequest,
  KeyRound,
  FileText,
  Activity,
  Send,
  Zap,
} from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { AdminClientProject, ProjectPhase, ProjectStatus } from "@/src/types";
import { formatCurrency } from "@/src/lib/utils";
import { exportToCSV } from "@/src/lib/export";
import toast from "react-hot-toast";

const PHASES: ProjectPhase[] = ["Discover", "Design", "Build", "Test", "Launch", "Support"];
const STATUSES: ProjectStatus[] = ["Active", "In Review", "Launching", "On Hold", "Completed", "Archived"];

export default function AdminProjectsPage() {
  const { user } = useUser();
  const {
    adminProjects,
    project: activeContextProject,
    createAdminProject,
    updateAdminProject,
    deleteAdminProject,
    switchActiveProject,
    createMilestone,
    updateMilestone,
    tasks,
    createInvoice,
    invoices,
  } = usePortalData();

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("");
  const [phaseFilter, setPhaseFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");

  // Modals
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<AdminClientProject | null>(null);
  const [milestoneTargetProject, setMilestoneTargetProject] = React.useState<AdminClientProject | null>(null);
  const [taskTargetProject, setTaskTargetProject] = React.useState<AdminClientProject | null>(null);
  const [invoiceTargetProject, setInvoiceTargetProject] = React.useState<AdminClientProject | null>(null);
  const [auditDrawerProject, setAuditDrawerProject] = React.useState<AdminClientProject | null>(null);

  // New Project Form State
  const [newProject, setNewProject] = React.useState({
    name: "",
    companyName: "",
    clientName: "",
    clientEmail: "",
    description: "",
    phase: "Discover" as ProjectPhase,
    progress: 10,
    budget: 50000,
    spent: 0,
    startDate: new Date().toISOString().split("T")[0],
    targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Active" as ProjectStatus,
    leadEngineer: "Shivam Dube",
    projectManager: "Digvijay Kadam",
    designer: "Jawad Khan Hakim",
    repositoryUrl: "",
    stagingUrl: "",
    productionUrl: "",
    techStack: "Next.js 15, TypeScript, PostgreSQL, Tailwind CSS",
    upcomingMilestoneName: "Architecture Discovery & Technical Specification",
    upcomingMilestoneDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  // New Milestone Form State
  const [newMilestoneTitle, setNewMilestoneTitle] = React.useState("");
  const [newMilestoneDesc, setNewMilestoneDesc] = React.useState("");
  const [newMilestoneDate, setNewMilestoneDate] = React.useState("");

  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newTaskDesc, setNewTaskDesc] = React.useState("");
  const [newTaskAssignee, setNewTaskAssignee] = React.useState("Shivam Dube");
  const [newTaskPriority, setNewTaskPriority] = React.useState<"Low" | "Medium" | "High" | "Critical">("High");
  const [newTaskDueDate, setNewTaskDueDate] = React.useState("");

  // New Invoice Form State
  const [newInvDesc, setNewInvDesc] = React.useState("");
  const [newInvAmount, setNewInvAmount] = React.useState("");
  const [newInvDueDate, setNewInvDueDate] = React.useState("");

  // Filtered list
  const filteredProjects = React.useMemo(() => {
    return adminProjects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.leadEngineer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPhase = phaseFilter === "ALL" || p.phase === phaseFilter;
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

      return matchesSearch && matchesPhase && matchesStatus;
    });
  }, [adminProjects, searchQuery, phaseFilter, statusFilter]);

  // Aggregate Metrics
  const totalProjects = adminProjects.length;
  const activeProjects = adminProjects.filter((p) => p.status === "Active" || p.status === "Launching").length;
  const totalPortfolioValue = adminProjects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalSpentPortfolio = adminProjects.reduce((acc, p) => acc + (p.spent || 0), 0);
  const avgProgress = totalProjects > 0 ? Math.round(adminProjects.reduce((acc, p) => acc + p.progress, 0) / totalProjects) : 0;

  // Handlers
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.companyName) {
      toast.error("Please enter Project Name and Client Company Name");
      return;
    }

    createAdminProject({
      name: newProject.name,
      companyName: newProject.companyName,
      clientName: newProject.clientName || "Client Lead",
      clientEmail: newProject.clientEmail || "client@domain.com",
      clientId: `client-${Date.now()}`,
      organizationId: `org-${Date.now()}`,
      description: newProject.description || "Client engagement managed through Binary Froster Portal.",
      phase: newProject.phase,
      progress: Number(newProject.progress) || 10,
      budget: Number(newProject.budget) || 50000,
      spent: Number(newProject.spent) || 0,
      startDate: newProject.startDate,
      targetEndDate: newProject.targetEndDate,
      status: newProject.status,
      leadEngineer: newProject.leadEngineer,
      projectManager: newProject.projectManager,
      designer: newProject.designer,
      repositoryUrl: newProject.repositoryUrl,
      stagingUrl: newProject.stagingUrl,
      productionUrl: newProject.productionUrl,
      techStack: newProject.techStack.split(",").map((s) => s.trim()).filter(Boolean),
      upcomingMilestoneName: newProject.upcomingMilestoneName || "Architecture Blueprint Signoff",
      upcomingMilestoneDate: newProject.upcomingMilestoneDate || newProject.targetEndDate,
    });

    toast.success(`Client Project "${newProject.name}" provisioned!`);
    setShowCreateModal(false);
    setNewProject({
      name: "",
      companyName: "",
      clientName: "",
      clientEmail: "",
      description: "",
      phase: "Discover",
      progress: 10,
      budget: 50000,
      spent: 0,
      startDate: new Date().toISOString().split("T")[0],
      targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Active",
      leadEngineer: "Shivam Dube",
      projectManager: "Digvijay Kadam",
      designer: "Jawad Khan Hakim",
      repositoryUrl: "",
      stagingUrl: "",
      productionUrl: "",
      techStack: "Next.js 15, TypeScript, PostgreSQL, Tailwind CSS",
      upcomingMilestoneName: "Architecture Discovery & Technical Specification",
      upcomingMilestoneDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    updateAdminProject(editingProject.id, {
      name: editingProject.name,
      companyName: editingProject.companyName,
      clientName: editingProject.clientName,
      clientEmail: editingProject.clientEmail,
      description: editingProject.description,
      phase: editingProject.phase,
      progress: Number(editingProject.progress),
      budget: Number(editingProject.budget),
      spent: Number(editingProject.spent),
      startDate: editingProject.startDate,
      targetEndDate: editingProject.targetEndDate,
      status: editingProject.status,
      leadEngineer: editingProject.leadEngineer,
      projectManager: editingProject.projectManager,
      designer: editingProject.designer,
      repositoryUrl: editingProject.repositoryUrl,
      stagingUrl: editingProject.stagingUrl,
      productionUrl: editingProject.productionUrl,
      techStack: Array.isArray(editingProject.techStack)
        ? editingProject.techStack
        : String(editingProject.techStack).split(",").map((s) => s.trim()),
      upcomingMilestoneName: editingProject.upcomingMilestoneName,
      upcomingMilestoneDate: editingProject.upcomingMilestoneDate,
    });

    toast.success(`Project "${editingProject.name}" updated successfully!`);
    setEditingProject(null);
  };

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTargetProject || !newMilestoneTitle) return;

    createMilestone({
      id: `m-${Date.now()}`,
      title: newMilestoneTitle,
      description: newMilestoneDesc || "Milestone deliverable for client project.",
      dueDate: newMilestoneDate || milestoneTargetProject.targetEndDate,
      completedDate: null,
      status: "Upcoming",
      order: 10,
    });

    toast.success(`Milestone added to ${milestoneTargetProject.name}`);
    setNewMilestoneTitle("");
    setNewMilestoneDesc("");
    setNewMilestoneDate("");
    setMilestoneTargetProject(null);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceTargetProject || !newInvDesc || !newInvAmount) return;

    const amt = parseFloat(newInvAmount);
    createInvoice({
      id: `inv-${Date.now()}`,
      invoiceNumber: `BF-${new Date().getFullYear()}-00${invoices.length + 1}`,
      description: `${invoiceTargetProject.name}: ${newInvDesc}`,
      amount: amt,
      total: amt,
      tax: 0,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: newInvDueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Sent",
      lineItems: [{ description: newInvDesc, amount: amt }],
      paidAt: null,
    });

    toast.success(`Invoice for ${formatCurrency(amt)} issued to ${invoiceTargetProject.companyName}`);
    setNewInvDesc("");
    setNewInvAmount("");
    setNewInvDueDate("");
    setInvoiceTargetProject(null);
  };

  const handleExportCSV = () => {
    if (!adminProjects.length) {
      toast.error("No project records to export");
      return;
    }
    exportToCSV(
      adminProjects.map((p) => ({
        ProjectID: p.id,
        ProjectName: p.name,
        ClientCompany: p.companyName,
        ClientContact: p.clientName,
        ClientEmail: p.clientEmail,
        Phase: p.phase,
        Progress: `${p.progress}%`,
        Budget: p.budget,
        Spent: p.spent,
        Status: p.status,
        LeadEngineer: p.leadEngineer,
        ProjectManager: p.projectManager,
        StartDate: p.startDate,
        TargetEndDate: p.targetEndDate,
        NextMilestone: p.upcomingMilestoneName,
        NextMilestoneDate: p.upcomingMilestoneDate,
      })),
      "binary_froster_client_projects_matrix"
    );
    toast.success("Projects matrix exported to CSV");
  };

  const getPhaseIndex = (p: ProjectPhase) => PHASES.indexOf(p);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-border-custom/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-accent-primary animate-pulse" />
            <h1 className="font-mono text-xs text-text-secondary uppercase tracking-widest">
              // ADMIN CLIENT PROJECTS COMMAND CENTER
            </h1>
          </div>
          <p className="text-xs font-mono text-text-muted">
            Multi-client project orchestration, phase lifecycle management, and resource allocation
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="text-[10px] font-mono font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            EXPORT CSV
          </button>

          <Link
            href="/proposals"
            className="text-[10px] font-mono font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
            PROPOSAL ENGINE &rarr;
          </Link>

          <Link
            href="/admin"
            className="text-[10px] font-mono font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
          >
            <Shield className="w-3.5 h-3.5 text-accent-primary" />
            OPERATIONS HUB &rarr;
          </Link>

          <Button
            onClick={() => setShowCreateModal(true)}
            variant="accent"
            size="sm"
            className="text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            PROVISION NEW PROJECT
          </Button>
        </div>
      </div>

      {/* KPI Portfolio Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-bg-card border-border-custom p-4 space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-mono text-[9px] uppercase tracking-wider">Total Client Projects</span>
            <FolderKanban className="w-4 h-4 text-accent-primary" />
          </div>
          <div className="text-2xl font-bold font-sans text-white">{totalProjects}</div>
          <span className="font-mono text-[9px] text-emerald-400 block">100% Provisioned</span>
        </Card>

        <Card className="bg-bg-card border-border-custom p-4 space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-mono text-[9px] uppercase tracking-wider">Active Engagements</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-sans text-emerald-400">{activeProjects}</div>
          <span className="font-mono text-[9px] text-text-muted block">In Build / Launch</span>
        </Card>

        <Card className="bg-bg-card border-border-custom p-4 space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-mono text-[9px] uppercase tracking-wider">Portfolio Contract Value</span>
            <DollarSign className="w-4 h-4 text-accent-primary" />
          </div>
          <div className="text-2xl font-bold font-sans text-white">{formatCurrency(totalPortfolioValue)}</div>
          <span className="font-mono text-[9px] text-text-secondary block">{formatCurrency(totalSpentPortfolio)} Disbursed</span>
        </Card>

        <Card className="bg-bg-card border-border-custom p-4 space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-mono text-[9px] uppercase tracking-wider">Avg Completion Velocity</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-sans text-cyan-400">{avgProgress}%</div>
          <div className="w-full bg-bg-secondary h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-accent-primary h-full rounded-full transition-all duration-500" style={{ width: `${avgProgress}%` }} />
          </div>
        </Card>

        <Card className="bg-bg-card border-border-custom p-4 space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-mono text-[9px] uppercase tracking-wider">Active Context Workspace</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold font-sans text-white truncate">
            {activeContextProject?.name || "None Selected"}
          </div>
          <span className="font-mono text-[9px] text-accent-primary block">
            {activeContextProject?.phase ? `Phase: ${activeContextProject.phase}` : "Standard Mode"}
          </span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-bg-card border border-border-custom p-3 rounded-card flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by project, client company, engineer, tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-bg-secondary border border-border-custom rounded-input text-xs font-mono text-white placeholder-text-muted focus:border-accent-primary outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-muted shrink-0" />
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="bg-bg-secondary border border-border-custom rounded-input text-xs font-mono text-text-secondary px-2.5 py-1.5 focus:border-accent-primary outline-none cursor-pointer"
            >
              <option value="ALL">All Phases</option>
              {PHASES.map((p) => (
                <option key={p} value={p}>Phase: {p}</option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-bg-secondary border border-border-custom rounded-input text-xs font-mono text-text-secondary px-2.5 py-1.5 focus:border-accent-primary outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>Status: {s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 self-end md:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded transition-all cursor-pointer font-mono text-xs ${
              viewMode === "grid" ? "bg-accent-primary text-bg-primary font-bold" : "bg-bg-secondary text-text-muted hover:text-white"
            }`}
            title="Grid Cards View"
          >
            GRID
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded transition-all cursor-pointer font-mono text-xs ${
              viewMode === "table" ? "bg-accent-primary text-bg-primary font-bold" : "bg-bg-secondary text-text-muted hover:text-white"
            }`}
            title="Dense Table Matrix View"
          >
            TABLE
          </button>
        </div>
      </div>

      {/* Projects List / Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-bg-card border border-dashed border-border-custom p-12 text-center rounded-card space-y-3">
          <FolderKanban className="w-10 h-10 text-text-muted mx-auto" />
          <p className="font-mono text-xs text-text-secondary">No client projects found matching current filters.</p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setPhaseFilter("ALL");
              setStatusFilter("ALL");
            }}
            variant="secondary"
            size="sm"
            className="text-xs font-mono"
          >
            RESET ALL FILTERS
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const isCurrentActive = activeContextProject?.id === project.id;
            const currentPhaseIdx = getPhaseIndex(project.phase);

            return (
              <Card
                key={project.id}
                className={`bg-bg-card border transition-all duration-200 p-6 flex flex-col justify-between space-y-5 ${
                  isCurrentActive
                    ? "border-accent-primary shadow-glow ring-1 ring-accent-primary/30"
                    : "border-border-custom hover:border-border-custom/80"
                }`}
              >
                {/* Header & Badges */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-sans text-base font-bold text-white tracking-wide">
                          {project.name}
                        </h2>
                        {isCurrentActive && (
                          <Badge variant="accent" className="font-mono text-[9px] px-1.5 py-0.5">
                            ACTIVE WORKSPACE
                          </Badge>
                        )}
                      </div>
                      <span className="font-mono text-xs text-text-secondary block mt-0.5">
                        {project.companyName} • Contact: {project.clientName} ({project.clientEmail})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant={
                          project.status === "Active"
                            ? "success"
                            : project.status === "Launching"
                            ? "accent"
                            : project.status === "In Review"
                            ? "warning"
                            : "outline"
                        }
                        className="font-mono text-[9px]"
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs font-sans text-text-muted line-clamp-2">
                    {project.description}
                  </p>

                  {/* 6-Phase Stepper */}
                  <div className="space-y-1.5 pt-2 border-t border-border-custom/40">
                    <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                      <span>PHASE STEPPER:</span>
                      <span className="text-accent-primary font-bold">{project.phase.toUpperCase()} ({project.progress}%)</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1.5">
                      {PHASES.map((pName, idx) => {
                        const isPast = idx < currentPhaseIdx;
                        const isCurrent = idx === currentPhaseIdx;
                        return (
                          <div
                            key={pName}
                            title={`Phase ${idx + 1}: ${pName}`}
                            className={`h-2 rounded-sm transition-all ${
                              isPast
                                ? "bg-brand-success"
                                : isCurrent
                                ? "bg-accent-primary animate-pulse"
                                : "bg-bg-secondary border border-border-custom/40"
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-text-muted uppercase">
                      <span>1. Discover</span>
                      <span>3. Build</span>
                      <span>6. Support</span>
                    </div>
                  </div>

                  {/* Financials & Dates Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                    <div className="p-2 bg-bg-secondary/40 border border-border-custom/40 rounded">
                      <span className="text-[9px] text-text-muted uppercase block">Total Budget</span>
                      <span className="font-bold text-white">{formatCurrency(project.budget)}</span>
                    </div>
                    <div className="p-2 bg-bg-secondary/40 border border-border-custom/40 rounded">
                      <span className="text-[9px] text-text-muted uppercase block">Spent / Disbursed</span>
                      <span className="font-bold text-emerald-400">{formatCurrency(project.spent)}</span>
                    </div>
                    <div className="p-2 bg-bg-secondary/40 border border-border-custom/40 rounded">
                      <span className="text-[9px] text-text-muted uppercase block">Target Launch</span>
                      <span className="text-text-secondary">{project.targetEndDate}</span>
                    </div>
                    <div className="p-2 bg-bg-secondary/40 border border-border-custom/40 rounded">
                      <span className="text-[9px] text-text-muted uppercase block">Lead Engineer</span>
                      <span className="text-accent-primary font-semibold truncate block">{project.leadEngineer}</span>
                    </div>
                  </div>

                  {/* Upcoming Milestone Callout */}
                  <div className="p-2.5 bg-bg-secondary/60 border border-border-custom/60 rounded flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-mono text-[10px] text-text-secondary truncate">
                        Next: <strong className="text-white">{project.upcomingMilestoneName}</strong>
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-amber-400 shrink-0 font-bold">
                      {project.upcomingMilestoneDate}
                    </span>
                  </div>

                  {/* Tech Stack Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[9px] font-mono px-2 py-0.5 bg-bg-secondary border border-border-custom rounded text-text-muted"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* External Links */}
                  <div className="flex items-center gap-3 pt-2 text-[10px] font-mono text-text-muted border-t border-border-custom/30">
                    {project.repositoryUrl && (
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-accent-primary flex items-center gap-1"
                      >
                        <Github className="w-3 h-3" /> Repo
                      </a>
                    )}
                    {project.stagingUrl && (
                      <a
                        href={project.stagingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-accent-primary flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" /> Staging
                      </a>
                    )}
                    {project.productionUrl && (
                      <a
                        href={project.productionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-emerald-400 flex items-center gap-1 text-emerald-400/80"
                      >
                        <Server className="w-3 h-3" /> Production
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Toolbar */}
                <div className="pt-4 border-t border-border-custom/60 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {!isCurrentActive ? (
                      <button
                        onClick={() => {
                          switchActiveProject(project.id);
                          toast.success(`Switched portal workspace to ${project.name}`);
                        }}
                        className="text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30"
                      >
                        <Zap className="w-3 h-3" />
                        SET AS ACTIVE WORKSPACE
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1.5 rounded bg-brand-success/15 text-brand-success border border-brand-success/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> ACTIVE WORKSPACE
                      </span>
                    )}

                    <button
                      onClick={() => setEditingProject(project)}
                      className="text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-secondary hover:text-white border border-border-custom"
                    >
                      <Edit className="w-3 h-3" />
                      SPECS & PHASE
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setMilestoneTargetProject(project)}
                      className="text-[10px] font-mono font-bold px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
                      title="Add Milestone"
                    >
                      <Calendar className="w-3 h-3" />
                      + MILESTONE
                    </button>

                    <button
                      onClick={() => setInvoiceTargetProject(project)}
                      className="text-[10px] font-mono font-bold px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
                      title="Issue Invoice"
                    >
                      <DollarSign className="w-3 h-3" />
                      + INVOICE
                    </button>

                    <Link
                      href="/proposals"
                      className="text-[10px] font-mono font-bold px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30"
                      title="Draft Proposal for this Client"
                    >
                      <Sparkles className="w-3 h-3" />
                      PROPOSAL
                    </Link>

                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete or archive project "${project.name}"?`)) {
                          deleteAdminProject(project.id);
                          toast.success(`Project ${project.name} archived`);
                        }
                      }}
                      className="p-1.5 rounded transition-colors cursor-pointer bg-bg-secondary hover:bg-red-500/20 text-text-muted hover:text-red-400 border border-border-custom"
                      title="Archive / Delete Project"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table Matrix View */
        <Card className="bg-bg-card border-border-custom overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-custom/60 font-mono text-[10px] text-text-muted uppercase tracking-wider bg-bg-secondary/20">
                  <th className="p-4">Project & Client</th>
                  <th className="p-4">Phase & Stepper</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4">Budget / Spent</th>
                  <th className="p-4">Lead Eng</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/40 font-mono">
                {filteredProjects.map((project) => {
                  const isCurrentActive = activeContextProject?.id === project.id;
                  return (
                    <tr
                      key={project.id}
                      className={`hover:bg-bg-secondary/20 transition-colors ${
                        isCurrentActive ? "bg-accent-primary/5" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-bold font-sans text-white text-sm">{project.name}</div>
                        <div className="text-[10px] text-text-secondary">{project.companyName} • {project.clientName}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="accent" className="font-mono text-[9px]">
                          {project.phase}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>{project.progress}%</span>
                          <div className="w-16 bg-bg-secondary h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-accent-primary h-full rounded-full"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-bold">{formatCurrency(project.budget)}</div>
                        <div className="text-[10px] text-emerald-400">{formatCurrency(project.spent)} spent</div>
                      </td>
                      <td className="p-4 text-accent-primary font-semibold">{project.leadEngineer}</td>
                      <td className="p-4">
                        <Badge
                          variant={project.status === "Active" ? "success" : "outline"}
                          className="font-mono text-[8px]"
                        >
                          {project.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isCurrentActive ? (
                            <button
                              onClick={() => {
                                switchActiveProject(project.id);
                                toast.success(`Active workspace set to ${project.name}`);
                              }}
                              className="p-1.5 rounded transition-all cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30"
                              title="Set as Active Workspace"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="p-1.5 rounded bg-brand-success/15 text-brand-success border border-brand-success/30">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}

                          <button
                            onClick={() => setEditingProject(project)}
                            className="p-1.5 rounded transition-all cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-secondary hover:text-white border border-border-custom"
                            title="Edit Project Specs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ────────────────────────────────────────────── */}
      {/* MODAL: PROVISION NEW CLIENT PROJECT WIZARD */}
      {/* ────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0F172A] border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-accent-primary" />
                <h3 className="font-sans text-base font-bold text-white">Provision New Client Project</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex AI Voice Dispatch Engine"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Client Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Digital Media Inc."
                    value={newProject.companyName}
                    onChange={(e) => setNewProject({ ...newProject, companyName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Client Primary Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. Marcus Vance"
                    value={newProject.clientName}
                    onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Client Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. marcus@apexdigital.com"
                    value={newProject.clientEmail}
                    onChange={(e) => setNewProject({ ...newProject, clientEmail: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase">Project Scope & Description</label>
                <textarea
                  rows={2}
                  placeholder="Architectural overview, project objectives, and client deliverables..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Initial Phase</label>
                  <select
                    value={newProject.phase}
                    onChange={(e) => setNewProject({ ...newProject, phase: e.target.value as ProjectPhase })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  >
                    {PHASES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Total Budget ($)</label>
                  <input
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Target Launch Date</label>
                  <input
                    type="date"
                    value={newProject.targetEndDate}
                    onChange={(e) => setNewProject({ ...newProject, targetEndDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Lead Engineer</label>
                  <input
                    type="text"
                    value={newProject.leadEngineer}
                    onChange={(e) => setNewProject({ ...newProject, leadEngineer: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Project Manager</label>
                  <input
                    type="text"
                    value={newProject.projectManager}
                    onChange={(e) => setNewProject({ ...newProject, projectManager: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">UI/UX Designer</label>
                  <input
                    type="text"
                    value={newProject.designer}
                    onChange={(e) => setNewProject({ ...newProject, designer: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js 15, Go, PyTorch, PostgreSQL, AWS"
                  value={newProject.techStack}
                  onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  className="font-mono text-xs uppercase tracking-wider"
                >
                  PROVISION PROJECT &rarr;
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────── */}
      {/* MODAL: EDIT PROJECT SPECS & PHASE */}
      {/* ────────────────────────────────────────────── */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0F172A] border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-accent-primary" />
                <h3 className="font-sans text-base font-bold text-white">Edit Project Specs & Phase Lifecycle</h3>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Project Name</label>
                  <input
                    type="text"
                    required
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Client Company</label>
                  <input
                    type="text"
                    required
                    value={editingProject.companyName}
                    onChange={(e) => setEditingProject({ ...editingProject, companyName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Phase</label>
                  <select
                    value={editingProject.phase}
                    onChange={(e) => {
                      const newP = e.target.value as ProjectPhase;
                      const phaseProgressDefaults: Record<ProjectPhase, number> = {
                        Discover: 15,
                        Design: 35,
                        Build: 65,
                        Test: 85,
                        Launch: 95,
                        Support: 100,
                      };
                      setEditingProject({
                        ...editingProject,
                        phase: newP,
                        progress: phaseProgressDefaults[newP] || editingProject.progress,
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  >
                    {PHASES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Progress ({editingProject.progress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingProject.progress}
                    onChange={(e) => setEditingProject({ ...editingProject, progress: Number(e.target.value) })}
                    className="w-full accent-cyan-400 mt-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Status</label>
                  <select
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as ProjectStatus })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Budget ($)</label>
                  <input
                    type="number"
                    value={editingProject.budget}
                    onChange={(e) => setEditingProject({ ...editingProject, budget: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Spent / Disbursed ($)</label>
                  <input
                    type="number"
                    value={editingProject.spent}
                    onChange={(e) => setEditingProject({ ...editingProject, spent: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Target Launch Date</label>
                  <input
                    type="date"
                    value={editingProject.targetEndDate}
                    onChange={(e) => setEditingProject({ ...editingProject, targetEndDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">GitHub Repo URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={editingProject.repositoryUrl || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, repositoryUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Staging URL</label>
                  <input
                    type="url"
                    placeholder="https://staging..."
                    value={editingProject.stagingUrl || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, stagingUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Production URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editingProject.productionUrl || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, productionUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingProject(null)}
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  className="font-mono text-xs uppercase tracking-wider"
                >
                  SAVE SPECIFICATIONS &rarr;
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────── */}
      {/* MODAL: ADD MILESTONE TO PROJECT */}
      {/* ────────────────────────────────────────────── */}
      {milestoneTargetProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent-primary" />
                <h3 className="font-sans text-base font-bold text-white">
                  Add Milestone to {milestoneTargetProject.name}
                </h3>
              </div>
              <button
                onClick={() => setMilestoneTargetProject(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase">Milestone Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build: Core Authentication & RBAC Engine"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase">Description & Deliverables</label>
                <textarea
                  rows={2}
                  placeholder="Deliverable specifications for client sign-off..."
                  value={newMilestoneDesc}
                  onChange={(e) => setNewMilestoneDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase">Target Due Date</label>
                <input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setMilestoneTargetProject(null)}
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                >
                  ADD MILESTONE &rarr;
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────── */}
      {/* MODAL: ISSUE INVOICE FOR CLIENT PROJECT */}
      {/* ────────────────────────────────────────────── */}
      {invoiceTargetProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-400" />
                <h3 className="font-sans text-base font-bold text-white">
                  Issue Invoice to {invoiceTargetProject.companyName}
                </h3>
              </div>
              <button
                onClick={() => setInvoiceTargetProject(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase">Invoice Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build Phase Milestone 2 Signoff Deposit"
                  value={newInvDesc}
                  onChange={(e) => setNewInvDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Amount ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    value={newInvAmount}
                    onChange={(e) => setNewInvAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase">Payment Due Date</label>
                  <input
                    type="date"
                    value={newInvDueDate}
                    onChange={(e) => setNewInvDueDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setInvoiceTargetProject(null)}
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                >
                  DISPATCH INVOICE &rarr;
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
