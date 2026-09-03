"use client";

import React, { useState } from 'react';
import {
  FileDown,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Copy,
  FolderKanban,
  FileText,
  Share2,
  Sparkles,
  Download,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Proposal, ProposalScopeSection, ProposalPhase, ProposalStatus } from '@/src/types';
import { EditableCostTable } from './editable-cost-table';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { usePortalData } from '@/src/components/providers/portal-data-provider';
import toast from 'react-hot-toast';

interface ProposalDocumentProps {
  proposal: Proposal;
  onUpdate: (updates: Partial<Proposal>) => void;
  readOnly?: boolean;
}

export function ProposalDocument({ proposal, onUpdate, readOnly = false }: ProposalDocumentProps) {
  const { createAdminProject } = usePortalData();
  const [converted, setConverted] = useState(false);
  const [signatoryName, setSignatoryName] = useState(proposal.clientName);

  const handleExportPDF = () => {
    window.print();
  };

  const generateMarkdown = () => {
    const symbol = proposal.currency === 'INR' ? '₹' : proposal.currency === 'GBP' ? '£' : '$';
    return `# BINARY FROSTER TECHNICAL PROPOSAL
Proposal Number: ${proposal.proposalNumber}
Date: ${new Date().toLocaleDateString()}
Valid Until: ${proposal.validUntil}
Prepared For: ${proposal.clientName}

## ${proposal.projectTitle}
Project Archetype: ${proposal.projectType}

---

### 1. Executive Summary
${proposal.executiveSummary}

---

### 2. Scope of Work
${proposal.scopeOfWork
  .filter(item => item.included)
  .map(item => `• **${item.title}**\n  ${item.description}`)
  .join('\n\n')}

---

### 3. Project Phases & Engineering Schedule
${proposal.phases
  .map(
    phase =>
      `#### ${phase.name} (${phase.duration})\n` +
      phase.milestones.map(m => `  - ${m}`).join('\n') +
      `\n  Phase Allocation: ${symbol}${phase.cost.toLocaleString()}`
  )
  .join('\n\n')}

---

### 4. Commercials & Cost Breakdown
${proposal.costBreakdown
  .map(
    item =>
      `• **${item.category}**: ${item.description} (${item.hours} hrs @ ${symbol}${item.rate}/hr) = ${symbol}${item.amount.toLocaleString()}`
  )
  .join('\n')}

**Subtotal:** ${symbol}${proposal.subtotal.toLocaleString()}  
**Estimated Tax (${Math.round((proposal.taxRate || 0.1) * 100)}%):** ${symbol}${proposal.taxAmount.toLocaleString()}  
**Grand Total:** ${symbol}${proposal.grandTotal.toLocaleString()}  

---

### 5. Tangible Deliverables
${proposal.deliverables
  .map(d => `• **${d.name}** [${d.phase}]: ${d.description}`)
  .join('\n')}

---

### 6. Architecture & Technology Stack
${proposal.techStackRecommendation}

---

### 7. Key Assumptions & SLA Guarantees
${proposal.assumptions.map(a => `• ${a}`).join('\n')}

---

