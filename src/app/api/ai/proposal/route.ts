import { NextRequest, NextResponse } from 'next/server';

interface ProposalGenerateRequest {
  clientName: string;
  projectTitle: string;
  projectType: string;
  briefDescription: string;
  estimatedBudget: number;
  currency: 'USD' | 'GBP' | 'INR';
  timelinePreference: string;
  techStackPreference: string[];
  priorityFeatures: string;
}

interface ProposalPhase {
  name: string;
  duration: string;
  startWeek: number;
  endWeek: number;
  milestones: string[];
  cost: number;
}

interface ProposalCost {
  id: string;
  category: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

interface ProposalGenerateResponse {
  success: boolean;
  proposal: {
    executiveSummary: string;
    scopeOfWork: Array<{ title: string; description: string; included: boolean }>;
    phases: ProposalPhase[];
    costBreakdown: ProposalCost[];
    deliverables: Array<{ name: string; description: string; phase: string }>;
    techStackRecommendation: string;
    assumptions: string[];
    termsAndConditions: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    grandTotal: number;
    validUntil: string;
  };
  source: 'openai' | 'gemini' | 'template';
  error?: string;
}

/**
 * Intelligent Dynamic Proposal Generator
 * Produces highly tailored, domain-specific enterprise proposals
 */
const generateTemplateProposal = (req: ProposalGenerateRequest) => {
  const { 
    estimatedBudget, 
    currency, 
    projectType, 
    clientName, 
    projectTitle, 
    briefDescription, 
    timelinePreference, 
    techStackPreference,
    priorityFeatures 
  } = req;
  
  let baseRate = 100;
  if (currency === 'USD') baseRate = 95;
  if (currency === 'GBP') baseRate = 80;
  if (currency === 'INR') baseRate = 4200;

  const budget = estimatedBudget || (currency === 'INR' ? 500000 : 25000);
  const subtotal = budget;
  const taxRate = currency === 'INR' ? 0.18 : 0.10;
  const taxAmount = Math.round(subtotal * taxRate);
  const grandTotal = subtotal + taxAmount;

  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + 30);
  const validUntil = validUntilDate.toISOString().split('T')[0];

