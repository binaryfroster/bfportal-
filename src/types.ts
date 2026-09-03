export type UserRole = 
  | 'client' 
  | 'admin'
  | 'client_user' 
  | 'client_admin' 
  | 'super_admin' 
  | 'project_manager' 
  | 'developer' 
  | 'designer' 
  | 'support_agent' 
  | 'finance' 
  | 'account_manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName: string;
  companyLogo?: string;
  organizationId?: string;
  phone: string;
  timezone: string;
  status: 'active' | 'deactivated';
  avatarUrl?: string;
  createdAt: string;
  isTwoFactorEnabled?: boolean;
  totpSecret?: string;
}

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  industry?: string;
  website?: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  healthScore: number; // 0 - 100
  healthExplanation: string;
  accountManagerName?: string;
  status: 'active' | 'onboarding' | 'suspended' | 'archived';
  createdAt: string;
}

export type ProjectPhase = 'Discover' | 'Design' | 'Build' | 'Test' | 'Launch' | 'Support';

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  companyName: string;
  organizationId?: string;
  phase: ProjectPhase;
  progress: number; // 0 - 100
  upcomingMilestoneName: string;
  upcomingMilestoneDate: string;
  createdAt: string;
}

export type ProjectStatus = 'Active' | 'In Review' | 'Launching' | 'On Hold' | 'Completed' | 'Archived';

export interface AdminClientProject {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  companyName: string;
  clientEmail: string;
  organizationId?: string;
  phase: ProjectPhase;
  progress: number; // 0 - 100
  upcomingMilestoneName: string;
  upcomingMilestoneDate: string;
  budget: number;
  spent: number;
  startDate: string;
  targetEndDate: string;
  status: ProjectStatus;
  description: string;
  leadEngineer: string;
  projectManager: string;
  designer?: string;
  repositoryUrl?: string;
  stagingUrl?: string;
  productionUrl?: string;
  techStack: string[];
  createdAt: string;
}

export type MilestoneStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Delayed';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  completedDate: string | null;
  status: MilestoneStatus;
  order: number;
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskColumn = 'To Do' | 'In Progress' | 'In Review' | 'Completed';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedToName: string;
  assignedToAvatar: string;
  dueDate: string;
  priority: TaskPriority;
  column: TaskColumn;
  files: Array<{ name: string; url: string }>;
}

export type FileFolder = 'Discover' | 'Design' | 'Build' | 'Test' | 'Launch' | 'Support' | 'Contracts' | 'References';

export interface FileDoc {
  id: string;
  projectId: string;
  name: string;
  phase: FileFolder;
  uploadedByName: string;
  uploadedById: string;
  uploadedAt: string;
  size: string;
  version: number;
  versions: Array<{ version: number; url: string; uploadedAt: string; uploadedByName: string }>;
  url: string;
  type: string;
}

export interface DeliverableFeedback {
  sectionFeedback: string;
  priority: 'Low' | 'Medium' | 'High';
  fileUrl?: string;
  fileName?: string;
}

export interface ApprovalDeliverable {
  id: string;
  projectId: string;
  name: string;
  description: string;
  fileUrl: string;
  status: 'Pending' | 'Approved' | 'Changes Requested';
  reviewerName: string | null;
  reviewerId: string | null;
  actionTimestamp: string | null;
  feedback: DeliverableFeedback | null;
  auditTrail: Array<{
    event: string;
    user: string;
    timestamp: string;
  }>;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export interface InvoiceLineItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  tax: number;
  total: number;
  paidAt: string | null;
  pdfUrl?: string;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  content: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
  readBy: string[];
}

export type MeetingType = 'Discovery Call' | 'Project Review' | 'Support Call';

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  type: MeetingType;
  duration: number;
  date: string;
  timeSlot: string;
  calendarInviteUrl: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  hostName: string;
}

export type TicketCategory = 'Bug Report' | 'Change Request' | 'General Question' | 'Billing Query';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketStatus = 'Open' | 'In Progress' | 'Awaiting Client Response' | 'Resolved';

export interface TicketReply {
  id: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  content: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  projectId: string;
  ticketId: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  replies: TicketReply[];
  slaHours: number;
  assignedToName: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  description: string;
  timestamp: string;
  link: string;
  isRead: boolean;
  type: 'message' | 'milestone' | 'invoice' | 'deliverable' | 'ticket' | 'meeting' | 'contract' | 'system' | 'security';
}

