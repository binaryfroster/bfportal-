"use client";

import * as React from "react";
import { useUser } from "@/src/components/providers/auth-provider";

// ──────────────────────────────────────────────
// Type Definitions (local to the store)
// ──────────────────────────────────────────────

export interface ProjectInfo {
  id: string;
  name: string;
  phase: string;
  progress: number;
  upcomingMilestoneName: string;
  upcomingMilestoneDate: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completedDate: string | null;
  status: "Upcoming" | "In Progress" | "Completed" | "Delayed";
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToName: string;
  assignedToAvatar: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  column: "To Do" | "In Progress" | "In Review" | "Completed";
  files: Array<{ name: string; url: string }>;
  feedback?: { text: string; priority: string; date: string } | null;
}

export interface FileDoc {
  id: string;
  name: string;
  phase: string;
  uploadedByName: string;
  size: string;
  version: number;
  versions: Array<{ version: number; url: string; uploadedAt: string; uploadedByName: string }>;
  url: string;
  type: string;
}

export interface ApprovalDeliverable {
  id: string;
  name: string;
  description: string;
  fileUrl: string;
  status: "Pending" | "Approved" | "Changes Requested";
  reviewerName: string | null;
  reviewerId: string | null;
  actionTimestamp: string | null;
  feedback: { sectionFeedback: string; priority: string; fileName?: string } | null;
  auditTrail: Array<{ event: string; user: string; timestamp: string }>;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  lineItems: Array<{ description: string; amount: number }>;
  tax: number;
  total: number;
  paidAt: string | null;
}

export interface Message {
  id: string;
  senderName: string;
  senderRole: "client" | "admin";
  senderAvatar: string;
  text: string;
  timestamp: string;
  attachments?: Array<{ name: string; url: string }>;
}

export interface Meeting {
  id: string;
  agenda: string;
  hostName: string;
  dateTime: string;
  timezone: string;
  meetUrl: string;
}

export interface Reply {
  senderName: string;
  senderRole: "client" | "admin";
  content: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved";
  description: string;
  clientName: string;
  replies: Reply[];
}

export interface Contract {
  id: string;
  name: string;
  description: string;
  status: "Draft" | "Pending Signature" | "Fully Executed";
  fileUrl: string;
  signedName: string | null;
  signedAt: string | null;
  ipAddress: string | null;
}

export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  template: string;
  timestamp: string;
  payload: any;
}

// ──────────────────────────────────────────────
// Context API shape
// ──────────────────────────────────────────────

import {
  ChangeRequest,
  MaintenancePlan,
  ProjectHandover,
  CredentialVaultItem,
  NPSFeedback,
  AuditLogEntry,
  ApiKeyItem,
  IntegrationStatus,
  Notification,
} from "@/src/types";

interface PortalDataContextType {
  loading: boolean;
  project: ProjectInfo | null;
  milestones: Milestone[];
  tasks: Task[];
  files: FileDoc[];
  approvals: ApprovalDeliverable[];
  invoices: Invoice[];
  messages: Message[];
  meetings: Meeting[];
  tickets: SupportTicket[];
  contracts: Contract[];
  emailLogs: EmailLog[];

  // Enterprise Modules State
  changeRequests: ChangeRequest[];
  maintenancePlan: MaintenancePlan | null;
  projectHandover: ProjectHandover | null;
  credentialVault: CredentialVaultItem[];
  npsFeedback: NPSFeedback[];
  auditLogs: AuditLogEntry[];
  notifications: Notification[];
  integrations: IntegrationStatus[];
  apiKeys: ApiKeyItem[];

