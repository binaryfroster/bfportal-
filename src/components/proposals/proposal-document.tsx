"use client";

import React from 'react';
import { FileDown, Save, CheckCircle, Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Proposal, ProposalScopeSection, ProposalPhase } from '@/src/types';
import { EditableCostTable } from './editable-cost-table';
import { Button } from '@/src/components/ui/button';

interface ProposalDocumentProps {
  proposal: Proposal;
  onUpdate: (updates: Partial<Proposal>) => void;
  readOnly?: boolean;
}

export function ProposalDocument({ proposal, onUpdate, readOnly = false }: ProposalDocumentProps) {
  
  const handleExportPDF = () => {
    window.print();
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

  return (
    <div className="w-full max-w-[1000px] mx-auto pb-32 print:p-0 print:pb-0">
      
      {/* Document Body */}
      <div className="bg-bg-primary md:bg-bg-card border-none md:border md:border-border-custom rounded-none md:rounded-xl shadow-none md:shadow-lg overflow-hidden print:bg-white print:text-black print:shadow-none print:border-none print:w-full">
        
        {/* Header */}
        <div className="p-8 md:p-12 border-b border-border-custom print:border-gray-200">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-2xl font-mono font-bold text-accent-primary tracking-wider print:text-black">
                BINARY FROSTER
              </h1>
              <p className="text-sm font-mono text-text-muted mt-2 print:text-gray-500">CLIENT DELIVERY PLATFORM</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm text-text-muted print:text-gray-500">PROPOSAL #</p>
              <p className="font-mono font-semibold text-text-primary print:text-black">{proposal.proposalNumber}</p>
              <p className="font-mono text-xs text-text-muted mt-2 print:text-gray-500">DATE: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-text-primary print:text-black">{proposal.projectTitle}</h2>
            <p className="text-xl text-text-secondary print:text-gray-600">Prepared for: <span className="text-text-primary font-medium print:text-black">{proposal.clientName}</span></p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-8 md:p-12 border-b border-border-custom print:border-gray-200 print:break-inside-avoid">
          <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider mb-6 print:text-black">01. Executive Summary</h3>
          {readOnly ? (
            <div className="text-text-secondary whitespace-pre-wrap leading-relaxed print:text-gray-800">
              {proposal.executiveSummary}
            </div>
          ) : (
            <textarea 
              className="w-full min-h-[150px] p-4 bg-bg-primary border border-border-custom rounded-md text-text-secondary leading-relaxed focus:border-accent-primary focus:outline-none resize-y"
              value={proposal.executiveSummary}
              onChange={(e) => onUpdate({ executiveSummary: e.target.value })}
            />
          )}
        </div>

        {/* Scope of Work */}
        <div className="p-8 md:p-12 border-b border-border-custom print:border-gray-200 print:break-before-page">
          <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider mb-6 print:text-black">02. Scope of Work</h3>
          <div className="grid gap-4">
            {proposal.scopeOfWork.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 border border-border-custom rounded-lg bg-bg-secondary/50 print:border-gray-200 print:bg-white">
                <button 
                  onClick={() => updateScope(idx, 'included', !item.included)}
                  className="mt-1 text-accent-primary print:text-black print:hidden"
                  disabled={readOnly}
                >
                  {item.included ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-text-muted" />}
                </button>
                <div className="flex-1">
                  {readOnly ? (
                    <>
                      <h4 className={cn("font-semibold", item.included ? "text-text-primary print:text-black" : "text-text-muted line-through print:text-gray-400")}>
                        {item.title}
                      </h4>
                      <p className="text-sm text-text-secondary mt-1 print:text-gray-600">{item.description}</p>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <input 
                        value={item.title}
                        onChange={(e) => updateScope(idx, 'title', e.target.value)}
                        className="w-full bg-transparent border-b border-border-custom font-semibold text-text-primary focus:border-accent-primary focus:outline-none"
                      />
                      <textarea 
                        value={item.description}
                        onChange={(e) => updateScope(idx, 'description', e.target.value)}
                        className="w-full bg-transparent text-sm text-text-secondary resize-none focus:outline-none min-h-[40px]"
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
          <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider mb-6 print:text-black">03. Project Phases</h3>
          <div className="space-y-6">
            {proposal.phases.map((phase, idx) => (
              <div key={idx} className="relative">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-text-primary print:text-black">{phase.name}</h4>
                  <span className="text-xs font-mono text-text-muted">{phase.duration}</span>
                </div>
                <div className="h-2 bg-bg-primary rounded-full overflow-hidden print:bg-gray-100">
                  <div 
                    className="h-full bg-accent-primary/50 print:bg-gray-400"
                    style={{ 
                      marginLeft: `${(phase.startWeek / 24) * 100}%`,
                      width: `${((phase.endWeek - phase.startWeek) / 24) * 100}%` 
                    }}
                  />
                </div>
                <ul className="mt-3 space-y-1">
                  {phase.milestones.map((ms, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2 print:text-gray-700">
                      <span className="text-accent-primary mt-1 print:text-black">•</span>
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
          <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider mb-6 print:text-black">04. Cost Breakdown</h3>
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

        {/* Assumptions */}
        <div className="p-8 md:p-12 print:border-gray-200 print:break-inside-avoid">
          <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider mb-6 print:text-black">05. Assumptions & Constraints</h3>
          <ul className="space-y-3">
            {proposal.assumptions.map((assumption, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-accent-primary mt-1 print:text-black">•</span>
                {readOnly ? (
                  <span className="text-sm text-text-secondary print:text-gray-700">{assumption}</span>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <input 
                      value={assumption}
                      onChange={(e) => updateArrayItem('assumptions', idx, e.target.value)}
                      className="flex-1 bg-transparent border-b border-border-custom text-sm text-text-secondary focus:border-accent-primary focus:outline-none"
                    />
                    <button onClick={() => removeArrayItem('assumptions', idx)} className="text-text-muted hover:text-brand-error">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {!readOnly && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => addArrayItem('assumptions', 'New assumption')}
              className="mt-4 text-xs text-accent-primary hover:bg-accent-primary/10"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Assumption
            </Button>
          )}
        </div>
      </div>

      {/* Action Bar (Sticky Bottom) - Hidden on Print */}
      {!readOnly && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-bg-card/90 backdrop-blur-md border-t border-border-custom shadow-lg z-50 print:hidden flex justify-center">
          <div className="w-full max-w-[1000px] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-primary"></span>
              </span>
              <span className="font-mono text-xs text-text-secondary uppercase">{proposal.status}</span>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="border-border-custom" onClick={handleExportPDF}>
                <FileDown className="w-4 h-4 mr-2" /> Export PDF
              </Button>
              <Button variant="outline" className="border-border-custom">
                <Save className="w-4 h-4 mr-2" /> Save Draft
              </Button>
              <Button className="bg-accent-primary text-bg-primary hover:bg-accent-hover font-semibold">
                <CheckCircle className="w-4 h-4 mr-2" /> Finalize
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProposalDocument;
