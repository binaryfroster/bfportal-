"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2,
  Zap,
  Building,
  DollarSign,
  Calendar,
  Layers,
  Code,
  ShieldCheck,
  Info,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/src/lib/utils';
import { ProposalCurrency } from '@/src/types';
import { usePortalData } from '@/src/components/providers/portal-data-provider';
import toast from 'react-hot-toast';

interface ProposalFormProps {
  onGenerate: (data: ProposalFormData) => void;
  isGenerating: boolean;
  onCancel: () => void;
  initialData?: Partial<ProposalFormData>;
}

export interface ProposalFormData {
  clientName: string;
  clientEmail: string;
  projectTitle: string;
  projectType: string;
  briefDescription: string;
  estimatedBudget: number;
  currency: ProposalCurrency;
  timelinePreference: string;
  techStackPreference: string[];
  priorityFeatures: string;
}

const TECH_STACK_PRESETS = [
  "Next.js 15", "React 19", "Node.js", "Python / FastAPI", "Rust", "Go",
  "PostgreSQL", "Redis", "Docker", "AWS us-east-1", "Cloudflare Workers",
  "WebSockets", "PyTorch / Whisper", "Tailwind CSS", "Stripe Connect", "GraphQL"
];

const PROJECT_TYPES = [
  "Web Application",
  "SaaS Platform",
  "AI/ML Solution",
  "Fintech Platform",
  "Mobile Application",
  "E-Commerce Store",
  "Custom Software",
  "API Gateway & Microservices"
];

const TIMELINES = [
  "4 weeks", "6 weeks", "8 weeks", "12 weeks", "16 weeks", "6 months"
];

const INDUSTRY_PRESETS = [
  {
    label: "🤖 Autonomous AI Voice & Agent Suite",
    type: "AI/ML Solution",
    title: "Enterprise Autonomous Voice Agent & RAG Pipeline",
    desc: "Sub-200ms latency conversational voice agent infrastructure with streaming audio synthesis, contextual memory vector store, and 24/7 client dispatch integration.",
    budget: 95000,
    currency: "USD" as ProposalCurrency,
    timeline: "10 weeks",
    tech: ["Next.js 15", "Python / FastAPI", "PyTorch / Whisper", "WebSockets", "Redis", "AWS us-east-1"],
    features: "Streaming voice synthesis, prompt caching, pgvector memory, WebSocket duplex audio, SLA telemetry dashboard"
  },
  {
    label: "💳 Fintech Algorithmic Ledger & DEX",
    type: "Fintech Platform",
    title: "Institutional Wealth Algorithmic Matching Platform",
    desc: "High-throughput matching engine, multi-sig cryptographic cold storage vault, and bilateral automated payment settlement matching UK FCA & SEC regulations.",
    budget: 120000,
    currency: "USD" as ProposalCurrency,
    timeline: "16 weeks",
    tech: ["Next.js 15", "Rust", "PostgreSQL", "Stripe Connect", "Docker", "AWS us-east-1"],
    features: "Microsecond order matching, double-entry audit ledger, Stripe Connect multi-tenant payouts, HSM key management"
  },
  {
    label: "☁️ Enterprise B2B SaaS & Analytics Mesh",
    type: "SaaS Platform",
    title: "Multi-Tenant Enterprise Workflow & Analytics Mesh",
    desc: "Scalable multi-tenant B2B cloud portal featuring organization isolation, role-based access control, billing subscriptions, and real-time event streaming.",
    budget: 65000,
    currency: "USD" as ProposalCurrency,
    timeline: "12 weeks",
    tech: ["Next.js 15", "React 19", "Node.js", "PostgreSQL", "Tailwind CSS", "Stripe Connect"],
    features: "Organization workspaces, usage telemetry, PDF invoice engine, audit trail logging, custom domain mapping"
  },
  {
    label: "📱 Cross-Platform Mobile App (iOS/Android)",
    type: "Mobile Application",
    title: "High-Performance Mobile Client & Dispatch Portal",
    desc: "Native-speed 120 FPS iOS and Android mobile applications featuring offline-first data sync, biometric authentication, push notifications, and dark luxury UI.",
    budget: 45000,
    currency: "USD" as ProposalCurrency,
    timeline: "8 weeks",
    tech: ["React 19", "Node.js", "PostgreSQL", "Redis", "Cloudflare Workers"],
    features: "Biometric FaceID login, background geolocation, offline SQLite cache, push notification engine, App Store submission"
  },
  {
    label: "🚚 AI Logistics & Fleet Telematics Router",
    type: "Custom Software",
    title: "Geospatial Fleet Telematics & Route Optimization Engine",
    desc: "Distributed geospatial routing and telemetry ingestion engine capable of processing millions of GPS pings with sub-second route recalculations.",
    budget: 85000,
    currency: "USD" as ProposalCurrency,
    timeline: "14 weeks",
    tech: ["Python / FastAPI", "Next.js 15", "PostgreSQL", "Docker", "Redis"],
    features: "PostGIS geospatial indexing, live telemetry ingestion, dispatcher routing optimization, automated carrier webhooks"
  }
];