  // Parse total weeks from timelinePreference (e.g., "8 weeks", "12 weeks", "6 months")
  let totalWeeks = 8;
  if (timelinePreference) {
    const match = timelinePreference.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (timelinePreference.toLowerCase().includes('month')) {
        totalWeeks = num * 4;
      } else {
        totalWeeks = num;
      }
    }
  }
  totalWeeks = Math.max(4, Math.min(24, totalWeeks));

  const w1 = Math.max(1, Math.round(totalWeeks * 0.15));
  const w2 = Math.max(w1 + 1, Math.round(totalWeeks * 0.35));
  const w3 = Math.max(w2 + 1, Math.round(totalWeeks * 0.75));
  const w4 = Math.max(w3 + 1, Math.round(totalWeeks * 0.90));
  const w5 = totalWeeks;

  // Domain classification
  const lowerText = `${projectType} ${projectTitle} ${briefDescription} ${priorityFeatures}`.toLowerCase();
  const isAi = lowerText.includes('ai') || lowerText.includes('voice') || lowerText.includes('llm') || lowerText.includes('agent') || lowerText.includes('rag');
  const isFintech = lowerText.includes('fintech') || lowerText.includes('crypto') || lowerText.includes('ledger') || lowerText.includes('trading') || lowerText.includes('banking') || lowerText.includes('payment');
  const isMobile = lowerText.includes('mobile') || lowerText.includes('ios') || lowerText.includes('android') || lowerText.includes('app');
  const isEcommerce = lowerText.includes('e-commerce') || lowerText.includes('shop') || lowerText.includes('store') || lowerText.includes('cart');
  const isLogistics = lowerText.includes('logistic') || lowerText.includes('fleet') || lowerText.includes('dispatch') || lowerText.includes('routing');

  // Executive Summary tailored to domain
  let executiveSummary = `Binary Froster is pleased to present this comprehensive engineering proposal for "${projectTitle}" to ${clientName}. `;
  if (isAi) {
    executiveSummary += `Our studio specializes in low-latency generative AI architectures, autonomous voice agent pipelines, and robust RAG infrastructure. For ${clientName}, we will architect an enterprise-grade, high-throughput AI solution with sub-200ms latency targets, secure context preservation, and scalable cloud deployment. ${briefDescription ? `Scope Overview: ${briefDescription}` : ''}`;
  } else if (isFintech) {
    executiveSummary += `Our studio engineers institutional-grade financial platforms, ultra-reliable order books, and cryptographic ledgers. For ${clientName}, we deliver an architecture adhering to stringent financial compliance standards (SOC 2, FCA/SEC guidelines), microsecond execution reliability, and multi-signature security. ${briefDescription ? `Scope Overview: ${briefDescription}` : ''}`;
  } else if (isMobile) {
    executiveSummary += `We deliver fluid 120 FPS cross-platform mobile experiences with native responsiveness, offline-first data sync, and delightful dark minimalist design. For ${clientName}, we will architect and build iOS and Android apps ready for global App Store and Play Store launch. ${briefDescription ? `Scope Overview: ${briefDescription}` : ''}`;
  } else if (isLogistics) {
    executiveSummary += `We engineer mission-critical fleet telematics, real-time routing engines, and driver dispatch command centers. For ${clientName}, we will assemble a distributed geospatial platform capable of ingesting high-frequency telemetry data with sub-second route recalculations. ${briefDescription ? `Scope Overview: ${briefDescription}` : ''}`;
  } else {
    executiveSummary += `We engineer enterprise-grade web applications, multi-tenant SaaS platforms, and modern API infrastructures. For ${clientName}, our engineering team will build an end-to-end, highly scalable platform designed for high performance, top-tier security, and seamless developer extensibility. ${briefDescription ? `Scope Overview: ${briefDescription}` : ''}`;
  }

  // Domain-specific Scope of Work
  let scopeOfWork = [
    { title: 'Technical Architecture & System Blueprinting', description: 'Comprehensive domain modeling, data flow schemas, API interface contracts, and infrastructure topology design.', included: true },
    { title: 'Dark Minimalist UI/UX Design System', description: 'Complete Figma high-fidelity prototypes, interactive component library, and responsive design tokens.', included: true },
    { title: 'Core Backend & Engine Engineering', description: 'High-throughput microservices, database schema migrations, authentication, and secure API gateways.', included: true },
    { title: 'Client Frontend & Operations Dashboard', description: 'Performant web/mobile interfaces featuring real-time state synchronization, smooth transitions, and accessibility compliance.', included: true },
    { title: 'Automated Testing, QA & Security Audit', description: 'Full unit/integration test coverage, penetration testing, load simulation, and vulnerability sweeps.', included: true },
    { title: 'Production Cloud Deployment & CI/CD Pipeline', description: 'Production infrastructure provisioning on AWS/GCP/Vercel, automated GitHub Actions workflows, and DNS cutover.', included: true }
  ];

  if (isAi) {
    scopeOfWork.splice(2, 0, {
      title: 'AI Model Inference Pipeline & Voice Synthesis',
      description: 'Streaming WebSocket audio synthesis, prompt engineering, vector database indexing, and latency optimization.',
      included: true
    });
  } else if (isFintech) {
    scopeOfWork.splice(2, 0, {
      title: 'Transaction Ledger & Bilateral Payment Engine',
      description: 'Double-entry cryptographic ledger, automated settlement webhooks, and Stripe Connect multi-tenant payouts.',
      included: true
    });
  }

  // Domain-specific Phases
  const phase1Cost = Math.round(subtotal * 0.15);
  const phase2Cost = Math.round(subtotal * 0.20);
  const phase3Cost = Math.round(subtotal * 0.35);
  const phase4Cost = Math.round(subtotal * 0.18);
  const phase5Cost = subtotal - (phase1Cost + phase2Cost + phase3Cost + phase4Cost);

  const phases: ProposalPhase[] = [
    {
      name: 'Phase 1: Discovery & Architecture',
      duration: `Weeks 1–${w1}`,
      startWeek: 1,
      endWeek: w1,
      milestones: ['Technical Specification Sign-off', 'Database & Entity Models Sealed', 'Infrastructure Topology Approved'],
      cost: phase1Cost
    },
    {
      name: 'Phase 2: UI/UX & Design System',
      duration: `Weeks ${w1 + 1}–${w2}`,
      startWeek: w1 + 1,
      endWeek: w2,
      milestones: ['Figma Clickable Prototype Review', 'Design Token Library Handover', 'Client UX Feedback Sign-off'],
      cost: phase2Cost
    },
    {
      name: 'Phase 3: Core Engineering & Integrations',
      duration: `Weeks ${w2 + 1}–${w3}`,
      startWeek: w2 + 1,
      endWeek: w3,
      milestones: ['Core API & Engine Deployment on Staging', 'Database Migrations & Seed Data', 'Primary Client User Journeys Functional'],
      cost: phase3Cost
    },
    {
      name: 'Phase 4: QA, Load Testing & Security Sweeps',
      duration: `Weeks ${w3 + 1}–${w4}`,
      startWeek: w3 + 1,
      endWeek: w4,
      milestones: ['Automated E2E Testing Suite Pass', 'Penetration Testing & Security Audit', 'User Acceptance Testing (UAT) Sign-off'],
      cost: phase4Cost
    },
    {
      name: 'Phase 5: Production Launch & 90-Day Warranty',
      duration: `Weeks ${w4 + 1}–${w5}`,
      startWeek: w4 + 1,
      endWeek: w5,
      milestones: ['Zero-Downtime Production Cutover', 'Handover Vault & Source Code Transfer', '24/7 SLA Telemetry Active'],
      cost: phase5Cost
    }
  ];

  // Granular Cost Breakdown with specialized roles
  const r1 = Math.round(baseRate * 1.3); // Principal Architect
  const r2 = Math.round(baseRate * 1.05); // Senior Full-Stack
  const r3 = Math.round(baseRate * 0.95); // UI/UX Designer
  const r4 = Math.round(baseRate * 0.90); // QA Automation Lead
  const r5 = Math.round(baseRate * 1.10); // DevOps & Cloud Specialist

  const a1 = Math.round(subtotal * 0.22);
  const a2 = Math.round(subtotal * 0.38);
  const a3 = Math.round(subtotal * 0.18);
  const a4 = Math.round(subtotal * 0.12);
  const a5 = subtotal - (a1 + a2 + a3 + a4);

  const costBreakdown: ProposalCost[] = [
    { id: '1', category: 'Architecture & Governance', description: 'Lead System Architect: High-level design, database schemas, and interface contracts', hours: Math.round(a1 / r1), rate: r1, amount: a1 },
    { id: '2', category: 'Core Full-Stack Engineering', description: 'Senior Engineers: Backend services, client UI, API integrations, and business logic', hours: Math.round(a2 / r2), rate: r2, amount: a2 },
    { id: '3', category: 'UI/UX Design & Prototyping', description: 'Product Designer: Wireframes, Figma prototypes, dark minimalist component tokens', hours: Math.round(a3 / r3), rate: r3, amount: a3 },
    { id: '4', category: 'Quality Assurance & Auditing', description: 'QA Specialist: E2E Playwright test automation, vulnerability scan, and UAT triage', hours: Math.round(a4 / r4), rate: r4, amount: a4 },
    { id: '5', category: 'Cloud DevOps & CI/CD', description: 'DevOps Engineer: Kubernetes/Docker containers, GitHub Actions, and production cutover', hours: Math.round(a5 / r5), rate: r5, amount: a5 },
  ];

  // Tangible Deliverables
  const deliverables = [
    { name: 'Architecture & OpenAPI Specification', description: 'Complete system architecture document, data schemas, and interactive Swagger/OpenAPI docs.', phase: 'Phase 1: Discovery' },
    { name: 'Figma High-Fidelity Prototype', description: 'Fully interactive, dark-mode design system containing all responsive views and UI states.', phase: 'Phase 2: Design' },
    { name: 'Production Source Code Repository', description: 'Full ownership of GitHub repository with commit history, Clean Code standards, and documentation.', phase: 'Phase 3: Core Engineering' },
    { name: 'Automated Test Suite & PenTest Report', description: 'Automated Playwright/Jest integration suites with 90%+ branch coverage and security audit certificate.', phase: 'Phase 4: QA & Testing' },
    { name: 'Production Infrastructure & CI/CD Manifests', description: 'Automated Helm/Docker configurations, staging environment, and zero-downtime production deployment.', phase: 'Phase 5: Production Launch' },
    { name: 'Handover Vault & 90-Day Warranty Runbook', description: 'Operational runbook, architecture diagrams, credential vault keys, and 90-day defect warranty.', phase: 'Phase 5: Production Launch' },
  ];

  // Tech Stack Recommendation
  const preferred = techStackPreference && techStackPreference.length ? techStackPreference.join(', ') : '';
  let techStackRecommendation = `We recommend a high-performance, modern technology stack. `;
  if (preferred) {
    techStackRecommendation += `Incorporating your preferred stack (${preferred}), we will architect the platform for maximum scalability and maintainability. `;
  }
  if (isAi) {
    techStackRecommendation += `Frontend: Next.js 15 (React 19, TypeScript, Tailwind CSS) • Backend: Python / FastAPI & Node.js • AI/ML: PyTorch, Whisper V3, LangChain/LlamaIndex • Vector Store: pgvector / Redis • Ingress: Cloudflare Workers & WebSockets.`;
  } else if (isFintech) {
    techStackRecommendation += `Frontend: Next.js 15 App Router & Tailwind CSS • Backend: Rust & Node.js microservices • Database: PostgreSQL with TimescaleDB & Redis cache • Payments: Stripe Connect • Security: AWS Nitro Enclaves, TLS 1.3, HSM key management.`;
  } else if (isMobile) {
    techStackRecommendation += `Client: React Native / Flutter with native bridges • Backend: Node.js / Go REST API • Cloud: AWS ECS, S3, CloudFront CDN • State Management: Zustand & TanStack Query • Push: Firebase Cloud Messaging.`;
  } else {
    techStackRecommendation += `Frontend: Next.js 15 (React 19, TypeScript) • Backend: Node.js / PostgreSQL / Prisma • Cache: Redis • Deployment: Docker containers on AWS / Vercel Enterprise • Monitoring: Datadog & Sentry.`;
  }

  // Enterprise Assumptions & SLA
  const assumptions = [
    'Client will provide timely access to necessary brand guidelines, API credentials, and third-party keys.',
    'Review cycles and feedback on milestone deliverables provided within 2 business days.',
    'Includes 90-day post-launch bug warranty covering any defect within the agreed functional specifications.',
    'System architected to maintain 99.9% uptime with < 200ms average server response times.',
    'Direct communication pipeline via dedicated Binary Froster portal workspace, Slack connect, and weekly demo meetings.'
  ];

  const termsAndConditions = `Payment Structure:
• 30% Initial Mobilization Deposit upon proposal execution & contract signing.
• 40% Intermediate Milestone Sign-off upon successful staging build delivery & demo.
• 30% Final Production Sign-off following User Acceptance Testing (UAT) and DNS cutover.

This technical proposal remains valid for 30 calendar days from ${new Date().toLocaleDateString()}. All intellectual property transfers directly to ${clientName} upon final project settlement.`;

  return {
    executiveSummary,
    scopeOfWork,
    phases,
    costBreakdown,
    deliverables,
    techStackRecommendation,
    assumptions,
    termsAndConditions,
    subtotal,
    taxRate,
    taxAmount,
    grandTotal,
    validUntil
  };
};