  // Mutations
  signContract: (contractId: string, legalName: string) => void;
  payInvoice: (invoiceId: string) => void;
  createTicket: (ticket: Omit<SupportTicket, "id" | "replies">) => void;
  replyToTicket: (ticketId: string, reply: Reply) => void;
  resolveTicket: (ticketId: string) => void;
  sendMessage: (message: Message) => void;
  bookMeeting: (meeting: Meeting) => void;
  approveDeliverable: (id: string, userName: string) => void;
  requestChanges: (id: string, userName: string, feedback: ApprovalDeliverable["feedback"]) => void;
  submitTaskFeedback: (taskId: string, feedback: { text: string; priority: string; date: string }) => void;
  moveTask: (taskId: string, column: Task["column"]) => void;
  uploadFile: (file: FileDoc) => void;
  createInvoice: (invoice: Invoice) => void;
  markInvoicePaid: (invoiceId: string) => void;
  createMilestone: (milestone: Milestone) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket["status"]) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  updateMilestone: (milestoneId: string, updates: Partial<Milestone>) => void;
  updateChangeRequest: (id: string, updates: Partial<ChangeRequest>) => void;
  updateApprovalDeliverable: (id: string, updates: Partial<ApprovalDeliverable>) => void;
  updateTicket: (ticketId: string, updates: Partial<SupportTicket>) => void;

  // Enterprise Module Mutations
  createChangeRequest: (cr: Omit<ChangeRequest, "id" | "createdAt">) => void;
  signoffHandover: (name: string) => void;
  addCredential: (item: Omit<CredentialVaultItem, "id" | "lastRotatedAt">) => void;
  submitFeedback: (item: Omit<NPSFeedback, "id" | "createdAt">) => void;
  markNotificationRead: (id: string) => void;
  toggleIntegration: (id: string) => void;
  createApiKey: (name: string) => void;
  revokeApiKey: (id: string) => void;
}

const PortalDataContext = React.createContext<PortalDataContextType | undefined>(undefined);

// ──────────────────────────────────────────────
// localStorage persistence helpers
// ──────────────────────────────────────────────
const STORAGE_KEY = "bf_portal_data";

function loadPersistedData(): Record<string, any> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistData(data: Record<string, any>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full — silently fail
  }
}

// ──────────────────────────────────────────────
// Seed Data Factory (per-user)
// ──────────────────────────────────────────────