export function ProposalForm({ onGenerate, isGenerating, onCancel, initialData }: ProposalFormProps) {
  const { adminProjects } = usePortalData();

  // Mode: "express" (single-pane fast entry) or "wizard" (step-by-step)
  const [mode, setMode] = useState<"express" | "wizard">("express");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<ProposalFormData>({
    clientName: initialData?.clientName || '',
    clientEmail: initialData?.clientEmail || '',
    projectTitle: initialData?.projectTitle || '',
    projectType: initialData?.projectType || PROJECT_TYPES[0],
    briefDescription: initialData?.briefDescription || '',
    estimatedBudget: initialData?.estimatedBudget || 35000,
    currency: initialData?.currency || 'USD',
    timelinePreference: initialData?.timelinePreference || TIMELINES[2],
    techStackPreference: initialData?.techStackPreference || ["Next.js 15", "React 19", "PostgreSQL", "Tailwind CSS"],
    priorityFeatures: initialData?.priorityFeatures || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientName.trim()) newErrors.clientName = 'Client / Company name is required';
    if (!formData.projectTitle.trim()) newErrors.projectTitle = 'Project title is required';
    if (!formData.estimatedBudget || formData.estimatedBudget <= 0) {
      newErrors.estimatedBudget = 'Budget must be greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyPreset = (preset: typeof INDUSTRY_PRESETS[0]) => {
    setFormData(prev => ({
      ...prev,
      projectType: preset.type,
      projectTitle: prev.clientName ? `${prev.clientName}: ${preset.title}` : preset.title,
      briefDescription: preset.desc,
      estimatedBudget: preset.budget,
      currency: preset.currency,
      timelinePreference: preset.timeline,
      techStackPreference: preset.tech,
      priorityFeatures: preset.features
    }));
    toast.success(`Applied "${preset.label}" template`);
  };

  const handleSelectClient = (project: any) => {
    setFormData(prev => ({
      ...prev,
      clientName: project.companyName || project.clientName,
      clientEmail: project.clientEmail || `${project.clientName.toLowerCase().replace(/\s+/g, '')}@client.com`,
      projectTitle: `${project.companyName}: ${project.name}`,
      projectType: project.phase === 'Build' ? 'SaaS Platform' : 'Web Application',
      estimatedBudget: project.budget || prev.estimatedBudget,
      techStackPreference: project.techStack?.length ? project.techStack : prev.techStackPreference,
    }));
    toast.success(`Populated details for ${project.companyName}`);
  };

  const toggleTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStackPreference: prev.techStackPreference.includes(tech)
        ? prev.techStackPreference.filter(t => t !== tech)
        : [...prev.techStackPreference, tech]
    }));
  };

  const updateField = (field: keyof ProposalFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in required fields (Client Name, Title, and Budget)");
      return;
    }
    onGenerate(formData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-bg-card border-border-custom relative overflow-hidden shadow-2xl">
      {isGenerating && (
        <div className="absolute inset-0 z-50 bg-bg-primary/90 backdrop-blur-md flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
          <div className="space-y-2 max-w-md">
            <h3 className="font-sans text-lg font-bold text-white tracking-wide">
              Synthesizing Technical Proposal...
            </h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
              className="text-xs font-mono text-accent-primary"
            >
              Architecting deliverables, calibrating engineering rates, and structuring 5-phase milestones...
            </motion.p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <CardHeader className="p-6 border-b border-border-custom/60 bg-bg-secondary/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent-primary animate-pulse" />
              <h2 className="font-sans text-lg font-bold text-white tracking-wide">
                Automated Technical Proposal Drafting Engine
              </h2>
            </div>
            <p className="font-mono text-xs text-text-muted">
              Enter key requirements or select a preset to auto-draft an enterprise client proposal in seconds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode(mode === "express" ? "wizard" : "express")}
              className="text-[10px] font-mono px-3 py-1.5 rounded transition-all bg-bg-secondary hover:bg-slate-800 text-text-secondary hover:text-white border border-border-custom"
            >
              Mode: {mode === "express" ? "⚡ Express Auto-Draft" : "📋 3-Step Wizard"}
            </button>
          </div>
        </div>

        {/* Client Quick-Fill Picker */}
        {adminProjects && adminProjects.length > 0 && (
          <div className="pt-4 border-t border-border-custom/40 space-y-2">
            <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider block">
              1-Click Client Quick-Fill (Active Portal Accounts):
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {adminProjects.slice(0, 5).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectClient(p)}
                  className="text-[10px] font-mono px-2.5 py-1 rounded transition-all cursor-pointer bg-bg-secondary hover:bg-accent-primary/15 hover:border-accent-primary/40 text-text-secondary hover:text-accent-primary border border-border-custom flex items-center gap-1.5"
                >
                  <Building className="w-3 h-3 text-accent-primary" />
                  {p.companyName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Industry Template Presets */}
        <div className="pt-3 space-y-2">
          <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider block">
            Battle-Tested Industry Presets:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {INDUSTRY_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-[10px] font-mono px-2.5 py-1 rounded transition-all cursor-pointer bg-bg-secondary/80 hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom/80"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Client & Project Identity */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4" /> 1. Client & Project Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-secondary uppercase">
                  Client / Company Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Acme Enterprises Inc."
                  value={formData.clientName}
                  onChange={(e) => updateField('clientName', e.target.value)}
                  className={cn(errors.clientName && "border-brand-error")}
                />
                {errors.clientName && <p className="text-[10px] text-brand-error font-mono">{errors.clientName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-secondary uppercase">
                  Client Contact Email
                </label>
                <Input
                  type="email"
                  placeholder="e.g. director@acme.com"
                  value={formData.clientEmail}
                  onChange={(e) => updateField('clientEmail', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-secondary uppercase">
                  Project Title *
                </label>
                <Input
                  required
                  placeholder="e.g. Autonomous AI Logistics & Fleet Dispatch Platform"
                  value={formData.projectTitle}
                  onChange={(e) => updateField('projectTitle', e.target.value)}
                  className={cn(errors.projectTitle && "border-brand-error")}
                />
                {errors.projectTitle && <p className="text-[10px] text-brand-error font-mono">{errors.projectTitle}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-secondary uppercase">
                  Project Archetype
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => updateField('projectType', e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom rounded-input px-3 py-2 text-xs font-mono text-white focus:border-accent-primary outline-none cursor-pointer"
                >
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-secondary uppercase">
                Scope & Requirements Summary
              </label>
              <textarea
                rows={3}
                placeholder="Describe key requirements, user problems, desired integrations, or operational goals..."
                value={formData.briefDescription}
                onChange={(e) => updateField('briefDescription', e.target.value)}
                className="w-full bg-bg-secondary border border-border-custom rounded-input p-3 text-xs font-mono text-white placeholder-text-muted focus:border-accent-primary outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Commercials & Timeline */}
          <div className="space-y-4 pt-4 border-t border-border-custom/50">
            <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> 2. Budget, Currency & Timeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-secondary uppercase">
                  Target Budget *
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    required
                    min={100}
                    value={formData.estimatedBudget}
                    onChange={(e) => updateField('estimatedBudget', Number(e.target.value))}
                    className={cn("font-mono", errors.estimatedBudget && "border-brand-error")}
                  />
                </div>
                {errors.estimatedBudget && <p className="text-[10px] text-brand-error font-mono">{errors.estimatedBudget}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-secondary uppercase">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => updateField('currency', e.target.value as ProposalCurrency)}
                  className="w-full bg-bg-secondary border border-border-custom rounded-input px-3 py-2 text-xs font-mono text-white focus:border-accent-primary outline-none cursor-pointer"
                >
                  <option value="USD">USD ($) — Global Standard</option>
                  <option value="GBP">GBP (£) — UK Market</option>
                  <option value="INR">INR (₹) — India Domestic</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-secondary uppercase">
                  Estimated Timeline
                </label>
                <select
                  value={formData.timelinePreference}
                  onChange={(e) => updateField('timelinePreference', e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom rounded-input px-3 py-2 text-xs font-mono text-white focus:border-accent-primary outline-none cursor-pointer"
                >
                  {TIMELINES.map((tl) => (
                    <option key={tl} value={tl}>{tl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-secondary uppercase">
                Priority Features / Non-Negotiables
              </label>
              <Input
                placeholder="e.g. Sub-200ms latency, Stripe Connect billing, 99.9% uptime SLA, SOC2 compliance"
                value={formData.priorityFeatures}
                onChange={(e) => updateField('priorityFeatures', e.target.value)}
              />
            </div>
          </div>

          {/* Section 3: Technology Stack */}
          <div className="space-y-3 pt-4 border-t border-border-custom/50">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs text-accent-primary uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4" /> 3. Preferred Technology Stack
              </h3>
              <span className="font-mono text-[10px] text-text-muted">
                Selected: {formData.techStackPreference.length} technologies
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {TECH_STACK_PRESETS.map((tech) => {
                const isSelected = formData.techStackPreference.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className={cn(
                      "px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer border",
                      isSelected
                        ? "bg-accent-primary/20 border-accent-primary text-accent-primary shadow-[0_0_10px_rgba(0,212,255,0.15)] font-bold"
                        : "bg-bg-secondary border-border-custom text-text-secondary hover:text-white hover:border-slate-600"
                    )}
                  >
                    {tech}
                    {isSelected && <Check className="w-3 h-3 ml-1.5 inline stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-border-custom flex items-center justify-between gap-4 flex-wrap">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onCancel}
              className="text-xs font-mono"
            >
              CANCEL
            </Button>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              disabled={isGenerating}
              className="font-mono text-xs uppercase tracking-wider font-bold shadow-glow hover:shadow-glow-strong flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              AUTO-DRAFT COMPLETE PROPOSAL &rarr;
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ProposalForm;