export async function POST(request: NextRequest) {
  try {
    const body: ProposalGenerateRequest = await request.json();

    // 1. Validation & Input Sanitization
    if (!body.clientName || !body.projectTitle || !body.estimatedBudget || !body.currency) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Minimum budget validation
    let minBudget = 500;
    if (body.currency === 'GBP') minBudget = 400;
    if (body.currency === 'INR') minBudget = 40000;

    if (body.estimatedBudget < minBudget) {
      return NextResponse.json({ success: false, error: `Minimum budget for ${body.currency} is ${minBudget}` }, { status: 400 });
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const hasOpenAi = Boolean(openAiKey && openAiKey !== 'placeholder');
    const hasGemini = Boolean(geminiKey && geminiKey !== 'placeholder');

    // 2. Fallback to template if no AI keys configured
    if (!hasOpenAi && !hasGemini) {
      console.warn('AI Proposal Generator: No active AI API key provided. Falling back to template system.');
      const proposal = generateTemplateProposal(body);
      return NextResponse.json({ success: true, proposal, source: 'template' });
    }

    // 3. Prompt Setup
    const systemPrompt = `You are an expert technical proposal writer for "Binary Froster", an elite, premium software studio.
We specialize in enterprise-grade solutions, dark-themed luxury aesthetics, and high-performance engineering.
Tone: Professional, authoritative, highly technical, and persuasive.

Rate Card Calibration (Hourly Rates):
- USD: $65 - $150/hr
- GBP: £55 - £120/hr
- INR: ₹2500 - ₹6000/hr

You must output a JSON object EXACTLY matching this structure, with NO markdown code blocks outside of the JSON:
{
  "executiveSummary": "string",
  "scopeOfWork": [{ "title": "string", "description": "string", "included": true }],
  "phases": [{ "name": "string", "duration": "string", "startWeek": number, "endWeek": number, "milestones": ["string"], "cost": number }],
  "costBreakdown": [{ "id": "string", "category": "string", "description": "string", "hours": number, "rate": number, "amount": number }],
  "deliverables": [{ "name": "string", "description": "string", "phase": "string" }],
  "techStackRecommendation": "string",
  "assumptions": ["string"],
  "termsAndConditions": "string",
  "subtotal": number,
  "taxRate": number,
  "taxAmount": number,
  "grandTotal": number,
  "validUntil": "YYYY-MM-DD"
}

Critical Instructions:
- The total project cost (subtotal) MUST closely align (within 15% variance) with the user's estimated budget of ${body.estimatedBudget} ${body.currency}.
- Ensure the sum of phase costs equals the subtotal.
- Ensure the sum of costBreakdown amounts equals the subtotal.
- Calculate tax accurately: 10% (0.10) for USD/GBP, 18% (0.18) for INR. taxAmount = subtotal * taxRate. grandTotal = subtotal + taxAmount.
- Set validUntil to 30 days from today.`;

    const userPrompt = `Generate a detailed, premium software development proposal based on these requirements:
Client Name: ${body.clientName}
Project Title: ${body.projectTitle}
Project Type: ${body.projectType}
Brief Description: ${body.briefDescription}
Estimated Budget: ${body.estimatedBudget} ${body.currency}
Timeline Preference: ${body.timelinePreference}
Tech Stack Preferences: ${body.techStackPreference?.join(', ') || 'Recommend standard modern stack'}
Priority Features: ${body.priorityFeatures}`;

    try {
      // Prioritize OpenAI if configured, otherwise use Gemini
      if (hasOpenAi) {
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          signal: AbortSignal.timeout(12000),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7
          })
        });

        if (!aiResponse.ok) {
          throw new Error(`OpenAI API error: ${aiResponse.status} ${aiResponse.statusText}`);
        }

        const aiData = await aiResponse.json();
        const proposal = JSON.parse(aiData.choices[0].message.content);
        return NextResponse.json({ success: true, proposal, source: 'openai' });
      } else if (hasGemini) {
        const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

        const aiResponse = await fetch(geminiUrl, {
          method: 'POST',
          signal: AbortSignal.timeout(12000),
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\n${userPrompt}` }
                ]
              }
            ],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.7
            }
          })
        });

        if (!aiResponse.ok) {
          throw new Error(`Gemini API error: ${aiResponse.status} ${aiResponse.statusText}`);
        }

        const aiData = await aiResponse.json();
        const rawContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawContent) {
          throw new Error('Gemini returned an empty candidate response');
        }

        const proposal = JSON.parse(rawContent);
        return NextResponse.json({ success: true, proposal, source: 'gemini' });
      }
    } catch (apiError) {
      console.error('Live AI Proposal generation failed, falling back to template:', apiError);
      const proposal = generateTemplateProposal(body);
      return NextResponse.json({ 
        success: true, 
        proposal, 
        source: 'template', 
        error: 'Live AI request failed, generated via template engine' 
      });
    }
    
  } catch (error) {
    console.error('Proposal Request Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process proposal request' },
      { status: 500 }
    );
  }
}
