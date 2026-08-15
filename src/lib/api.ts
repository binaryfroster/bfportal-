import { User, Project, Milestone, Task, FileDoc, ApprovalDeliverable, Invoice, Message, Meeting, SupportTicket, Contract, Notification } from "../types";

const API_BASE = "/api";

// Get token from localStorage
export function getToken(): string | null {
  return localStorage.getItem("bf_session_token");
}

export function setToken(token: string) {
  localStorage.setItem("bf_session_token", token);
}

export function clearToken() {
  localStorage.removeItem("bf_session_token");
  localStorage.removeItem("bf_user");
}

export function getCachedUser(): User | null {
  const u = localStorage.getItem("bf_user");
  return u ? JSON.parse(u) : null;
}

export function setCachedUser(user: User) {
  localStorage.setItem("bf_user", JSON.stringify(user));
}

// Request Helper
async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "System encountered an error" }));
    throw new Error(err.error || `HTTP error! status: ${res.status}`);
  }
  
  return res.json();
}

// Exported API Actions
export const api = {
  // Auth
  async login(email: string): Promise<{ token: string; user: User }> {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    setToken(data.token);
    setCachedUser(data.user);
    return data;
  },
  
  async socialLogin(provider: string, email: string): Promise<{ token: string; user: User }> {
    const data = await request("/auth/social-login", {
      method: "POST",
      body: JSON.stringify({ provider, email }),
    });
    setToken(data.token);
    setCachedUser(data.user);
    return data;
  },
  
  async resetPasswordRequest(email: string): Promise<{ success: boolean; message: string; resetLink?: string }> {
    return request("/auth/reset-password-request", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  
  async resetPassword(password: string): Promise<{ success: boolean }> {
    return request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  },
  
  // Projects
  async getProjects(): Promise<Project[]> {
    return request("/projects");
  },
  
  async updateProjectPhase(projectId: string, phase: string, progress: number): Promise<{ success: boolean; project: Project }> {
    return request(`/projects/${projectId}/phase`, {
      method: "POST",
      body: JSON.stringify({ phase, progress }),
    });
  },
  
  async getMilestones(projectId: string): Promise<Milestone[]> {
    return request(`/projects/${projectId}/milestones`);
  },
  
  async updateMilestones(projectId: string, milestones: Milestone[]): Promise<{ success: boolean; milestones: Milestone[] }> {
    return request(`/projects/${projectId}/milestones/update`, {
      method: "POST",
      body: JSON.stringify({ milestones }),
    });
  },
  
  // Tasks
  async getTasks(projectId: string): Promise<Task[]> {
    return request(`/projects/${projectId}/tasks`);
  },
  
  async moveTask(taskId: string, column: string): Promise<{ success: boolean; task: Task }> {
    return request("/tasks/move", {
      method: "POST",
      body: JSON.stringify({ taskId, column }),
    });
  },
  
  async submitTaskFeedback(taskId: string, feedbackText: string, priority: string): Promise<{ success: boolean; task: Task }> {
    return request(`/tasks/${taskId}/feedback`, {
      method: "POST",
      body: JSON.stringify({ feedbackText, priority }),
    });
  },
  
  async saveTask(taskData: Partial<Task>): Promise<{ success: boolean; tasks: Task[] }> {
    return request("/tasks/manage", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  },
  
  async deleteTask(taskId: string): Promise<{ success: boolean }> {
    return request(`/tasks/${taskId}`, {
      method: "DELETE",
    });
  },
  
  // Files
  async getFiles(projectId: string): Promise<FileDoc[]> {
    return request(`/projects/${projectId}/files`);
  },
  
  async uploadFile(fileData: {
    projectId: string;
    name: string;
    phase: string;
    size: string;
    base64Data: string;
    type: string;
  }): Promise<{ success: boolean; file: FileDoc }> {
    return request("/files/upload", {
      method: "POST",
      body: JSON.stringify(fileData),
    });
  },
  
  // Approvals
  async getApprovals(projectId: string): Promise<ApprovalDeliverable[]> {
    return request(`/projects/${projectId}/approvals`);
  },
  
  async getAdminApprovals(): Promise<any[]> {
    return request("/admin/approvals");
  },
  
  async actionApproval(id: string, action: "Approve" | "Request Changes", feedback: any): Promise<{ success: boolean; approval: ApprovalDeliverable }> {
    return request(`/approvals/${id}/action`, {
      method: "POST",
      body: JSON.stringify({ action, feedback }),
    });
  },
  
  async uploadDeliverable(deliverableData: {
    projectId: string;
    name: string;
    description: string;
    fileUrl?: string;
  }): Promise<{ success: boolean; deliverable: ApprovalDeliverable }> {
    return request("/approvals/upload", {
      method: "POST",
      body: JSON.stringify(deliverableData),
    });
  },
  
  // Invoices & Billing
  async getInvoices(projectId: string): Promise<Invoice[]> {
    return request(`/projects/${projectId}/invoices`);
  },
  
  async getAdminBilling(): Promise<{ totalEarned: number; totalOutstanding: number; totalOverdue: number; invoices: any[] }> {
    return request("/admin/billing-summary");
  },
  
  async createInvoice(invoiceData: {
    projectId: string;
    description: string;
    lineItems: Array<{ description: string; amount: number }>;
    dueDate?: string;
  }): Promise<{ success: boolean; invoice: Invoice }> {
    return request("/invoices/create", {
      method: "POST",
      body: JSON.stringify(invoiceData),
    });
  },

  async createMilestone(milestoneData: {
    projectId: string;
    title: string;
    description: string;
    dueDate: string;
  }): Promise<{ success: boolean; milestones: Milestone[] }> {
    const current = await this.getMilestones(milestoneData.projectId);
    const order = current.length + 1;
    const newMilestone: Milestone = {
      id: "milestone-" + Date.now(),
      projectId: milestoneData.projectId,
      title: milestoneData.title,
      description: milestoneData.description,
      dueDate: milestoneData.dueDate,
      completedDate: null,
      status: "Upcoming",
      order
    };
    return this.updateMilestones(milestoneData.projectId, [...current, newMilestone]);
  },
  
  async getCheckoutSession(invoiceId: string): Promise<{ success: boolean; checkoutUrl: string }> {
    return request(`/invoices/${invoiceId}/checkout`, {
      method: "POST",
    });
  },
  
  async completePayment(invoiceId: string): Promise<{ success: boolean; invoice: Invoice }> {
    return request(`/invoices/${invoiceId}/pay-success`, {
      method: "POST",
    });
  },
  
  async manualPayInvoice(invoiceId: string): Promise<{ success: boolean; invoice: Invoice }> {
    return request(`/admin/invoices/${invoiceId}/manual-pay`, {
      method: "POST",
    });
  },
  
  // Messages
  async getMessages(projectId: string): Promise<Message[]> {
    return request(`/projects/${projectId}/messages`);
  },
  
  async getAdminInbox(): Promise<any[]> {
    return request("/admin/messages-inbox");
  },
  
  async sendMessage(projectId: string, content: string, fileUrl?: string, fileName?: string, senderId?: string, senderName?: string, senderRole?: string, senderAvatar?: string): Promise<{ success: boolean; message: Message }> {
    return request(`/projects/${projectId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, fileUrl, fileName, senderId, senderName, senderRole, senderAvatar }),
    });
  },
  
  async markMessagesRead(projectId: string): Promise<{ success: boolean }> {
    return request(`/projects/${projectId}/messages/mark-read`, {
      method: "POST",
    });
  },
  
  // Meetings
  async getMeetings(projectId: string): Promise<Meeting[]> {
    return request(`/projects/${projectId}/meetings`);
  },
  
  async bookMeeting(projectId: string, meetingData: { type: string; date: string; timeSlot: string }): Promise<{ success: boolean; meeting: Meeting }> {
    return request(`/projects/${projectId}/meetings/book`, {
      method: "POST",
      body: JSON.stringify(meetingData),
    });
  },
  
  // Tickets
  async getTickets(projectId: string): Promise<SupportTicket[]> {
    return request(`/projects/${projectId}/tickets`);
  },
  
  async getAdminTickets(): Promise<any[]> {
    return request("/admin/tickets");
  },
  
  async raiseTicket(ticketData: {
    projectId: string;
    title: string;
    description: string;
    category: string;
    priority: string;
  }): Promise<{ success: boolean; ticket: SupportTicket }> {
    return request("/tickets/raise", {
      method: "POST",
      body: JSON.stringify(ticketData),
    });
  },
  
  async replyTicket(ticketId: string, content: string): Promise<{ success: boolean; ticket: SupportTicket }> {
    return request(`/tickets/${ticketId}/reply`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },
  
  async updateTicketStatus(ticketId: string, status: string, assignedToName?: string): Promise<{ success: boolean; ticket: SupportTicket }> {
    return request(`/admin/tickets/${ticketId}/status`, {
      method: "POST",
      body: JSON.stringify({ status, assignedToName }),
    });
  },
  
  // Contracts
  async getContracts(projectId: string): Promise<Contract[]> {
    return request(`/projects/${projectId}/contracts`);
  },
  
  async signContract(contractId: string, legalName: string, ipAddress: string): Promise<{ success: boolean; contract: Contract }> {
    return request(`/contracts/${contractId}/sign`, {
      method: "POST",
      body: JSON.stringify({ legalName, ipAddress }),
    });
  },
  
  async uploadContract(contractData: { projectId: string; name: string; fileUrl?: string }): Promise<{ success: boolean; contract: Contract }> {
    return request("/admin/contracts/upload", {
      method: "POST",
      body: JSON.stringify(contractData),
    });
  },
  
  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return request("/notifications");
  },
  
  async markNotificationsRead(notifId?: string): Promise<{ success: boolean }> {
    return request("/notifications/read", {
      method: "POST",
      body: JSON.stringify({ notifId }),
    });
  },

  async readNotification(id: string): Promise<{ success: boolean }> {
    return this.markNotificationsRead(id);
  },
  
  // Settings & Management
  async updateProfile(profileData: Partial<User>): Promise<{ success: boolean; user: User }> {
    const data = await request("/profile/update", {
      method: "POST",
      body: JSON.stringify(profileData),
    });
    setCachedUser(data.user);
    return data;
  },

  async getCurrentUser(): Promise<{ user: User; projects: Project[] } | null> {
    const user = getCachedUser();
    if (!user) return null;
    try {
      const projects = await this.getProjects();
      return { user, projects };
    } catch (err) {
      return null;
    }
  },

  logout() {
    clearToken();
  },
  
  async getAdminClients(): Promise<any[]> {
    return request("/admin/clients");
  },
  
  async toggleClientStatus(clientId: string): Promise<{ success: boolean; clientUser: any }> {
    return request(`/admin/clients/${clientId}/toggle-status`, {
      method: "POST",
    });
  },
  
  async getEmailLogs(): Promise<any[]> {
    return request("/admin/emails-sent");
  },

  async createClientAccount(clientData: { name: string; email: string; companyName?: string; phone?: string }): Promise<{ success: boolean; user: any }> {
    return request("/admin/clients/create", {
      method: "POST",
      body: JSON.stringify(clientData),
    });
  }
};
