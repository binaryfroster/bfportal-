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
 * Fallback generator when AI is unavailable or fails
 */
const generateTemplateProposal = (req: ProposalGenerateRequest) => {
  const { estimatedBudget, currency, projectType, clientName, projectTitle, techStackPreference } = req;
  
  let baseRate = 100;
  if (currency === 'USD') baseRate = 85;
  if (currency === 'GBP') baseRate = 75;
  if (currency === 'INR') baseRate = 3500;

  const budget = estimatedBudget || (currency === 'INR' ? 500000 : 5000);
  
  const subtotal = budget;
  const taxRate = currency === 'INR' ? 0.18 : 0.10;
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + 30);
  const validUntil = validUntilDate.toISOString().split('T')[0];

  const templateProposal = {
    executiveSummary: `Binary Froster is pleased to present this proposal for the ${projectTitle} project. Based on our understanding of ${clientName}'s requirements, we propose a comprehensive ${projectType} solution. Our premium software studio is uniquely positioned to deliver this project with the highest quality standards, robust architecture, and a focus on enterprise scalability.`,
    scopeOfWork: [
      { title: 'Project Discovery & Architecture', description: 'Initial requirements gathering, system architecture planning, and technical specification.', included: true },
      { title: 'UI/UX Design', description: 'Wireframing, prototyping, and high-fidelity mockups reflecting premium brand identity.', included: true },
      { title: 'Core Development', description: 'Frontend and backend implementation based on approved designs and architecture.', included: true },
      { title: 'Testing & QA', description: 'Comprehensive functional, performance, security, and automated testing.', included: true },
      { title: 'Deployment & Launch', description: 'Production server setup, CI/CD pipeline configuration, and deployment.', included: true }
    ],
    phases: [
      { name: 'Discovery', duration: '1-2 weeks', startWeek: 1, endWeek: 2, milestones: ['Requirements Document', 'System Architecture Plan'], cost: subtotal * 0.15 },
      { name: 'Design', duration: '2-3 weeks', startWeek: 2, endWeek: 4, milestones: ['UI/UX Mockups', 'Clickable Prototype'], cost: subtotal * 0.20 },
      { name: 'Development', duration: '4-8 weeks', startWeek: 4, endWeek: 8, milestones: ['Frontend Implementation', 'Backend API', 'Integration'], cost: subtotal * 0.35 },
      { name: 'Testing', duration: '1-2 weeks', startWeek: 8, endWeek: 9, milestones: ['QA Sign-off', 'User Acceptance Testing (UAT)'], cost: subtotal * 0.15 },
      { name: 'Launch & Support', duration: 'Ongoing', startWeek: 9, endWeek: 10, milestones: ['Production Deployment', 'Handover', 'Post-Launch Support Plan'], cost: subtotal * 0.10 }
    ],
    costBreakdown: [
      { id: '1', category: 'Discovery', description: 'Planning and Architecture', hours: Math.round((subtotal * 0.15) / baseRate), rate: baseRate, amount: subtotal * 0.15 },
      { id: '2', category: 'Design', description: 'UI/UX Design', hours: Math.round((subtotal * 0.20) / baseRate), rate: baseRate, amount: subtotal * 0.20 },
      { id: '3', category: 'Development', description: 'Engineering', hours: Math.round((subtotal * 0.35) / baseRate), rate: baseRate, amount: subtotal * 0.35 },
      { id: '4', category: 'Testing', description: 'QA and UAT', hours: Math.round((subtotal * 0.15) / baseRate), rate: baseRate, amount: subtotal * 0.15 },
      { id: '5', category: 'Launch', description: 'Deployment and Support', hours: Math.round((subtotal * 0.10) / baseRate), rate: baseRate, amount: subtotal * 0.10 }
    ],
    deliverables: [
      { name: 'Requirements & Architecture Specification', description: 'Detailed technical specification document', phase: 'Discovery' },
      { name: 'Figma Design Files', description: 'Complete UI/UX design files and component library', phase: 'Design' },
      { name: 'Source Code', description: 'Fully documented source code repository with intellectual property transfer', phase: 'Development' },
      { name: 'Testing Reports', description: 'QA test cases, automation scripts, and results', phase: 'Testing' }
    ],
    techStackRecommendation: `Based on the requirements for a modern ${projectType}, we recommend a robust stack. Preferential technologies include: ${techStackPreference && techStackPreference.length ? techStackPreference.join(', ') : 'Next.js, React, Node.js, and modern cloud infrastructure'}. This ensures scalability, performance, and long-term maintainability.`,
    assumptions: [
      'Client will provide necessary brand assets, API keys, and content in a timely manner.',
      'Prompt feedback within 24-48 hours on milestone deliverables.',
      'Any third-party licensing costs (e.g., specific SaaS tools) are excluded from this estimate.',
      'Scope changes post-discovery may require a change request and budget adjustment.'
    ],
    termsAndConditions: 'Payment terms are structured around project milestones: 30% upfront on signing, 40% upon completion of primary development phase, and 30% post-deployment and UAT sign-off. This proposal is valid for 30 days from the date of generation.',
    subtotal,
    taxRate,
    taxAmount,
    grandTotal,
    validUntil
  };

  return templateProposal;
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