function createSeedData(isAcme: boolean) {
  const project: ProjectInfo = isAcme
    ? {
        id: "project-acme",
        name: "Acme Enterprise AI Logistics System",
        phase: "Design",
        progress: 35,
        upcomingMilestoneName: "Figma High Fidelity Interface Review",
        upcomingMilestoneDate: "2026-07-05",
      }
    : {
        id: "project-swap",
        name: "Sterling Wealth Algorithmic Platform (SWAP)",
        phase: "Build",
        progress: 68,
        upcomingMilestoneName: "Beta Core Ledger Engine Deployment",
        upcomingMilestoneDate: "2026-07-15",
      };

  const milestones: Milestone[] = isAcme
    ? [
        { id: "m-1", title: "Discover: Logistic Pipeline Blueprinting", description: "Map supply chain APIs, routing constraints, and carrier integrations.", dueDate: "2026-05-20", completedDate: "2026-05-19T11:00:00Z", status: "Completed", order: 1 },
        { id: "m-2", title: "Design: Figma High Fidelity Interface Review", description: "Full visual prototyping of dispatcher and operations dashboards.", dueDate: "2026-07-05", completedDate: null, status: "In Progress", order: 2 },
      ]
    : [
        { id: "m-1", title: "Discover: Architecture & Scope Definition", description: "Define database models, Ledger consensus strategies, and compliance frameworks.", dueDate: "2026-04-20", completedDate: "2026-04-18", status: "Completed", order: 1 },
        { id: "m-2", title: "Design: Wireframes & High-Fidelity Prototypes", description: "Generate dark minimalist user dashboards and interactive charts layout.", dueDate: "2026-05-15", completedDate: "2026-05-14", status: "Completed", order: 2 },
        { id: "m-3", title: "Build: Beta Core Ledger Engine Deployment", description: "Create matching engine, risk API and integration with Sterling's core banking.", dueDate: "2026-07-15", completedDate: null, status: "In Progress", order: 3 },
        { id: "m-4", title: "Test: Penetration Testing & Load Simulation", description: "Run full PenTest sweeps and 10k concurrent user load simulations.", dueDate: "2026-08-20", completedDate: null, status: "Upcoming", order: 4 },
        { id: "m-5", title: "Launch: Production Deployment & DNS Cutover", description: "Go-live with blue-green deployment and monitoring dashboards.", dueDate: "2026-09-15", completedDate: null, status: "Upcoming", order: 5 },
      ];

  const tasks: Task[] = isAcme
    ? [
        { id: "t-1", title: "Establish Google Maps Places API Hooks", description: "Inject premium address validations into dispatcher input panels.", assignedToName: "Jawad Khan Hakim", assignedToAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", dueDate: "2026-07-02", priority: "High", column: "In Progress", files: [] },
      ]
    : [
        { id: "t-1", title: "Develop Portfolio Rebalancing Algorithms", description: "Implement high-throughput portfolio allocations matching UK regulatory bounds.", assignedToName: "Shivam Dube", assignedToAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", dueDate: "2026-07-01", priority: "Critical", column: "In Progress", files: [] },
        { id: "t-2", title: "Revamp Dark Minimalist User Interface Components", description: "Polish glowing interactive components using premium rgba(0, 212, 255, 0.08) shadows.", assignedToName: "Digvijay Kadam", assignedToAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", dueDate: "2026-06-28", priority: "High", column: "In Review", files: [{ name: "Figma_Screen_Specs_Dark.png", url: "https://images.unsplash.com/photo-1541462608141-2758574e8375?w=500" }] },
        { id: "t-3", title: "Integrate Stripe Connect for Bilateral Payments", description: "Wire Stripe's Connect API for automated split payments between entities.", assignedToName: "Jawad Khan Hakim", assignedToAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", dueDate: "2026-07-10", priority: "Medium", column: "To Do", files: [] },
        { id: "t-4", title: "Deploy Kubernetes Helm Charts for Staging", description: "Create production-grade Helm charts and staging cluster configurations.", assignedToName: "Shivam Dube", assignedToAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", dueDate: "2026-04-30", priority: "Low", column: "Completed", files: [] },
      ];

  const files: FileDoc[] = [
    { id: "file-1", name: "Master_Services_Agreement_Signed.pdf", phase: "Contracts", uploadedByName: "John Sterling", size: "2.4 MB", version: 1, versions: [], url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", type: "PDF" },
    { id: "file-2", name: "UI_UX_Inspiration_Brand_Guidelines.pdf", phase: "References", uploadedByName: "Digvijay Kadam", size: "8.1 MB", version: 2, versions: [{ version: 1, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", uploadedAt: "2026-04-11T09:00:00Z", uploadedByName: "Digvijay Kadam" }], url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", type: "PDF" },
    { id: "file-3", name: "High_Fidelity_Figma_Screens_V1.pdf", phase: "Design", uploadedByName: "Digvijay Kadam", size: "18.2 MB", version: 1, versions: [], url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", type: "PDF" },
  ];

  const approvals: ApprovalDeliverable[] = [
    {
      id: "del-1", name: "Architecture Scoping Document", description: "Full system architecture, microservices breakdown, and infrastructure cost analysis.",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", status: "Pending",
      reviewerName: null, reviewerId: null, actionTimestamp: null, feedback: null,
      auditTrail: [{ event: "Uploaded", user: "Shivam Dube", timestamp: "2026-06-20T10:00:00Z" }],
    },
    {
      id: "del-2", name: "Figma Design Specification v2", description: "Complete high-fidelity dark mode interface for trading dashboards.",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", status: "Approved",
      reviewerName: "John Sterling", reviewerId: "client-john", actionTimestamp: "2026-06-15T14:30:00Z", feedback: null,
      auditTrail: [
        { event: "Uploaded", user: "Digvijay Kadam", timestamp: "2026-06-10T10:00:00Z" },
        { event: "Approved", user: "John Sterling", timestamp: "2026-06-15T14:30:00Z" },
      ],
    },
  ];

  const invoices: Invoice[] = isAcme
    ? [
        { id: "inv-acme-1", invoiceNumber: "BF-2026-001", description: "Discover Phase - Logistics Blueprint", amount: 8000, issueDate: "2026-05-20", dueDate: "2026-06-05", status: "Paid", lineItems: [{ description: "Logistics Blueprint", amount: 8000 }], tax: 0, total: 8000, paidAt: "2026-06-03T15:30:00Z" },
      ]
    : [
        { id: "inv-1", invoiceNumber: "BF-2026-001", description: "Discover phase milestone 1 signoff", amount: 15000, issueDate: "2026-04-20", dueDate: "2026-05-05", status: "Paid", lineItems: [{ description: "Architecture & Scope Definition", amount: 15000 }], tax: 0, total: 15000, paidAt: "2026-05-01T10:00:00Z" },
        { id: "inv-2", invoiceNumber: "BF-2026-002", description: "Design wireframes approval signoff", amount: 20000, issueDate: "2026-05-15", dueDate: "2026-05-30", status: "Paid", lineItems: [{ description: "Wireframes & High-Fidelity Prototypes", amount: 20000 }], tax: 0, total: 20000, paidAt: "2026-05-28T14:00:00Z" },
        { id: "inv-3", invoiceNumber: "BF-2026-003", description: "Phase 3 backend development deposit", amount: 35000, issueDate: "2026-06-15", dueDate: "2026-06-30", status: "Overdue", lineItems: [{ description: "Core Ledger Engine - Phase 3 Backend", amount: 35000 }], tax: 0, total: 35000, paidAt: null },
      ];

  const messages: Message[] = isAcme
    ? [
        { id: "msg-1", senderName: "Shivam Dube", senderRole: "admin", senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", text: "Welcome to Binary Froster, John. Let's align on the logistics dashboard wireframes here.", timestamp: "2026-06-20T09:00:00Z" },
      ]
    : [
        { id: "msg-1", senderName: "Shivam Dube", senderRole: "admin", senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", text: "Good morning John. The core ledger engine is now passing 98% of unit tests. Moving to integration.", timestamp: "2026-06-28T09:00:00Z" },
        { id: "msg-2", senderName: "Digvijay Kadam", senderRole: "admin", senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", text: "Updated the Figma dark-mode components. Please review via the approvals tab.", timestamp: "2026-06-27T14:00:00Z" },
      ];

  const meetings: Meeting[] = isAcme
    ? [
        { id: "meet-acme-1", agenda: "UX Blueprint review", hostName: "Digvijay Kadam", dateTime: "2026-07-07T14:00:00Z", timezone: "Asia/Kolkata", meetUrl: "https://meet.google.com/abc-defg-hij" },
      ]
    : [
        { id: "meet-1", agenda: "Sprint 4 Demo & Ledger Engine Review", hostName: "Shivam Dube", dateTime: "2026-07-08T10:00:00Z", timezone: "Europe/London", meetUrl: "https://meet.google.com/xyz-abcd-efg" },
      ];

  const tickets: SupportTicket[] = isAcme
    ? [
        { id: "t-acme-1", title: "Consensus validation engine timeout", category: "Bug Report", priority: "Critical", status: "In Progress", description: "Consensus checks fail when simulating routing logs with large vehicle queues.", clientName: "John Sterling", replies: [{ senderName: "Shivam Dube", senderRole: "admin", content: "Investigating the timeout. Looks like a cluster buffer size limit.", timestamp: "2026-06-25T11:00:00Z" }] },
      ]
    : [
        { id: "t-swap-1", title: "Trading volume matches latency spike", category: "Bug Report", priority: "High", status: "Open", description: "Simulated high concurrency load is causing matching latencies to spike up to 800ms.", clientName: "Client User", replies: [] },
      ];

  const contracts: Contract[] = isAcme
    ? [
        { id: "con-1", name: "Acme Master Services Agreement (MSA)", description: "Standard master software development agreement defining terms of delivery.", status: "Fully Executed", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", signedName: "John Sterling", signedAt: "2026-05-19T11:00:00Z", ipAddress: "192.168.1.15" },
      ]
    : [
        { id: "con-1", name: "Sterling Master Services Agreement (MSA)", description: "Standard master software development agreement defining terms of delivery.", status: "Fully Executed", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", signedName: "Client User", signedAt: "2026-04-18T10:00:00Z", ipAddress: "192.168.1.15" },
        { id: "con-2", name: "Mutual Non-Disclosure Agreement (NDA)", description: "Protects proprietary matching engine logic and financial structures.", status: "Pending Signature", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", signedName: null, signedAt: null, ipAddress: null },
      ];

  const emailLogs: EmailLog[] = [];

  return { project, milestones, tasks, files, approvals, invoices, messages, meetings, tickets, contracts, emailLogs };
}

// ──────────────────────────────────────────────
// Provider Component
// ──────────────────────────────────────────────

export function PortalDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [loading, setLoading] = React.useState(true);

  const [project, setProject] = React.useState<ProjectInfo | null>(null);
  const [milestones, setMilestones] = React.useState<Milestone[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [files, setFiles] = React.useState<FileDoc[]>([]);
  const [approvals, setApprovals] = React.useState<ApprovalDeliverable[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [meetings, setMeetings] = React.useState<Meeting[]>([]);
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [contracts, setContracts] = React.useState<Contract[]>([]);
  const [emailLogs, setEmailLogs] = React.useState<EmailLog[]>([]);

  // Enterprise Module States
  const [changeRequests, setChangeRequests] = React.useState<ChangeRequest[]>([
    {
      id: "cr-101",
      projectId: "project-swap",
      title: "Add Multi-Currency Settlement Support",
      description: "Extend core ledger API to support dual settlements in GBP and USD simultaneously.",
      priority: "High",
      businessImpact: "Enables immediate expansion to US institutional trading desks.",
      estimatedCost: 8500,
      estimatedHours: 45,
      status: "In Progress",
      requestedByName: "John Sterling",
      createdAt: "2026-06-15T10:00:00Z",
    },
    {
      id: "cr-102",
      projectId: "project-swap",
      title: "Automated Tax Export for HMRC Compliance",
      description: "Export transaction history in XML format compatible with Making Tax Digital (MTD).",
      priority: "Medium",
      businessImpact: "Reduces audit compliance overhead by 80%.",
      estimatedCost: 4200,
      estimatedHours: 20,
      status: "Submitted",
      requestedByName: "John Sterling",
      createdAt: "2026-07-01T14:30:00Z",
    },
  ]);

  const [maintenancePlan] = React.useState<MaintenancePlan>({
    id: "maint-1",
    organizationId: "org-sterling",
    planName: "Enterprise Platinum Care & SLA",
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    slaResponseHours: 1,
    slaResolutionHours: 8,
    monthlySupportHours: 50,
    usedSupportHours: 18,
    uptimeGuarantee: 99.95,
    status: "active",
  });

  const [projectHandover, setProjectHandover] = React.useState<ProjectHandover>({
    id: "ho-1",
    projectId: "project-swap",
    stage: "Ready for Handover",
    repositoryUrl: "https://github.com/binaryfroster/sterling-swap-core",
    deploymentUrl: "https://swap-staging.binaryfroster.io",
    apiDocsUrl: "https://docs.binaryfroster.io/swap/v1",
    trainingMaterialsUrl: "https://drive.google.com/folder/swap-training",
    backupManifestUrl: "https://storage.binaryfroster.io/backups/swap-manifest.json",
    notes: "Phase 1 and Phase 2 codebases verified. Complete test suites passing.",
  });

  const [credentialVault, setCredentialVault] = React.useState<CredentialVaultItem[]>([
    {
      id: "cred-1",
      serviceName: "Stripe Secret Key (Production)",
      environment: "Production",
      usernameOrKey: "sk_live_51M...",
      encryptedSecret: "sk_live_9982348923489234",
      notes: "Rotated quarterly by security team.",
      lastRotatedAt: "2026-05-01T00:00:00Z",
    },
    {
      id: "cred-2",
      serviceName: "PostgreSQL Database Connection String",
      environment: "Production",
      usernameOrKey: "postgres_admin",
      encryptedSecret: "postgres://admin:secretPass@db.binaryfroster.io:5432/swap",
      notes: "Strict IP whitelist enforced.",
      lastRotatedAt: "2026-06-01T00:00:00Z",
    },
  ]);

  const [npsFeedback, setNpsFeedback] = React.useState<NPSFeedback[]>([
    {
      id: "nps-1",
      userName: "John Sterling",
      npsScore: 10,
      csatRating: 5,
      category: "Platform Performance & Delivery Speed",
      comments: "Exceptional engineering speed. The dark aesthetic and responsiveness are world-class.",
      testimonialGranted: true,
      createdAt: "2026-06-20T11:00:00Z",
    },
  ]);

  const [auditLogs] = React.useState<AuditLogEntry[]>([
    { id: "al-1", actorName: "John Sterling", actorRole: "client_admin", action: "LOGIN", resource: "AUTH_GATE", result: "SUCCESS", ipAddress: "192.168.1.15", timestamp: new Date().toISOString() },
    { id: "al-2", actorName: "Shivam Dube", actorRole: "admin", action: "DEPLOY_MILESTONE", resource: "BUILD_ENGINE", result: "SUCCESS", ipAddress: "10.0.4.12", timestamp: new Date(Date.now() - 3600000).toISOString() },
  ]);

  const [notifications, setNotifications] = React.useState<Notification[]>([
    { id: "n-1", userId: "client-john", title: "Milestone Completed", description: "Design: Wireframes & High-Fidelity Prototypes sealed.", timestamp: "2026-06-28T10:00:00Z", link: "/project", isRead: false, type: "milestone" },
    { id: "n-2", userId: "client-john", title: "New Invoice Issued", description: "Invoice BF-2026-003 for $35,000 is ready for payment.", timestamp: "2026-07-01T09:00:00Z", link: "/billing", isRead: false, type: "invoice" },
  ]);

  const [integrations, setIntegrations] = React.useState<IntegrationStatus[]>([
    { id: "int-1", name: "Google Workspace", category: "Calendar", icon: "Google", status: "Connected", lastSyncAt: "2026-07-04T12:00:00Z" },
    { id: "int-2", name: "GitHub Enterprise", category: "Version Control", icon: "GitHub", status: "Connected", lastSyncAt: "2026-07-04T11:30:00Z" },
    { id: "int-3", name: "Figma Cloud", category: "Design", icon: "Figma", status: "Connected", lastSyncAt: "2026-07-03T18:00:00Z" },
    { id: "int-4", name: "Stripe Connect", category: "Payments", icon: "Stripe", status: "Connected", lastSyncAt: "2026-07-04T10:00:00Z" },
    { id: "int-5", name: "Razorpay India", category: "Payments", icon: "Razorpay", status: "Connected", lastSyncAt: "2026-07-04T09:00:00Z" },
  ]);

  const [apiKeys, setApiKeys] = React.useState<ApiKeyItem[]>([
    { id: "ak-1", keyName: "Production Webhook Key", keyPrefix: "bf_live_79a2...", rateLimitPerMin: 120, status: "active", lastUsedAt: "2026-07-04T11:45:00Z", createdAt: "2026-05-10T00:00:00Z" },
  ]);

  const createChangeRequest = (cr: Omit<ChangeRequest, "id" | "createdAt">) => {
    const newCr: ChangeRequest = {
      ...cr,
      id: `cr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setChangeRequests((prev) => [newCr, ...prev]);
  };

  const signoffHandover = (name: string) => {
    setProjectHandover((prev) => ({
      ...prev,
      stage: "Handover Complete" as const,
      clientSignoffName: name,
      signoffTimestamp: new Date().toISOString(),
    }));
  };

  const addCredential = (item: Omit<CredentialVaultItem, "id" | "lastRotatedAt">) => {
    const newItem: CredentialVaultItem = {
      ...item,
      id: `cred-${Date.now()}`,
      lastRotatedAt: new Date().toISOString(),
    };
    setCredentialVault((prev) => [...prev, newItem]);
  };

  const submitFeedback = (item: Omit<NPSFeedback, "id" | "createdAt">) => {
    const newFb: NPSFeedback = {
      ...item,
      id: `nps-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNpsFeedback((prev) => [newFb, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: i.status === "Connected" ? "Not Connected" : "Connected" } : i))
    );
  };

  const createApiKey = (name: string) => {
    const newKey: ApiKeyItem = {
      id: `ak-${Date.now()}`,
      keyName: name,
      keyPrefix: `bf_live_${Math.random().toString(36).substring(2, 6)}...`,
      rateLimitPerMin: 60,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    setApiKeys((prev) => [newKey, ...prev]);
  };

  const revokeApiKey = (id: string) => {
    setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k)));
  };

  // Load data on user change
  React.useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const isAcme = user.email.includes("acme") || user.id.includes("oauth");
    const userKey = `${STORAGE_KEY}_${user.id}`;

    // Try loading persisted data for this user
    let persisted: Record<string, any> | null = null;
    try {
      const raw = localStorage.getItem(userKey);
      persisted = raw ? JSON.parse(raw) : null;
    } catch {
      persisted = null;
    }

    if (persisted) {
      setProject(persisted.project);
      setMilestones(persisted.milestones || []);
      setTasks(persisted.tasks || []);
      setFiles(persisted.files || []);
      setApprovals(persisted.approvals || []);
      setInvoices(persisted.invoices || []);
      setMessages(persisted.messages || []);
      setMeetings(persisted.meetings || []);
      setTickets(persisted.tickets || []);
      setContracts(persisted.contracts || []);
      setEmailLogs(persisted.emailLogs || []);
    } else {
      const seed = createSeedData(isAcme);
      setProject(seed.project);
      setMilestones(seed.milestones);
      setTasks(seed.tasks);
      setFiles(seed.files);
      setApprovals(seed.approvals);
      setInvoices(seed.invoices);
      setMessages(seed.messages);
      setMeetings(seed.meetings);
      setTickets(seed.tickets);
      setContracts(seed.contracts);
      setEmailLogs(seed.emailLogs);
    }

    // Simulate network delay
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [user]);

  // Persist on every state change
  React.useEffect(() => {
    if (!user || loading) return;
    const userKey = `${STORAGE_KEY}_${user.id}`;
    try {
      localStorage.setItem(userKey, JSON.stringify({
        project, milestones, tasks, files, approvals, invoices, messages, meetings, tickets, contracts, emailLogs,
      }));
    } catch {
      // storage full
    }
  }, [user, loading, project, milestones, tasks, files, approvals, invoices, messages, meetings, tickets, contracts, emailLogs]);

  // ── Mutation functions ──

  const signContract = (contractId: string, legalName: string) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? { ...c, status: "Fully Executed" as const, signedName: legalName, signedAt: new Date().toISOString(), ipAddress: "109.145.22.181 (simulated client Ingress)" }
          : c
      )
    );
  };

  const payInvoice = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: "Paid" as const, paidAt: new Date().toISOString() } : inv
      )
    );
  };

  const createTicket = (ticket: Omit<SupportTicket, "id" | "replies">) => {
    const newTicket: SupportTicket = { ...ticket, id: `t-${Date.now()}`, replies: [] };
    setTickets((prev) => [newTicket, ...prev]);
  };

  const replyToTicket = (ticketId: string, reply: Reply) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, replies: [...t.replies, reply] } : t))
    );
  };

  const resolveTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: "Resolved" as const } : t))
    );
  };

  const sendMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const bookMeeting = (meeting: Meeting) => {
    setMeetings((prev) => [...prev, meeting]);
  };

  const approveDeliverable = (id: string, userName: string) => {
    setApprovals((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "Approved" as const,
              reviewerName: userName,
              actionTimestamp: new Date().toISOString(),
              auditTrail: [...d.auditTrail, { event: "Approved", user: userName, timestamp: new Date().toISOString() }],
            }
          : d
      )
    );
  };

  const requestChanges = (id: string, userName: string, feedback: ApprovalDeliverable["feedback"]) => {
    setApprovals((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "Changes Requested" as const,
              reviewerName: userName,
              feedback,
              actionTimestamp: new Date().toISOString(),
              auditTrail: [...d.auditTrail, { event: "Changes Requested", user: userName, timestamp: new Date().toISOString() }],
            }
          : d
      )
    );
  };

  const submitTaskFeedback = (taskId: string, feedback: { text: string; priority: string; date: string }) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, feedback, column: "In Progress" as const } : t))
    );
  };

  const moveTask = (taskId: string, column: Task["column"]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, column } : t))
    );
  };

  const uploadFile = (file: FileDoc) => {
    setFiles((prev) => [...prev, file]);
  };

  const createInvoice = (invoice: Invoice) => {
    setInvoices((prev) => [...prev, invoice]);
  };

  const markInvoicePaid = (invoiceId: string) => {
    payInvoice(invoiceId);
  };

  const createMilestone = (milestone: Milestone) => {
    setMilestones((prev) => [...prev, milestone]);
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket["status"]) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    );
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  };

  const updateMilestone = (milestoneId: string, updates: Partial<Milestone>) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, ...updates } : m))
    );
  };

  const updateChangeRequest = (id: string, updates: Partial<ChangeRequest>) => {
    setChangeRequests((prev) =>
      prev.map((cr) => (cr.id === id ? { ...cr, ...updates } : cr))
    );
  };

  const updateApprovalDeliverable = (id: string, updates: Partial<ApprovalDeliverable>) => {
    setApprovals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const updateTicket = (ticketId: string, updates: Partial<SupportTicket>) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, ...updates } : t))
    );
  };

  return (
    <PortalDataContext.Provider
      value={{
        loading,
        project,
        milestones,
        tasks,
        files,
        approvals,
        invoices,
        messages,
        meetings,
        tickets,
        contracts,
        emailLogs,
        changeRequests,
        maintenancePlan,
        projectHandover,
        credentialVault,
        npsFeedback,
        auditLogs,
        notifications,
        integrations,
        apiKeys,
        signContract,
        payInvoice,
        createTicket,
        replyToTicket,
        resolveTicket,
        sendMessage,
        bookMeeting,
        approveDeliverable,
        requestChanges,
        submitTaskFeedback,
        moveTask,
        uploadFile,
        createInvoice,
        markInvoicePaid,
        createMilestone,
        updateTicketStatus,
        updateTask,
        updateMilestone,
        updateChangeRequest,
        updateApprovalDeliverable,
        updateTicket,
        createChangeRequest,
        signoffHandover,
        addCredential,
        submitFeedback,
        markNotificationRead,
        toggleIntegration,
        createApiKey,
        revokeApiKey,
      }}
    >
      {children}
    </PortalDataContext.Provider>
  );
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function usePortalData() {
  const context = React.useContext(PortalDataContext);
  if (context === undefined) {
    throw new Error("usePortalData must be used within a PortalDataProvider");
  }
  return context;
}
