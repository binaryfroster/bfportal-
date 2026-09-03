"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { ProposalCurrency } from '@/src/types';

interface ProposalFormProps {
  onGenerate: (data: ProposalFormData) => void;
  isGenerating: boolean;
  onCancel: () => void;
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
  "React", "Next.js", "Vue.js", "Angular", "Node.js", "Python", "Go", "Rust", 
  "PostgreSQL", "MongoDB", "Redis", "AWS", "GCP", "Azure", "Docker", "Kubernetes", 
  "GraphQL", "REST API", "WebSocket", "Stripe"
];

const PROJECT_TYPES = [
  "Web Application", "Mobile Application", "SaaS Platform", 
  "E-Commerce Store", "AI/ML Solution", "Custom Software", "API Development"
];

const TIMELINES = [
  "4 weeks", "8 weeks", "12 weeks", "16 weeks", "6 months", "12 months"
];

export function ProposalForm({ onGenerate, isGenerating, onCancel }: ProposalFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProposalFormData>({
    clientName: '',
    clientEmail: '',
    projectTitle: '',
    projectType: PROJECT_TYPES[0],
    briefDescription: '',
    estimatedBudget: 0,
    currency: 'USD',
    timelinePreference: TIMELINES[1],
    techStackPreference: [],
    priorityFeatures: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.clientName) newErrors.clientName = 'Required';
      if (!formData.projectTitle) newErrors.projectTitle = 'Required';
    } else if (step === 2) {
      if (formData.estimatedBudget <= 0) newErrors.estimatedBudget = 'Must be greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, 3));
    }
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

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

  return (
    <Card className="w-full max-w-3xl mx-auto bg-bg-card border-border-custom relative overflow-hidden">
      {isGenerating && (
        <div className="absolute inset-0 z-50 bg-bg-primary/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-accent-primary animate-spin mb-4" />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
            className="text-lg font-mono text-accent-primary text-center"
          >
            Binary Froster AI is crafting your proposal...
          </motion.p>
        </div>
      )}

      <CardHeader className="border-b border-border-custom pb-6">
        <div className="flex justify-between items-center mb-6">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center relative z-10">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm font-bold border-2 transition-colors",
                  step > num ? "bg-brand-success border-brand-success text-bg-primary" :
                  step === num ? "bg-bg-card border-accent-primary text-accent-primary shadow-[0_0_10px_rgba(0,212,255,0.3)]" :
                  "bg-bg-card border-border-custom text-text-muted"
                )}>
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
                <span className="absolute -bottom-6 text-xs font-mono whitespace-nowrap text-text-muted uppercase">
                  {num === 1 ? 'Client Info' : num === 2 ? 'Budget' : 'Details'}
                </span>
              </div>
              {num < 3 && (
                <div className="flex-1 h-0.5 mx-2 bg-border-custom relative z-0">
                  <div className={cn(
                    "absolute top-0 left-0 h-full bg-accent-primary transition-all duration-500",
                    step > num ? "w-full" : "w-0"
                  )} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-8 min-h-[400px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-text-muted uppercase">Client Name *</label>
                    <Input 
                      value={formData.clientName}
                      onChange={e => updateField('clientName', e.target.value)}
                      className={errors.clientName ? 'border-brand-error' : ''}
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-text-muted uppercase">Client Email</label>
                    <Input 
                      type="email"
                      value={formData.clientEmail}
                      onChange={e => updateField('clientEmail', e.target.value)}
                      placeholder="contact@acme.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-text-muted uppercase">Project Title *</label>
                    <Input 
                      value={formData.projectTitle}
                      onChange={e => updateField('projectTitle', e.target.value)}
                      className={errors.projectTitle ? 'border-brand-error' : ''}
                      placeholder="e.g. E-Commerce Revamp"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-text-muted uppercase">Project Type</label>
                    <select 
                      className="w-full h-10 px-3 bg-bg-primary border border-border-custom rounded-md text-sm focus:border-accent-primary focus:outline-none text-text-primary"
                      value={formData.projectType}
                      onChange={e => updateField('projectType', e.target.value)}
                    >
                      {PROJECT_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-text-muted uppercase">Brief Description</label>
                  <textarea 
                    className="w-full min-h-[100px] p-3 bg-bg-primary border border-border-custom rounded-md text-sm focus:border-accent-primary focus:outline-none resize-none text-text-primary"
                    value={formData.briefDescription}
                    onChange={e => updateField('briefDescription', e.target.value)}
                    placeholder="Briefly describe the project goals and requirements..."
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-text-muted uppercase">Estimated Budget *</label>
                    <Input 
                      type="number"
                      value={formData.estimatedBudget || ''}
                      onChange={e => updateField('estimatedBudget', Number(e.target.value))}
                      className={errors.estimatedBudget ? 'border-brand-error' : ''}
                      placeholder="e.g. 50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-text-muted uppercase">Currency</label>
                    <select 
                      className="w-full h-10 px-3 bg-bg-primary border border-border-custom rounded-md text-sm focus:border-accent-primary focus:outline-none text-text-primary"
                      value={formData.currency}
                      onChange={e => updateField('currency', e.target.value as ProposalCurrency)}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-text-muted uppercase">Timeline Preference</label>
                  <select 
                    className="w-full h-10 px-3 bg-bg-primary border border-border-custom rounded-md text-sm focus:border-accent-primary focus:outline-none text-text-primary"
                    value={formData.timelinePreference}
                    onChange={e => updateField('timelinePreference', e.target.value)}
                  >
                    {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-text-muted uppercase">Tech Stack Preferences (Select Multiple)</label>
                  <div className="flex flex-wrap gap-2">
                    {TECH_STACK_PRESETS.map(tech => (
                      <button
                        key={tech}
                        onClick={() => toggleTech(tech)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-mono transition-all border",
                          formData.techStackPreference.includes(tech)
                            ? "bg-accent-primary/20 border-accent-primary text-accent-primary shadow-[0_0_10px_rgba(0,212,255,0.2)]"
                            : "bg-bg-primary border-border-custom text-text-secondary hover:border-text-muted"
                        )}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-text-muted uppercase">Priority Features & Other Notes</label>
                  <textarea 
                    className="w-full min-h-[120px] p-3 bg-bg-primary border border-border-custom rounded-md text-sm focus:border-accent-primary focus:outline-none resize-none text-text-primary"
                    value={formData.priorityFeatures}
                    onChange={e => updateField('priorityFeatures', e.target.value)}
                    placeholder="List the must-have features or specific integrations required..."
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>

      <div className="p-6 border-t border-border-custom bg-bg-secondary flex justify-between">
        <Button 
          variant="outline" 
          onClick={step === 1 ? onCancel : handleBack}
          className="border-border-custom text-text-secondary hover:text-text-primary"
        >
          {step === 1 ? 'Cancel' : <><ChevronLeft className="w-4 h-4 mr-2" /> Back</>}
        </Button>
        
        {step < 3 ? (
          <Button onClick={handleNext} className="bg-text-primary text-bg-primary hover:bg-text-secondary">
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={() => onGenerate(formData)}
            className="bg-accent-primary text-bg-primary hover:bg-accent-hover font-semibold shadow-[0_0_15px_rgba(0,212,255,0.3)] border-none"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate with AI
          </Button>
        )}
      </div>
    </Card>
  );
}

export default ProposalForm;
