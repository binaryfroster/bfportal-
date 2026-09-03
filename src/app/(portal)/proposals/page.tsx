"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/src/components/providers/auth-provider';
import toast from 'react-hot-toast';
import { Sparkles, FileText, Plus, Eye, Copy, Trash2, ArrowLeft, Download, DollarSign, FileSignature } from 'lucide-react';
import { cn } from '@/src/lib/utils';

import { Card, CardHeader, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';

import ProposalForm from '@/src/components/proposals/proposal-form';
import ProposalDocument from '@/src/components/proposals/proposal-document';

import type { Proposal, ProposalCurrency, ProposalStatus, ProposalScopeSection, ProposalPhase, ProposalCostLineItem, ProposalDeliverable } from '@/src/types';

const PROPOSALS_STORAGE_KEY = 'bf_proposals';

const formatAmount = (amount: number, currency: ProposalCurrency) => {
  const symbols: Record<ProposalCurrency, string> = { USD: '$', GBP: '£', INR: '₹' };
  return symbols[currency] + amount.toLocaleString();
};

const getStatusColor = (status: ProposalStatus) => {
  switch (status) {
    case 'Draft': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'Generated': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'Editing': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'Finalized': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'Sent': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'Accepted': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'Declined': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

const DEFAULT_PROPOSALS: Proposal[] = [
  {
    id: "prop-swap-2026",
    proposalNumber: "BF-PROP-2026-001",
    clientName: "Sterling Capital Group",
    clientEmail: "john@sterling.com",
    projectTitle: "Sterling Wealth Algorithmic Platform (SWAP)",
    projectType: "Fintech Platform",
    briefDescription: "Institutional algorithmic order book matching platform and double-entry ledger consensus engine.",
    currency: "USD",
    executiveSummary: "Binary Froster presents this engineering proposal to Sterling Capital Group for the deployment of SWAP (Sterling Wealth Algorithmic Platform). Our studio will deliver an ultra-reliable trading and settlement engine designed for microsecond execution, full regulatory compliance, and high-frequency order book processing.",
    scopeOfWork: [
      { title: "Technical Architecture & System Blueprinting", description: "Ledger consensus strategies, entity schemas, and compliance frameworks.", included: true },
      { title: "Dark Minimalist UI/UX Design System", description: "Figma high-fidelity prototypes and dark mode trading components.", included: true },
      { title: "Core Matching Engine & Rust Microservices", description: "High-throughput matching engine integrated with core banking APIs.", included: true },
      { title: "Stripe Connect & Settlement Engine", description: "Bilateral multi-tenant split payments and reconciliation webhooks.", included: true },
      { title: "Penetration Testing & Load Simulation", description: "Full PenTest sweeps and 10,000 concurrent user load simulations.", included: true },
      { title: "Production Deployment on AWS Nitro Enclaves", description: "Zero-downtime blue/green deployment and 24/7 SLA telemetry.", included: true },
    ],
    phases: [
      { name: "Phase 1: Architecture & Scope", duration: "Weeks 1–3", startWeek: 1, endWeek: 3, milestones: ["Architecture Blueprint Signoff", "FCA Compliance Signoff"], cost: 18000 },
      { name: "Phase 2: UI/UX & Prototypes", duration: "Weeks 4–6", startWeek: 4, endWeek: 6, milestones: ["Trading Dashboard Prototypes", "Design Token Library"], cost: 24000 },
      { name: "Phase 3: Core Engine & Rust Services", duration: "Weeks 7–12", startWeek: 7, endWeek: 12, milestones: ["Matching Engine Staging Build", "Database Migrations"], cost: 42000 },
      { name: "Phase 4: Security & Load Simulation", duration: "Weeks 13–14", startWeek: 13, endWeek: 14, milestones: ["PenTest Audit Pass", "Load Benchmark Certificate"], cost: 21600 },
      { name: "Phase 5: Production Launch & UAT", duration: "Weeks 15–16", startWeek: 15, endWeek: 16, milestones: ["DNS Cutover", "Source Code Handover Vault"], cost: 14400 },
    ],
    costBreakdown: [
      { id: "1", category: "Architecture & Governance", description: "Principal Architect: Distributed ledger consensus & models", hours: 140, rate: 130, amount: 18200 },
      { id: "2", category: "Core Full-Stack Engineering", description: "Senior Engineers: Rust services, WebSocket streams, APIs", hours: 420, rate: 105, amount: 44100 },
      { id: "3", category: "UI/UX Design & Prototyping", description: "Product Designer: Dark mode component system", hours: 220, rate: 95, amount: 20900 },
      { id: "4", category: "Quality Assurance & Auditing", description: "QA Lead: Automated Playwright & fuzz testing", hours: 180, rate: 90, amount: 16200 },
      { id: "5", category: "DevOps & Cloud Infrastructure", description: "DevOps Engineer: AWS Nitro enclaves, Kubernetes", hours: 190, rate: 110, amount: 20600 },
    ],
    deliverables: [
      { name: "OpenAPI Specification & Ledger Schema", description: "Complete technical architecture and Swagger contracts.", phase: "Phase 1: Architecture" },
      { name: "Figma Dark Mode Design System", description: "Interactive trading dashboards and component library.", phase: "Phase 2: UI/UX" },
      { name: "Rust & Next.js Source Code Repository", description: "Complete source code with automated CI/CD pipeline.", phase: "Phase 3: Core Engine" },
      { name: "PenTest & SOC2 Compliance Certificate", description: "Third-party audited security report and load benchmarks.", phase: "Phase 4: Security" },
      { name: "Production AWS Environment & Handover", description: "Configured cloud infrastructure and operational runbook.", phase: "Phase 5: Production Launch" },
    ],
    techStackRecommendation: "Frontend: Next.js 15 App Router & Tailwind CSS • Backend: Rust & Node.js microservices • Database: PostgreSQL with TimescaleDB & Redis cache • Cloud: AWS Nitro Enclaves • Payments: Stripe Connect.",
    assumptions: [
      "Sterling Capital will provide sandbox banking API credentials within 5 business days.",
      "Milestone review feedback provided within 48 hours of demo deployment.",
      "Includes 90 days of post-launch SLA bug warranty coverage.",
      "Guaranteed 99.9% uptime with < 100ms average order execution latency.",
    ],
    termsAndConditions: "Payment Terms: 30% mobilization deposit upon signing, 40% upon staging demo approval, 30% upon production cutover. Valid for 30 calendar days.",
    subtotal: 120000,
    taxRate: 0.10,
    taxAmount: 12000,
    discount: 0,
    grandTotal: 132000,
    status: "Finalized",
    validUntil: "2026-07-30",
    createdAt: "2026-06-01T10:00:00Z",
    updatedAt: "2026-06-05T14:30:00Z",
    createdByName: "Shivam Dube",
  }
];

export default function ProposalsPage() {
  const { user } = useUser();
  
  const [view, setView] = useState<'list' | 'create' | 'document'>('list');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROPOSALS_STORAGE_KEY);
      if (saved && JSON.parse(saved).length > 0) {
        setProposals(JSON.parse(saved));
      } else {
        setProposals(DEFAULT_PROPOSALS);
      }
    } catch {
      setProposals(DEFAULT_PROPOSALS);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(proposals));
    }
  }, [proposals, mounted]);

  const handleGenerate = async (formData: any) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        const newProposal: Proposal = {
          id: `prop-${Date.now()}`,
          ...formData,
          ...data.proposal,
          discount: 0,
          status: 'Generated',
          proposalNumber: `BF-PROP-${new Date().getFullYear()}-${String(proposals.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdByName: user?.name || 'Admin',
        };
        setProposals(prev => [newProposal, ...prev]);
        setSelectedProposalId(newProposal.id);
        setView('document');
        toast.success(data.source === 'openai' ? 'Proposal generated with AI!' : 'Proposal generated from template');
      } else {
        toast.error(data.error || 'Failed to generate proposal');
      }
    } catch (error) {
      toast.error('Failed to generate proposal');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateProposal = (updates: Partial<Proposal>) => {
    if (!selectedProposalId) return;
    setProposals(prev => prev.map(p => p.id === selectedProposalId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
  };

  const handleDelete = (id: string) => {
    setProposals(prev => prev.filter(p => p.id !== id));
    toast.success('Proposal deleted');
  };

  const handleDuplicate = (proposal: Proposal) => {
    const newProposal = {
      ...proposal,
      id: `prop-${Date.now()}`,
      proposalNumber: `BF-PROP-${new Date().getFullYear()}-${String(proposals.length + 1).padStart(3, '0')}`,
      status: 'Draft' as ProposalStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProposals(prev => [newProposal, ...prev]);
    toast.success('Proposal duplicated');
  };

  const selectedProposal = useMemo(
    () => proposals.find((p) => p.id === selectedProposalId),
    [proposals, selectedProposalId]
  );

  const { draftCount, finalizedCount, totalRevenue } = useMemo(() => {
    let drafts = 0;
    let finalized = 0;
    let revenue = 0;
    for (let i = 0; i < proposals.length; i++) {
      const p = proposals[i];
      if (p.status === 'Draft') drafts++;
      else if (p.status === 'Finalized') finalized++;
      else if (p.status === 'Accepted') revenue += p.grandTotal || 0;
    }
    return { draftCount: drafts, finalizedCount: finalized, totalRevenue: revenue };
  }, [proposals]);

  if (!mounted) {
    return <div className="p-8"><Skeleton className="h-[600px] bg-bg-card border border-border-custom w-full rounded-xl" /></div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-[1400px]">
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
                  <Sparkles className="h-8 w-8 text-accent-primary" />
                  AI Proposal Generator
                </h1>
                <p className="font-mono text-[9px] text-text-muted uppercase tracking-wider mt-1">
                  // BINARY_FROSTER_PROPOSAL_ENGINE
                </p>
              </div>
              <Button 
                onClick={() => setView('create')}
                className="bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-bg-primary border border-accent-primary/20 shadow-[0_0_15px_rgba(0,212,255,0.15)] transition-all duration-300 gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate New Proposal
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-bg-card border-border-custom">
                <CardContent className="p-6">
                  <div className="font-mono text-[9px] text-text-muted uppercase tracking-wider mb-2">Total Proposals</div>
                  <div className="text-3xl font-bold text-text-primary">{proposals.length}</div>
                </CardContent>
              </Card>
              <Card className="bg-bg-card border-border-custom">
                <CardContent className="p-6">
                  <div className="font-mono text-[9px] text-text-muted uppercase tracking-wider mb-2">Drafts</div>
                  <div className="text-3xl font-bold text-text-primary">{draftCount}</div>
                </CardContent>
              </Card>
              <Card className="bg-bg-card border-border-custom">
                <CardContent className="p-6">
                  <div className="font-mono text-[9px] text-text-muted uppercase tracking-wider mb-2">Finalized</div>
                  <div className="text-3xl font-bold text-text-primary">{finalizedCount}</div>
                </CardContent>
              </Card>
              <Card className="bg-bg-card border-border-custom">
                <CardContent className="p-6">
                  <div className="font-mono text-[9px] text-text-muted uppercase tracking-wider mb-2">Total Revenue</div>
                  <div className="text-3xl font-bold text-brand-success flex items-center">
                    <DollarSign className="h-6 w-6 mr-1 opacity-70" />
                    {totalRevenue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-bg-card border-border-custom overflow-hidden">
              {proposals.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center">
                  <FileSignature className="h-16 w-16 text-text-muted mb-4 opacity-50" />
                  <h3 className="text-xl font-medium text-text-primary mb-2">No proposals yet</h3>
                  <p className="text-text-secondary mb-6 max-w-md">
                    Generate your first AI-powered proposal. Our engine creates detailed, professional scopes of work in seconds.
                  </p>
                  <Button 
                    onClick={() => setView('create')}
                    className="bg-accent-primary text-bg-primary hover:bg-accent-hover gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Proposal
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border-custom hover:bg-transparent">
                        <TableHead className="font-mono text-[9px] text-text-muted uppercase tracking-wider">Proposal No.</TableHead>
                        <TableHead className="font-mono text-[9px] text-text-muted uppercase tracking-wider">Client</TableHead>
                        <TableHead className="font-mono text-[9px] text-text-muted uppercase tracking-wider">Project Title</TableHead>
                        <TableHead className="font-mono text-[9px] text-text-muted uppercase tracking-wider">Total</TableHead>
                        <TableHead className="font-mono text-[9px] text-text-muted uppercase tracking-wider">Status</TableHead>
                        <TableHead className="font-mono text-[9px] text-text-muted uppercase tracking-wider">Date</TableHead>
                        <TableHead className="text-right font-mono text-[9px] text-text-muted uppercase tracking-wider">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proposals.map((proposal) => (
                        <TableRow key={proposal.id} className="border-border-custom hover:bg-bg-secondary/50 transition-colors">
                          <TableCell className="font-mono text-sm text-text-secondary">{proposal.proposalNumber}</TableCell>
                          <TableCell className="font-medium text-text-primary">{proposal.clientName}</TableCell>
                          <TableCell className="text-text-secondary">{proposal.projectTitle}</TableCell>
                          <TableCell className="text-text-primary font-medium">
                            {formatAmount(proposal.grandTotal || 0, proposal.currency || 'USD')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("font-mono text-[10px] uppercase", getStatusColor(proposal.status))}>
                              {proposal.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-text-secondary text-sm">
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10"
                                onClick={() => {
                                  setSelectedProposalId(proposal.id);
                                  setView('document');
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 text-text-secondary hover:text-text-primary hover:bg-bg-secondary"
                                onClick={() => handleDuplicate(proposal)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 text-text-secondary hover:text-brand-error hover:bg-brand-error/10"
                                onClick={() => handleDelete(proposal.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {view === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setView('list')}
                className="text-text-secondary hover:text-text-primary gap-2 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Proposals
              </Button>
            </div>
            
            <div className="bg-bg-card border border-border-custom rounded-lg overflow-hidden">
              <ProposalForm 
                onGenerate={handleGenerate} 
                onCancel={() => setView('list')} 
                isGenerating={isGenerating} 
              />
            </div>
          </motion.div>
        )}

        {view === 'document' && selectedProposal && (
          <motion.div
            key="document"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setView('list');
                  setSelectedProposalId(null);
                }}
                className="text-text-secondary hover:text-text-primary gap-2 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Proposals
              </Button>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => window.print()}
                  className="border-border-custom text-text-secondary hover:text-text-primary gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
                <Button 
                  onClick={() => {
                    handleUpdateProposal({ status: 'Sent' });
                    toast.success("Proposal marked as Sent to client via portal & email!");
                  }}
                  className="bg-accent-primary text-bg-primary hover:bg-accent-hover gap-2 shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                >
                  <FileText className="h-4 w-4" />
                  Send to Client
                </Button>
              </div>
            </div>
            
            <ProposalDocument 
              proposal={selectedProposal}
              onUpdate={handleUpdateProposal}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
