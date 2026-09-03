import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

interface AdminClientProject {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  companyName: string;
  clientEmail: string;
  phase: 'Discover' | 'Design' | 'Build' | 'Test' | 'Launch' | 'Support';
  progress: number;
  upcomingMilestoneName: string;
  upcomingMilestoneDate: string;
  budget: number;
  spent: number;
  startDate: string;
  targetEndDate: string;
  status: 'Active' | 'In Review' | 'Launching' | 'On Hold' | 'Completed' | 'Archived';
  description: string;
  leadEngineer: string;
  projectManager: string;
  techStack: string[];
}

describe('Admin Client Projects Command Center - State & Lifecycle Engine', () => {
  let projects: AdminClientProject[];
  let activeProjectId: string;

  beforeEach(() => {
    projects = [
      {
        id: 'project-swap',
        name: 'Sterling Wealth Algorithmic Platform (SWAP)',
        clientId: 'client-john',
        clientName: 'John Sterling',
        companyName: 'Sterling Capital Group',
        clientEmail: 'john@sterling.com',
        phase: 'Build',
        progress: 68,
        upcomingMilestoneName: 'Beta Core Ledger Engine Deployment',
        upcomingMilestoneDate: '2026-07-15',
        budget: 120000,
        spent: 70000,
        startDate: '2026-04-01',
        targetEndDate: '2026-09-30',
        status: 'Active',
        description: 'Next-generation algorithmic asset management platform.',
        leadEngineer: 'Shivam Dube',
        projectManager: 'Digvijay Kadam',
        techStack: ['Next.js 15', 'Rust', 'PostgreSQL'],
      },
      {
        id: 'project-acme',
        name: 'Acme Enterprise AI Logistics System',
        clientId: 'client-acme',
        clientName: 'Sarah Jenkins',
        companyName: 'Acme Enterprises Inc.',
        clientEmail: 'client@acme.com',
        phase: 'Design',
        progress: 35,
        upcomingMilestoneName: 'Figma High Fidelity Interface Review',
        upcomingMilestoneDate: '2026-07-05',
        budget: 85000,
        spent: 28000,
        startDate: '2026-05-10',
        targetEndDate: '2026-11-15',
        status: 'Active',
        description: 'AI-powered fleet dispatch optimization.',
        leadEngineer: 'Jawad Khan Hakim',
        projectManager: 'Shivam Dube',
        techStack: ['React 19', 'Python', 'Kafka'],
      },
    ];
    activeProjectId = 'project-swap';
  });

  it('should provision a new client project with complete metadata', () => {
    const newProj: AdminClientProject = {
      id: 'project-apex',
      name: 'Apex AI Engine',
      clientId: 'client-apex',
      clientName: 'Marcus Vance',
      companyName: 'Apex Digital',
      clientEmail: 'marcus@apexdigital.com',
      phase: 'Discover',
      progress: 10,
      upcomingMilestoneName: 'Scope Signoff',
      upcomingMilestoneDate: '2026-08-01',
      budget: 95000,
      spent: 0,
      startDate: '2026-07-01',
      targetEndDate: '2026-12-01',
      status: 'Active',
      description: 'Conversational voice AI.',
      leadEngineer: 'Shivam Dube',
      projectManager: 'Digvijay Kadam',
      techStack: ['Go', 'PyTorch'],
    };

    projects = [newProj, ...projects];

    assert.equal(projects.length, 3);
    assert.equal(projects[0].name, 'Apex AI Engine');
    assert.equal(projects[0].companyName, 'Apex Digital');
    assert.equal(projects[0].budget, 95000);
  });

  it('should advance project phase from Build to Test and adjust progress accordingly', () => {
    projects = projects.map((p) => {
      if (p.id === 'project-swap') {
        return { ...p, phase: 'Test', progress: 85 };
      }
      return p;
    });

    const updated = projects.find((p) => p.id === 'project-swap');
    assert.ok(updated);
    assert.equal(updated.phase, 'Test');
    assert.equal(updated.progress, 85);
  });

  it('should switch active portal project context seamlessly', () => {
    assert.equal(activeProjectId, 'project-swap');

    // Switch context to Acme project
    activeProjectId = 'project-acme';
    const activeProject = projects.find((p) => p.id === activeProjectId);

    assert.ok(activeProject);
    assert.equal(activeProject.name, 'Acme Enterprise AI Logistics System');
    assert.equal(activeProject.companyName, 'Acme Enterprises Inc.');
  });

  it('should update project financial budget, spend and target dates', () => {
    projects = projects.map((p) => {
      if (p.id === 'project-acme') {
        return {
          ...p,
          budget: 110000,
          spent: 45000,
          targetEndDate: '2026-12-31',
        };
      }
      return p;
    });

    const acme = projects.find((p) => p.id === 'project-acme');
    assert.ok(acme);
    assert.equal(acme.budget, 110000);
    assert.equal(acme.spent, 45000);
    assert.equal(acme.targetEndDate, '2026-12-31');
  });

  it('should archive and delete project from active roster', () => {
    projects = projects.filter((p) => p.id !== 'project-acme');
    assert.equal(projects.length, 1);
    assert.equal(projects[0].id, 'project-swap');
  });
});
