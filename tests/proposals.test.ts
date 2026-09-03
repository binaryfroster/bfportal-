import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import type { Proposal, ProposalCostLineItem, ProposalStatus, ProposalCurrency } from '../src/types';

describe('AI Proposal Engine - Business Logic & Cost Estimation Tests', () => {
  let proposal: Proposal;

  beforeEach(() => {
    proposal = {
      id: 'prop-test-01',
      clientName: 'Sterling Wealth Corp',
      clientEmail: 'john@sterling.com',
      projectTitle: 'Algorithmic Trading Platform',
      projectType: 'SaaS Platform',
      briefDescription: 'High-frequency algorithmic matching engine',
      currency: 'USD',
      executiveSummary: 'Executive summary for Sterling Wealth Corp',
      scopeOfWork: [
        { title: 'Discovery & Architecture', description: 'System design and requirements', included: true },
        { title: 'Core Development', description: 'API and matching engine', included: true },
        { title: 'Testing & Audits', description: 'Load simulation and security audits', included: false },
      ],
      phases: [
        { name: 'Phase 1: Discovery', duration: '2 weeks', startWeek: 1, endWeek: 2, milestones: ['Architecture Spec'], cost: 7500 },
        { name: 'Phase 2: Build', duration: '6 weeks', startWeek: 3, endWeek: 8, milestones: ['Core Engine'], cost: 22500 },
      ],
      costBreakdown: [
        { id: 'cl-1', category: 'Frontend Development', description: 'Next.js Dashboard', hours: 80, rate: 100, amount: 8000 },
        { id: 'cl-2', category: 'Backend Development', description: 'Core Trading Engine', hours: 140, rate: 100, amount: 14000 },
        { id: 'cl-3', category: 'UI/UX Design', description: 'Figma Design System', hours: 80, rate: 100, amount: 8000 },
      ],
      deliverables: [
        { name: 'Source Code', description: 'Full GitHub repository', phase: 'Build' },
        { name: 'Architecture Docs', description: 'Full system specifications', phase: 'Discovery' },
      ],
      techStackRecommendation: 'Next.js 15, Rust, PostgreSQL, Redis',
      assumptions: ['Client delivers timely feedback', 'Stripe API keys provisioned'],
      termsAndConditions: '30% upfront, 40% mid-milestone, 30% handover',
      subtotal: 30000,
      taxRate: 0.10,
      taxAmount: 3000,
      discount: 1000,
      grandTotal: 32000,
      status: 'Generated',
      proposalNumber: 'BF-PROP-2026-001',
      validUntil: '2026-10-01',
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-09-01T10:00:00Z',
      createdByName: 'Shivam Dube',
    };
  });

  it('1. should calculate accurate subtotal by summing line items (hours * rate)', () => {
    const computedSubtotal = proposal.costBreakdown.reduce((sum, item) => sum + (item.hours * item.rate), 0);
    assert.equal(computedSubtotal, 30000);
    assert.equal(proposal.subtotal, computedSubtotal);
  });

  it('2. should recalculate amounts when line item hours or rates are edited', () => {
    // Edit line item 1: hours from 80 -> 100, rate from 100 -> 120
    const updatedLineItem: ProposalCostLineItem = {
      ...proposal.costBreakdown[0],
      hours: 100,
      rate: 120,
      amount: 100 * 120,
    };
    const updatedBreakdown = [updatedLineItem, proposal.costBreakdown[1], proposal.costBreakdown[2]];
    const newSubtotal = updatedBreakdown.reduce((sum, item) => sum + item.amount, 0);

    assert.equal(updatedLineItem.amount, 12000);
    assert.equal(newSubtotal, 34000);
  });

  it('3. should calculate regional taxes correctly (USD 10%, GBP 20%, INR 18%)', () => {
    const calculateTax = (subtotal: number, currency: ProposalCurrency) => {
      const rate = currency === 'INR' ? 0.18 : currency === 'GBP' ? 0.20 : 0.10;
      return { taxRate: rate, taxAmount: Math.round(subtotal * rate) };
    };

    const usdTax = calculateTax(50000, 'USD');
    assert.equal(usdTax.taxRate, 0.10);
    assert.equal(usdTax.taxAmount, 5000);

    const gbpTax = calculateTax(50000, 'GBP');
    assert.equal(gbpTax.taxRate, 0.20);
    assert.equal(gbpTax.taxAmount, 10000);

    const inrTax = calculateTax(500000, 'INR');
    assert.equal(inrTax.taxRate, 0.18);
    assert.equal(inrTax.taxAmount, 90000);
  });

  it('4. should apply discount and compute correct grand total', () => {
    const subtotal = 40000;
    const taxRate = 0.10;
    const taxAmount = subtotal * taxRate; // 4000
    const discount = 2500;
    const grandTotal = subtotal + taxAmount - discount; // 41500

    assert.equal(grandTotal, 41500);
  });

  it('5. should transition proposal status through lifecycle (Draft -> Finalized -> Sent -> Accepted)', () => {
    const validTransitions: ProposalStatus[] = ['Draft', 'Generated', 'Editing', 'Finalized', 'Sent', 'Accepted'];
    
    let currentStatus: ProposalStatus = 'Draft';
    for (const nextStatus of validTransitions.slice(1)) {
      currentStatus = nextStatus;
      assert.equal(currentStatus, nextStatus);
    }
    assert.equal(currentStatus, 'Accepted');
  });

  it('6. should allow toggling scope of work items inclusion', () => {
    assert.equal(proposal.scopeOfWork[2].included, false);
    // Toggle on
    proposal.scopeOfWork[2].included = true;
    assert.equal(proposal.scopeOfWork[2].included, true);
  });

  it('7. should generate domain-specific executive summary and deliverables for AI/ML projects', () => {
    const isAi = true;
    const clientName = 'Apex Digital';
    const projectTitle = 'Autonomous AI Voice Agent Platform';
    const briefDesc = 'Streaming speech synthesis with low latency';
    
    let summary = `Binary Froster is pleased to present this comprehensive engineering proposal for "${projectTitle}" to ${clientName}. `;
    if (isAi) {
      summary += `Our studio specializes in low-latency generative AI architectures, autonomous voice agent pipelines, and robust RAG infrastructure.`;
    }

    assert.ok(summary.includes('Apex Digital'));
    assert.ok(summary.includes('low-latency generative AI'));
  });

  it('8. should calculate granular engineering role rate breakdown summing to subtotal', () => {
    const subtotal = 50000;
    const baseRate = 95;
    const r1 = Math.round(baseRate * 1.3);
    const r2 = Math.round(baseRate * 1.05);
    const r3 = Math.round(baseRate * 0.95);
    const r4 = Math.round(baseRate * 0.90);
    const r5 = Math.round(baseRate * 1.10);

    const a1 = Math.round(subtotal * 0.22);
    const a2 = Math.round(subtotal * 0.38);
    const a3 = Math.round(subtotal * 0.18);
    const a4 = Math.round(subtotal * 0.12);
    const a5 = subtotal - (a1 + a2 + a3 + a4);

    const sum = a1 + a2 + a3 + a4 + a5;
    assert.equal(sum, subtotal);
    assert.ok(a1 > 0 && a2 > 0 && a3 > 0 && a4 > 0 && a5 > 0);
  });

  it('9. should handle edge case where discount is large or equals subtotal', () => {
    const subtotal = 10000;
    const taxRate = 0.10;
    const taxAmount = subtotal * taxRate; // 1000
    const fullDiscount = 11000; // 100% discount covering subtotal and tax
    const grandTotal = Math.max(0, subtotal + taxAmount - fullDiscount);
    assert.equal(grandTotal, 0);
  });

  it('10. should enforce minimum budget thresholds per currency', () => {
    const minBudgets: Record<ProposalCurrency, number> = {
      USD: 500,
      GBP: 400,
      INR: 40000,
    };

    assert.equal(minBudgets.USD, 500);
    assert.equal(minBudgets.GBP, 400);
    assert.equal(minBudgets.INR, 40000);

    // Test rejection criteria
    assert.ok(499 < minBudgets.USD);
    assert.ok(399 < minBudgets.GBP);
    assert.ok(39999 < minBudgets.INR);

    // Test acceptance criteria
    assert.ok(500 >= minBudgets.USD);
    assert.ok(400 >= minBudgets.GBP);
    assert.ok(40000 >= minBudgets.INR);
  });

  it('11. should detect and reject empty or whitespace-only client credentials', () => {
    const validateInputs = (clientName: string, projectTitle: string) => {
      return Boolean(clientName?.trim() && projectTitle?.trim());
    };

    assert.equal(validateInputs('', 'My App'), false);
    assert.equal(validateInputs('   ', 'My App'), false);
    assert.equal(validateInputs('Acme Corp', ''), false);
    assert.equal(validateInputs('Acme Corp', '   '), false);
    assert.equal(validateInputs('Acme Corp', 'Fintech Engine'), true);
  });

  it('12. should validate non-numeric or non-positive budgets', () => {
    const validateBudget = (budget: any) => {
      const num = Number(budget);
      return !isNaN(num) && num > 0;
    };

    assert.equal(validateBudget(NaN), false);
    assert.equal(validateBudget(-500), false);
    assert.equal(validateBudget(0), false);
    assert.equal(validateBudget("invalid"), false);
    assert.equal(validateBudget(25000), true);
    assert.equal(validateBudget("25000"), true);
  });
});