export interface Contract {
  id: string;
  projectId: string;
  name: string;
  fileUrl: string;
  status: 'Pending Signature' | 'Signed' | 'Draft' | 'Fully Executed';
  signatureName?: string;
  signatureIP?: string;
  signatureTimestamp?: string;
  signatureUserId?: string;
  signedName?: string;
  signedAt?: string;
  ipAddress?: string;
  description?: string;
}

// Enterprise Module Extensions
export type ChangeRequestStatus = 
  | 'Submitted' 
  | 'Reviewed' 
  | 'Estimated' 
  | 'Client Approval' 
  | 'Scheduled' 
  | 'In Progress' 
  | 'Completed' 
  | 'Rejected';

export interface ChangeRequest {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  businessImpact: string;
  estimatedCost: number;
  estimatedHours: number;
  status: ChangeRequestStatus;
  requestedByName: string;
  approvedByName?: string;
  approvalTimestamp?: string;
  createdAt: string;
}

export interface MaintenancePlan {
  id: string;
  organizationId: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  slaResponseHours: number;
  slaResolutionHours: number;
  monthlySupportHours: number;
  usedSupportHours: number;
  uptimeGuarantee: number;
  status: 'active' | 'pending_renewal' | 'expired';
}

export interface ProjectHandover {
  id: string;
  projectId: string;
  stage: 'Ready for Handover' | 'Client Review' | 'Client Approval' | 'Handover Complete' | 'Maintenance';
  repositoryUrl: string;
  deploymentUrl: string;
  apiDocsUrl: string;
  trainingMaterialsUrl: string;
  backupManifestUrl: string;
  clientSignoffName?: string;
  signoffTimestamp?: string;
  notes?: string;
}

export interface CredentialVaultItem {
  id: string;
  serviceName: string;
  environment: 'Production' | 'Staging' | 'Development';
  usernameOrKey: string;
  encryptedSecret: string;
  notes?: string;
  lastRotatedAt: string;
}

export interface NPSFeedback {
  id: string;
  userName: string;
  npsScore: number; // 0-10
  csatRating: number; // 1-5
  category: string;
  comments: string;
  testimonialGranted: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  resource: string;
  result: 'SUCCESS' | 'FAILURE' | 'DENIED';
  ipAddress?: string;
  timestamp: string;
}

export interface ApiKeyItem {
  id: string;
  keyName: string;
  keyPrefix: string;
  rateLimitPerMin: number;
  status: 'active' | 'revoked';
  lastUsedAt?: string;
  createdAt: string;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  category: 'Communication' | 'Version Control' | 'Design' | 'Payments' | 'Calendar';
  icon: string;
  status: 'Connected' | 'Not Connected' | 'Degraded';
  lastSyncAt?: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
  tags: string[];
  lastUpdated: string;
  author: string;
}

export interface ClientNote {
  id: string;
  authorName: string;
  authorRole: string;
  tag: 'Important' | 'Billing' | 'Technical' | 'Relationship';
  content: string;
  createdAt: string;
}

// ──────────────────────────────────────────────
// AI Proposal Generator Types
// ──────────────────────────────────────────────

export type ProposalStatus = 'Draft' | 'Generated' | 'Editing' | 'Finalized' | 'Sent' | 'Accepted' | 'Declined';
export type ProposalCurrency = 'USD' | 'GBP' | 'INR';

export interface ProposalScopeSection {
  title: string;
  description: string;
  included: boolean;
}

export interface ProposalPhase {
  name: string;
  duration: string;
  startWeek: number;
  endWeek: number;
  milestones: string[];
  cost: number;
}

export interface ProposalCostLineItem {
  id: string;
  category: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

export interface ProposalDeliverable {
  name: string;
  description: string;
  phase: string;
}

export interface Proposal {
  id: string;
  projectId?: string;
  clientName: string;
  clientEmail?: string;
  projectTitle: string;
  projectType: string;
  briefDescription: string;
  currency: ProposalCurrency;

  // AI-Generated Content (all editable)
  executiveSummary: string;
  scopeOfWork: ProposalScopeSection[];
  phases: ProposalPhase[];
  costBreakdown: ProposalCostLineItem[];
  deliverables: ProposalDeliverable[];
  techStackRecommendation: string;
  assumptions: string[];
  termsAndConditions: string;

  // Calculated Totals (editable overrides)
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;

  // Metadata
  status: ProposalStatus;
  proposalNumber: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
}

