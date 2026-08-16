"use client";

import * as React from "react";
import { Sparkles, Building2, User, Phone, Mail, Globe, Shield, Activity, Calendar, FileText, CheckCircle2, Edit, Download, RotateCcw, X } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

export default function Client360Page() {
  const { user } = useUser();
  const { project, milestones, invoices, tickets, maintenancePlan } = usePortalData();

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    companyName: user?.companyName || "Sterling Capital Group",
    name: user?.name || "John Sterling",
    email: user?.email || "john@sterling.com",
    phone: user?.phone || "+44 20 7946 0192"
  });

  const handleExport = () => toast.success('PDF Export queued');
  const handleSchedule = () => toast.success('Redirecting to meetings');
  const handleRefresh = () => toast.success('Health metrics recalculated');
  
  const handleSave = () => {
    setIsEditModalOpen(false);
    toast.success("Contact info updated successfully");
  };

  const healthScore = 96;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // CLIENT 360° RELATIONSHIP MATRIX
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="cyan" className="font-mono text-[9px]">
            ORGANIZATION: {formData.companyName}
          </Badge>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsEditModalOpen(true)} className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30">
              <Edit className="w-3 h-3" /> EDIT
            </button>
            <button onClick={handleExport} className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom">
              <Download className="w-3 h-3" /> EXPORT
            </button>
            <button onClick={handleSchedule} className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom">
              <Calendar className="w-3 h-3" /> SCHEDULE
            </button>
            <button onClick={handleRefresh} className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-brand-success/10 hover:bg-brand-success/25 text-brand-success border border-brand-success/30">
              <RotateCcw className="w-3 h-3" /> REFRESH
            </button>
          </div>
        </div>
      </div>

      {/* Top Grid: Health Score & Org Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Gauge */}
        <Card className="bg-bg-card border-border-custom p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="block font-mono text-[9px] text-text-muted uppercase">
              // CLIENT HEALTH SCORE INDICATOR
            </span>
            <h3 className="font-sans text-lg font-bold text-white">Relationship Health Index</h3>
          </div>

          <div className="my-6 flex items-center justify-center">
            <div className="relative w-36 h-36 rounded-full border-4 border-accent-primary/20 flex flex-col items-center justify-center shadow-glow">
              <span className="font-mono text-4xl font-extrabold text-white">{healthScore}</span>
              <span className="font-mono text-[9px] text-accent-primary uppercase tracking-widest mt-1">
                / 100 HEALTHY
              </span>
            </div>
          </div>

          <div className="p-3 bg-brand-success/10 border border-brand-success/20 rounded-input font-mono text-[10px] text-brand-success leading-relaxed">
            [OPTIMAL] Milestones completed on schedule. No overdue invoices. SLA response targets 100% met.
          </div>
        </Card>

        {/* Company Profile Details */}
        <Card className="lg:col-span-2 bg-bg-card border-border-custom p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-border-custom/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded bg-bg-secondary border border-border-custom flex items-center justify-center font-bold text-accent-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans text-base font-bold text-white">
                  {formData.companyName}
                </h3>
                <p className="font-mono text-[10px] text-text-muted uppercase">
                  FINANCIAL SERVICES & ALGORITHMIC TRADING
                </p>
              </div>
            </div>
            <Badge variant="success" className="font-mono text-[9px]">
              TIER 1 ENTERPRISE CLIENT
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-text-secondary">
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input space-y-1">
              <span className="text-[9px] text-text-muted uppercase block">// PRIMARY CONTACT OFFICER</span>
              <p className="text-white font-semibold flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-accent-primary" /> {formData.name}
              </p>
            </div>
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input space-y-1">
              <span className="text-[9px] text-text-muted uppercase block">// OFFICIAL EMAIL NODE</span>
              <p className="text-white font-semibold flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-accent-primary" /> {formData.email}
              </p>
            </div>
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input space-y-1">
              <span className="text-[9px] text-text-muted uppercase block">// TELEPHONE CONTACT</span>
              <p className="text-white font-semibold flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-accent-primary" /> {formData.phone}
              </p>
            </div>
            <div className="p-3 bg-bg-secondary/40 border border-border-custom/50 rounded-input space-y-1">
              <span className="text-[9px] text-text-muted uppercase block">// DESIGNATED ACCOUNT MANAGER</span>
              <p className="text-white font-semibold flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-accent-primary" /> Shivam Dube (Founder & AI Lead)
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Aggregate Modules Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-bg-card border-border-custom p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] text-text-muted uppercase">// ACTIVE DEPLOYMENT</span>
            <Activity className="h-4 w-4 text-accent-primary" />
          </div>
          <p className="font-sans text-sm font-bold text-white">{project?.name || "SWAP Core Platform"}</p>
          <div className="flex justify-between font-mono text-[10px]">
            <span className="text-text-muted">Phase: {project?.phase || "Build"}</span>
            <span className="text-accent-primary font-bold">{project?.progress || 68}% Complete</span>
          </div>
        </Card>

        <Card className="bg-bg-card border-border-custom p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] text-text-muted uppercase">// SLA CARE COVERAGE</span>
            <Shield className="h-4 w-4 text-brand-success" />
          </div>
          <p className="font-sans text-sm font-bold text-white">{maintenancePlan?.planName || "Platinum SLA"}</p>
          <div className="flex justify-between font-mono text-[10px]">
            <span className="text-text-muted">SLA Response: &lt;1 Hour</span>
            <span className="text-brand-success font-bold">Uptime: 99.95%</span>
          </div>
        </Card>

        <Card className="bg-bg-card border-border-custom p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] text-text-muted uppercase">// FINANCES OVERVIEW</span>
            <FileText className="h-4 w-4 text-accent-primary" />
          </div>
          <p className="font-sans text-sm font-bold text-white">$70,000 Total Billed</p>
          <div className="flex justify-between font-mono text-[10px]">
            <span className="text-text-muted">Paid: $35,000</span>
            <span className="text-amber-400 font-bold">Pending: $35,000</span>
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-bg-card border border-border-custom rounded-card p-6 shadow-glow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-mono text-xs uppercase tracking-wider text-accent-primary font-bold">Edit Contact Info</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-text-muted hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] text-text-muted uppercase">Company Name</label>
                <input 
                  type="text" 
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] text-text-muted uppercase">Primary Contact</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] text-text-muted uppercase">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] text-text-muted uppercase">Phone Number</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsEditModalOpen(false)} className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom">
                [CANCEL]
              </button>
              <button onClick={handleSave} className="bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs uppercase font-bold rounded-input shadow-glow px-4 py-2">
                SAVE CHANGES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