### 8. Terms of Engagement & Milestone Payouts
${proposal.termsAndConditions}
`;
  };

  const handleCopyMarkdown = async () => {
    try {
      const md = generateMarkdown();
      await navigator.clipboard.writeText(md);
      toast.success("Complete proposal copied to clipboard as Markdown!");
    } catch {
      toast.error("Failed copying to clipboard");
    }
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${proposal.proposalNumber}_${proposal.projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Proposal downloaded as Markdown file");
  };

  const handleConvertToProject = () => {
    if (converted) {
      toast("This proposal has already been provisioned as a project.");
      return;
    }

    createAdminProject({
      name: proposal.projectTitle,
      companyName: proposal.clientName,
      clientName: proposal.clientName,
      clientEmail: proposal.clientEmail || 'client@domain.com',
      clientId: `client-${Date.now()}`,
      organizationId: `org-${Date.now()}`,
      description: proposal.executiveSummary.substring(0, 300) + '...',
      phase: 'Discover',
      progress: 10,
      budget: proposal.grandTotal || proposal.subtotal,
      spent: 0,
      startDate: new Date().toISOString().split('T')[0],
      targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
      leadEngineer: 'Shivam Dube',
      projectManager: 'Digvijay Kadam',
      designer: 'Jawad Khan Hakim',
      techStack: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
      upcomingMilestoneName: proposal.phases[0]?.milestones[0] || 'Technical Specification Sign-off',
      upcomingMilestoneDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    onUpdate({ status: 'Accepted' });
    setConverted(true);
    toast.success(`Converted to live Client Project in Admin Projects Panel!`);
  };

  const updateScope = (index: number, field: keyof ProposalScopeSection, value: any) => {
    if (readOnly) return;
    const newScope = [...proposal.scopeOfWork];
    newScope[index] = { ...newScope[index], [field]: value };
    onUpdate({ scopeOfWork: newScope });
  };

  const updateArrayItem = (arrayName: 'assumptions' | 'deliverables', index: number, value: any) => {
    if (readOnly) return;
    const newArray = [...proposal[arrayName]] as any[];
    newArray[index] = value;
    onUpdate({ [arrayName]: newArray });
  };

  const addArrayItem = (arrayName: 'assumptions' | 'deliverables', newItem: any) => {
    if (readOnly) return;
    onUpdate({ [arrayName]: [...(proposal[arrayName] as any[]), newItem] });
  };

  const removeArrayItem = (arrayName: 'assumptions' | 'deliverables', index: number) => {
    if (readOnly) return;
    const newArray = [...(proposal[arrayName] as any[])];
    newArray.splice(index, 1);
    onUpdate({ [arrayName]: newArray });
  };

  const symbol = proposal.currency === 'INR' ? '₹' : proposal.currency === 'GBP' ? '£' : '$';

  return (
    <div className="w-full max-w-[1000px] mx-auto pb-32 print:p-0 print:pb-0">
      {/* Top Document Controls (Screen Only) */}
      {!readOnly && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-4 bg-bg-card border border-border-custom rounded-xl print:hidden">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-text-muted">Status:</span>
            <select
              value={proposal.status}
              onChange={(e) => {
                onUpdate({ status: e.target.value as ProposalStatus });
                toast.success(`Proposal status updated to ${e.target.value}`);
              }}
              className="bg-bg-secondary border border-border-custom rounded-input px-2.5 py-1 text-xs font-mono text-white focus:border-accent-primary outline-none cursor-pointer"
            >
              <option value="Draft">Draft</option>
              <option value="Generated">Generated</option>
              <option value="Editing">Editing</option>
              <option value="Finalized">Finalized</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyMarkdown}
              className="text-xs font-mono px-3 py-1.5 rounded transition-all cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-secondary hover:text-white border border-border-custom flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-accent-primary" />
              Copy Markdown
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="text-xs font-mono px-3 py-1.5 rounded transition-all cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-secondary hover:text-white border border-border-custom flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Download .MD
            </button>

            <button
              onClick={handleConvertToProject}
              className="text-xs font-mono font-bold px-3 py-1.5 rounded transition-all cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30 flex items-center gap-1.5 shadow-glow"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              Convert to Live Project
            </button>
          </div>
        </div>
      )}

      {/* Document Body */}
      <div className="bg-bg-primary md:bg-bg-card border-none md:border md:border-border-custom rounded-none md:rounded-xl shadow-none md:shadow-lg overflow-hidden print:bg-white print:text-black print:shadow-none print:border-none print:w-full">
        {/* Header */}
        <div className="p-8 md:p-12 border-b border-border-custom print:border-gray-200">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-2xl font-mono font-bold text-accent-primary tracking-wider print:text-black">
                BINARY FROSTER
              </h1>
              <p className="text-xs font-mono text-text-muted mt-1 print:text-gray-500">
                PREMIUM SOFTWARE ENGINEERING & CLIENT DELIVERY PLATFORM
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-text-muted print:text-gray-500">PROPOSAL REFERENCE</p>
              <p className="font-mono font-semibold text-accent-primary print:text-black">{proposal.proposalNumber}</p>
              <p className="font-mono text-[10px] text-text-muted mt-1 print:text-gray-500">
                VALID UNTIL: {proposal.validUntil || '30 Days from Issue'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary print:text-black">
              {proposal.projectTitle}
            </h2>
            <div className="flex items-center gap-3 flex-wrap text-sm text-text-secondary print:text-gray-600 pt-1">
              <span>Client: <strong className="text-white print:text-black">{proposal.clientName}</strong></span>
              <span>•</span>
              <span>Archetype: <strong className="text-accent-primary print:text-black">{proposal.projectType}</strong></span>
              <span>•</span>
              <span>Total: <strong className="text-emerald-400 print:text-black">{symbol}{(proposal.grandTotal || proposal.subtotal).toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-8 md:p-12 border-b border-border-custom print:border-gray-200 print:break-inside-avoid">
          <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider mb-4 print:text-black flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-primary" /> 01. Executive Summary & Strategic Objectives
          </h3>
          {readOnly ? (
            <div className="text-text-secondary whitespace-pre-wrap leading-relaxed print:text-gray-800 text-sm">
              {proposal.executiveSummary}
            </div>
          ) : (
            <textarea
              className="w-full min-h-[140px] p-4 bg-bg-primary border border-border-custom rounded-md text-text-secondary text-sm leading-relaxed focus:border-accent-primary focus:outline-none resize-y"
              value={proposal.executiveSummary}
              onChange={(e) => onUpdate({ executiveSummary: e.target.value })}
            />
          )}
        </div>

        {/* Scope of Work */}
        <div className="p-8 md:p-12 border-b border-border-custom print:border-gray-200 print:break-before-page">
          <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider mb-6 print:text-black flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent-primary" /> 02. Technical Scope of Work
          </h3>
          <div className="grid gap-3">
            {proposal.scopeOfWork.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 border border-border-custom rounded-lg bg-bg-secondary/40 print:border-gray-200 print:bg-white">
                <button
                  onClick={() => updateScope(idx, 'included', !item.included)}
                  className="mt-1 text-accent-primary print:text-black print:hidden cursor-pointer"
                  disabled={readOnly}
                >
                  {item.included ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-text-muted" />}
                </button>
                <div className="flex-1 space-y-1">
                  {readOnly ? (
                    <>
                      <h4 className={cn("font-semibold text-sm", item.included ? "text-text-primary print:text-black" : "text-text-muted line-through print:text-gray-400")}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-text-secondary print:text-gray-600 leading-relaxed">{item.description}</p>
                    </>
                  ) : (
                    <div className="space-y-1.5">
                      <input
                        value={item.title}
                        onChange={(e) => updateScope(idx, 'title', e.target.value)}
                        className="w-full bg-transparent border-b border-border-custom/80 font-semibold text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                      />
                      <textarea
                        value={item.description}
                        onChange={(e) => updateScope(idx, 'description', e.target.value)}
                        className="w-full bg-transparent text-xs text-text-secondary resize-none focus:outline-none min-h-[35px] leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Phases */}
        <div className="p-8 md:p-12 border-b border-border-custom print:border-gray-200 print:break-inside-avoid">
          <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider mb-6 print:text-black">
            03. Engineering Phases & Milestone Schedule
          </h3>
          <div className="space-y-6">
            {proposal.phases.map((phase, idx) => (
              <div key={idx} className="p-4 bg-bg-secondary/30 border border-border-custom/70 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm text-text-primary print:text-black">{phase.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-accent-primary font-bold">{symbol}{phase.cost.toLocaleString()}</span>
                    <span className="text-xs font-mono text-text-muted bg-bg-secondary px-2 py-0.5 rounded border border-border-custom">{phase.duration}</span>
                  </div>
                </div>
                <div className="h-2 bg-bg-primary rounded-full overflow-hidden print:bg-gray-100">
                  <div
                    className="h-full bg-accent-primary/60 print:bg-gray-400 rounded-full"
                    style={{
                      marginLeft: `${(phase.startWeek / 24) * 100}%`,
                      width: `${Math.max(15, ((phase.endWeek - phase.startWeek) / 24) * 100)}%`
                    }}
                  />
                </div>
                <ul className="space-y-1 pt-1">
                  {phase.milestones.map((ms, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-2 print:text-gray-700">
                      <span className="text-accent-primary mt-0.5 print:text-black">•</span>
                      {ms}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-8 md:p-12 border-b border-border-custom print:border-gray-200 print:break-before-page">
          <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider mb-6 print:text-black">
            04. Commercial Rate Card & Investment Breakdown
          </h3>
          <div className="print:text-black">
            <EditableCostTable
              lineItems={proposal.costBreakdown}
              currency={proposal.currency}
              taxRate={proposal.taxRate}
              discount={proposal.discount}
              onLineItemsChange={(items) => onUpdate({ costBreakdown: items })}
              onTaxRateChange={(rate) => onUpdate({ taxRate: rate })}
              onDiscountChange={(discount) => onUpdate({ discount })}
              readOnly={readOnly}
            />
          </div>
        </div>

        {/* Deliverables */}
        <div className="p-8 md:p-12 border-b border-border-custom print:border-gray-200 print:break-inside-avoid">
          <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider mb-4 print:text-black">
            05. Tangible Contract Deliverables
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {proposal.deliverables.map((del, idx) => (
              <div key={idx} className="p-3 bg-bg-secondary/40 border border-border-custom rounded space-y-1">
                <span className="font-mono text-[9px] text-accent-primary uppercase block">{del.phase}</span>
                <h5 className="font-sans text-xs font-bold text-white">{del.name}</h5>
                <p className="font-mono text-[11px] text-text-secondary">{del.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture & Tech Stack */}
        <div className="p-8 md:p-12 border-b border-border-custom print:border-gray-200 print:break-inside-avoid">
          <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider mb-3 print:text-black">
            06. Recommended Architecture & Technology Stack
          </h3>
          <p className="text-xs font-mono text-text-secondary leading-relaxed bg-bg-secondary/30 p-4 rounded border border-border-custom/60">
            {proposal.techStackRecommendation}
          </p>
        </div>

        {/* Assumptions */}
        <div className="p-8 md:p-12 border-b border-border-custom print:border-gray-200 print:break-inside-avoid">
          <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider mb-4 print:text-black">
            07. Assumptions, Warranties & 99.9% SLA
          </h3>
          <ul className="space-y-2.5">
            {proposal.assumptions.map((assumption, idx) => (
              <li key={idx} className="flex gap-2 text-xs">
                <span className="text-accent-primary mt-0.5 print:text-black">•</span>
                {readOnly ? (
                  <span className="text-text-secondary print:text-gray-700">{assumption}</span>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <input
                      value={assumption}
                      onChange={(e) => updateArrayItem('assumptions', idx, e.target.value)}
                      className="flex-1 bg-transparent border-b border-border-custom text-xs text-text-secondary focus:border-accent-primary focus:outline-none"
                    />
                    <button onClick={() => removeArrayItem('assumptions', idx)} className="text-text-muted hover:text-brand-error">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Terms and Acceptance Sign-off Box */}
        <div className="p-8 md:p-12 print:border-gray-200 print:break-inside-avoid space-y-6">
          <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider print:text-black">
            08. Terms of Engagement & Execution Sign-off
          </h3>
          <div className="text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed bg-bg-secondary/20 p-4 rounded border border-border-custom/50">
            {proposal.termsAndConditions}
          </div>

          <div className="pt-6 border-t border-border-custom grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs">
            <div className="space-y-2 p-4 bg-bg-secondary/40 border border-border-custom rounded-lg">
              <span className="text-[10px] text-text-muted uppercase block">Engineering Provider:</span>
              <p className="font-bold text-white">Binary Froster Studio</p>
              <p className="text-text-muted text-[11px]">Shivam Dube / Platform Lead</p>
              <div className="pt-2">
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  DIGITALLY CERTIFIED & VERIFIED
                </span>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-bg-secondary/40 border border-border-custom rounded-lg">
              <span className="text-[10px] text-text-muted uppercase block">Authorized Client Signatory:</span>
              <p className="font-bold text-white">{signatoryName || proposal.clientName}</p>
              <p className="text-text-muted text-[11px]">Accepted & Signed: {new Date().toLocaleDateString()}</p>
              <div className="pt-2">
                <span className="text-[9px] text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded border border-accent-primary/20">
                  READY FOR EXECUTION
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      {!readOnly && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-bg-card/95 backdrop-blur-md border-t border-border-custom shadow-2xl z-50 print:hidden flex justify-center">
          <div className="w-full max-w-[1000px] flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-primary"></span>
              </span>
              <span className="font-mono text-xs text-text-secondary uppercase">
                {proposal.status} • Total: <strong className="text-white">{symbol}{(proposal.grandTotal || proposal.subtotal).toLocaleString()}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyMarkdown}
                className="text-xs font-mono"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copy MD
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportPDF}
                className="text-xs font-mono"
              >
                <FileDown className="w-3.5 h-3.5 mr-1.5" />
                Print / PDF
              </Button>

              <Button
                variant="accent"
                size="sm"
                onClick={() => {
                  onUpdate({ status: 'Finalized' });
                  toast.success("Proposal marked as Finalized & Sealed!");
                }}
                className="text-xs font-mono uppercase tracking-wider font-bold shadow-glow"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Finalize Proposal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProposalDocument;
