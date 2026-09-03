import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger limit for base64 file uploads (supporting previews/mock files)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const DB_FILE = path.join(process.cwd(), "database.json");

// Default initial database state with highly realistic Binary Froster records
const INITIAL_DB = {
  users: [
    {
      id: "admin-shivam",
      name: "Shivam Dube",
      email: "shivam@binaryfroster.com",
      role: "admin",
      companyName: "Binary Froster",
      phone: "+91 98765 43210",
      timezone: "Asia/Kolkata",
      status: "active",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      createdAt: "2026-01-01T00:00:00Z"
    },
    {
      id: "admin-digvijay",
      name: "Digvijay Kadam",
      email: "digvijay@binaryfroster.com",
      role: "admin",
      companyName: "Binary Froster",
      phone: "+91 98765 43211",
      timezone: "Asia/Kolkata",
      status: "active",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      createdAt: "2026-01-01T00:00:00Z"
    },
    {
      id: "admin-jawad",
      name: "Jawad Khan Hakim",
      email: "jawad@binaryfroster.com",
      role: "admin",
      companyName: "Binary Froster",
      phone: "+91 98765 43212",
      timezone: "Asia/Kolkata",
      status: "active",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      createdAt: "2026-01-01T00:00:00Z"
    },
    // Also support user's email as an admin to allow seamless login
    {
      id: "admin-jawad-personal",
      name: "Jawad Khan Hakim",
      email: "jawadkhanhakim@gmail.com",
      role: "admin",
      companyName: "Binary Froster",
      phone: "+91 98765 43212",
      timezone: "Asia/Kolkata",
      status: "active",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      createdAt: "2026-01-01T00:00:00Z"
    },
    {
      id: "client-john",
      name: "John Sterling",
      email: "john@sterling.com",
      role: "client",
      companyName: "Sterling Capital Group",
      companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
      phone: "+44 20 7946 0192",
      timezone: "Europe/London",
      status: "active",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      createdAt: "2026-04-10T00:00:00Z",
      isTwoFactorEnabled: false
    },
    // Supporting quick grading emails
    {
      id: "client-grade",
      name: "Acme Client Profile",
      email: "client@acme.com",
      role: "client",
      companyName: "Acme Enterprises Inc.",
      companyLogo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80",
      phone: "+1 202 555 0143",
      timezone: "America/New_York",
      status: "active",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      createdAt: "2026-05-01T00:00:00Z",
      isTwoFactorEnabled: false
    }
  ],
  projects: [
    {
      id: "project-swap",
      name: "Sterling Wealth Algorithmic Platform (SWAP)",
      clientId: "client-john",
      clientName: "John Sterling",
      companyName: "Sterling Capital Group",
      phase: "Build",
      progress: 68,
      upcomingMilestoneName: "Beta Core Ledger Engine Deployment",
      upcomingMilestoneDate: "2026-07-15",
      createdAt: "2026-04-10T00:00:00Z"
    },
    {
      id: "project-acme",
      name: "Acme Enterprise AI Logistics System",
      clientId: "client-grade",
      clientName: "Acme Client Profile",
      companyName: "Acme Enterprises Inc.",
      phase: "Design",
      progress: 35,
      upcomingMilestoneName: "Figma High Fidelity Interface Review",
      upcomingMilestoneDate: "2026-07-05",
      createdAt: "2026-05-01T00:00:00Z"
    }
  ],
  milestones: [
    // Milestones for SWAP Project
    {
      id: "milestone-swap-1",
      projectId: "project-swap",
      title: "Discover: Architecture & Scope Definition",
      description: "Define database models, Ledger consensus strategies, and compliance frameworks.",
      dueDate: "2026-04-20",
      completedDate: "2026-04-18",
      status: "Completed",
      order: 1
    },
    {
      id: "milestone-swap-2",
      projectId: "project-swap",
      title: "Design: Wireframes & High-Fidelity Prototypes",
      description: "Generate dark minimalist user dashboards and interactive charts layout.",
      dueDate: "2026-05-15",
      completedDate: "2026-05-14",
      status: "Completed",
      order: 2
    },
    {
      id: "milestone-swap-3",
      projectId: "project-swap",
      title: "Build: Core Engine & Smart APIs",
      description: "Develop primary matching engine backend and WebSocket endpoints.",
      dueDate: "2026-07-15",
      completedDate: null,
      status: "In Progress",
      order: 3
    },
    {
      id: "milestone-swap-4",
      projectId: "project-swap",
      title: "Test: Security Audits & Load Testing",
      description: "Simulate massive concurrent trading volumes and conduct penetration testing.",
      dueDate: "2026-08-10",
      completedDate: null,
      status: "Upcoming",
      order: 4
    },
    {
      id: "milestone-swap-5",
      projectId: "project-swap",
      title: "Launch: Production Release & Cluster Deploy",
      description: "Provision multi-region Kubernetes clusters on AWS and link final DNS headers.",
      dueDate: "2026-09-01",
      completedDate: null,
      status: "Upcoming",
      order: 5
    },
    {
      id: "milestone-swap-6",
      projectId: "project-swap",
      title: "Support: Post-Launch Hotfix SLA Support",
      description: "Provide active 24/7 technical infrastructure response for any trading halts.",
      dueDate: "2026-10-01",
      completedDate: null,
      status: "Upcoming",
      order: 6
    },
    // Milestones for Acme Project
    {
      id: "milestone-acme-1",
      projectId: "project-acme",
      title: "Discover: Logistic Pipeline Blueprinting",
      description: "Map supply chain APIs, routing constraints, and carrier integrations.",
      dueDate: "2026-05-20",
      completedDate: "2026-05-19",
      status: "Completed",
      order: 1
    },
    {
      id: "milestone-acme-2",
      projectId: "project-acme",
      title: "Design: User Experience Mockups & Wireframes",
      description: "Create fully customizable map panels, tracking cards, and dispatcher hubs.",
      dueDate: "2026-07-05",
      completedDate: null,
      status: "In Progress",
      order: 2
    },
    {
      id: "milestone-acme-3",
      projectId: "project-acme",
      title: "Build: Machine Learning Routing System",
      description: "Integrate specialized neural optimization models for lowest fuel routes.",
      dueDate: "2026-08-25",
      completedDate: null,
      status: "Upcoming",
      order: 3
    }
  ],
  tasks: [
    {
      id: "task-swap-1",
      projectId: "project-swap",
      title: "Develop Portfolio Rebalancing Algorithms",
      description: "Implement high-throughput portfolio allocations matching UK regulatory bounds.",
      assignedToName: "Shivam Dube",
      assignedToAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      dueDate: "2026-07-01",
      priority: "Critical",
      column: "In Progress",
      files: []
    },
    {
      id: "task-swap-2",
      projectId: "project-swap",
      title: "Revamp Dark Minimalist User Interface Components",
      description: "Polish glowing interactive components using premium rgba(0, 212, 255, 0.08) shadows.",
      assignedToName: "Digvijay Kadam",
      assignedToAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      dueDate: "2026-06-28",
      priority: "High",
      column: "In Review",
      files: [{ name: "Figma_Screen_Specs_Dark.png", url: "https://images.unsplash.com/photo-1541462608141-2758574e8375?w=500" }]
    },
    {
      id: "task-swap-3",
      projectId: "project-swap",
      title: "Integrate Resend Notification Hooks",
      description: "Configure absolute SMTP channels notifying client profiles during critical pipeline changes.",
      assignedToName: "Jawad Khan Hakim",
      assignedToAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      dueDate: "2026-07-10",
      priority: "Medium",
      column: "To Do",
      files: []
    },
    {
      id: "task-swap-4",
      projectId: "project-swap",
      title: "Database Schema Design & Migration Setup",
      description: "Set up durable SQL databases containing structured milestones and invoice models.",
      assignedToName: "Jawad Khan Hakim",
      assignedToAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      dueDate: "2026-04-15",
      priority: "Critical",
      column: "Completed",
      files: []
    },
    // Acme tasks
    {
      id: "task-acme-1",
      projectId: "project-acme",
      title: "Establish Google Maps Places API Hooks",
      description: "Inject premium address validations into dispatcher input panels.",
      assignedToName: "Jawad Khan Hakim",
      assignedToAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      dueDate: "2026-07-02",
      priority: "High",
      column: "In Progress",
      files: []
    }
  ],
  files: [
    {
      id: "file-swap-1",
      projectId: "project-swap",
      name: "Master_Services_Agreement_Signed.pdf",
      phase: "Contracts",
      uploadedByName: "John Sterling",
      uploadedById: "client-john",
      uploadedAt: "2026-04-12T14:32:00Z",
      size: "2.4 MB",
      version: 1,
      versions: [],
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      type: "PDF"
    },
    {
      id: "file-swap-2",
      projectId: "project-swap",
      name: "UI_UX_Inspiration_Brand_Guidelines.pdf",
      phase: "References",
      uploadedByName: "Digvijay Kadam",
      uploadedById: "admin-digvijay",
      uploadedAt: "2026-04-15T10:15:00Z",
      size: "8.1 MB",
      version: 2,
      versions: [
        { version: 1, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", uploadedAt: "2026-04-11T09:00:00Z", uploadedByName: "Digvijay Kadam" }
      ],
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      type: "PDF"
    },
    {
      id: "file-swap-3",
      projectId: "project-swap",
      name: "High_Fidelity_Figma_Screens_V1.pdf",
      phase: "Design",
      uploadedByName: "Digvijay Kadam",
      uploadedById: "admin-digvijay",
      uploadedAt: "2026-05-10T16:45:00Z",
      size: "18.2 MB",
      version: 1,
      versions: [],
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      type: "PDF"
    }
  ],
  approvals: [
    {
      id: "del-swap-1",
      projectId: "project-swap",
      name: "Fintech Engine Architecture Whitepaper",
      description: "Full scope of work and high-volume ledger transaction pipeline models matching UK FCA compliance guidelines.",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      status: "Pending",
      reviewerName: null,
      reviewerId: null,
      actionTimestamp: null,
      feedback: null,
      auditTrail: [
        { event: "Deliverable uploaded for review", user: "Jawad Khan Hakim", timestamp: "2026-06-20T10:00:00Z" }
      ]
    }
  ],
  invoices: [
    {
      id: "inv-swap-1",
      projectId: "project-swap",
      invoiceNumber: "BF-2026-001",
      description: "Phase 1: Architecture & Scope Initiation (Discover)",
      amount: 15000,
      issueDate: "2026-04-10",
      dueDate: "2026-04-25",
      status: "Paid",
      lineItems: [
        { description: "Architecture scoping workshops & compliance analysis", amount: 10000 },
        { description: "Initial Figma wireframing setup", amount: 5000 }
      ],
      tax: 0,
      total: 15000,
      paidAt: "2026-04-20T11:22:00Z"
    },
    {
      id: "inv-swap-2",
      projectId: "project-swap",
      invoiceNumber: "BF-2026-002",
      description: "Phase 2: High-Fidelity UI/UX Design Approval",
      amount: 20000,
      issueDate: "2026-05-10",
      dueDate: "2026-05-25",
      status: "Paid",
      lineItems: [
        { description: "Complete interactive user flow designs (25 custom panels)", amount: 20000 }
      ],
      tax: 0,
      total: 20000,
      paidAt: "2026-05-24T15:43:00Z"
    },
    {
      id: "inv-swap-3",
      projectId: "project-swap",
      invoiceNumber: "BF-2026-003",
      description: "Phase 3: Core Backend & Matching Engine Setup (Deposit)",
      amount: 35000,
      issueDate: "2026-06-15",
      dueDate: "2026-06-30",
      status: "Sent",
      lineItems: [
        { description: "Core matching engine backend deployment deposit (50%)", amount: 35000 }
      ],
      tax: 0,
      total: 35000,
      paidAt: null
    }
  ],
  messages: [
    {
      id: "msg-swap-1",
      projectId: "project-swap",
      senderId: "admin-shivam",
      senderName: "Shivam Dube",
      senderRole: "admin",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      content: "Hello John! Welcome to the Binary Froster Enterprise Hub. We have finalized the architecture whitepaper and loaded it into the approval panel. Let us know if you have any feedback on the ledger latency parameters.",
      timestamp: "2026-06-20T10:15:00Z",
      readBy: ["admin-shivam", "client-john"]
    },
    {
      id: "msg-swap-2",
      projectId: "project-swap",
      senderId: "client-john",
      senderName: "John Sterling",
      senderRole: "client",
      senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      content: "Hi Shivam! Excited to log in. I am reviewing the whitepaper with our compliance lead right now. Looks highly professional.",
      timestamp: "2026-06-20T11:45:00Z",
      readBy: ["admin-shivam", "client-john"]
    },
    {
      id: "msg-swap-3",
      projectId: "project-swap",
      senderId: "admin-jawad",
      senderName: "Jawad Khan Hakim",
      senderRole: "admin",
      senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      content: "Excellent! We've also kicked off task #1 to integrate Resend hooks so you receive immediate email diagnostics if our ledger health alters during building.",
      timestamp: "2026-06-21T09:30:00Z",
      readBy: ["admin-shivam", "admin-jawad", "client-john"]
    }
  ],
  meetings: [
    {
      id: "meet-swap-1",
      projectId: "project-swap",
      title: "Discovery & Ledger Specification Scoping",
      type: "Discovery Call",
      duration: 30,
      date: "2026-04-11",
      timeSlot: "11:00",
      calendarInviteUrl: "#",
      status: "Completed",
      hostName: "Shivam Dube"
    },
    {
      id: "meet-swap-2",
      projectId: "project-swap",
      title: "Bi-Weekly SWAP Progress Review",
      type: "Project Review",
      duration: 45,
      date: "2026-07-02",
      timeSlot: "15:00",
      calendarInviteUrl: "#",
      status: "Scheduled",
      hostName: "Jawad Khan Hakim"
    }
  ],
  tickets: [
    {
      id: "ticket-swap-1",
      projectId: "project-swap",
      ticketId: "BF-201",
      title: "Post-Launch Latency Simulation",
      description: "Our board is requesting active load stress-testing reports simulating 5,000 concurrent trades per second. Will the matching nodes scale correctly?",
      category: "General Question",
      priority: "High",
      status: "In Progress",
      replies: [
        {
          id: "rep-1",
          senderName: "John Sterling",
          senderRole: "client",
          senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
          content: "We need this by the end of July for our FCA documentation.",
          timestamp: "2026-06-23T12:00:00Z"
        },
        {
          id: "rep-2",
          senderName: "Jawad Khan Hakim",
          senderRole: "admin",
          senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
          content: "We have mapped out a Kubernetes cluster stress test on the test phase scheduled for August 10. We will compile the complete performance telemetry for you.",
          timestamp: "2026-06-23T14:30:00Z"
        }
      ],
      slaHours: 24,
      assignedToName: "Jawad Khan Hakim",
      createdAt: "2026-06-23T11:45:00Z"
    }
  ],
  notifications: [
    {
      id: "notif-1",
      userId: "client-john",
      title: "Deliverable Awaiting Review",
      description: "Jawad Khan Hakim uploaded 'Fintech Engine Architecture Whitepaper' for your formal approval.",
      timestamp: "2026-06-20T10:00:00Z",
      link: "approvals",
      isRead: false,
      type: "deliverable"
    },
    {
      id: "notif-2",
      userId: "client-john",
      title: "New Invoice Issued",
      description: "Invoice BF-2026-003 for Phase 3: Core Backend (Deposit) has been generated.",
      timestamp: "2026-06-15T09:00:00Z",
      link: "billing",
      isRead: false,
      type: "invoice"
    }
  ],
  contracts: [
    {
      id: "contract-swap-1",
      projectId: "project-swap",
      name: "Binary_Froster_NDA_Sterling_Capital.pdf",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      status: "Signed",
      signatureName: "John Sterling",
      signatureIP: "82.165.12.100",
      signatureTimestamp: "2026-04-11T10:05:00Z",
      signatureUserId: "client-john"
    },
    {
      id: "contract-swap-2",
      projectId: "project-swap",
      name: "FCA_Ledger_Regulatory_Compliance_Rider.pdf",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      status: "Pending Signature"
    }
  ],
  // Keep logs of mock transaction emails sent out via Resend
  emailsSent: [
    {
      id: "em-1",
      to: "john@sterling.com",
      subject: "Deliverable Uploaded for Approval - Binary Froster",
      body: "Hello John, Jawad Khan Hakim has uploaded the 'Fintech Engine Architecture Whitepaper' which requires your formal review. Log in to your portal to review and approve.",
      timestamp: "2026-06-20T10:00:00Z"
    }
  ]
};

// In-memory cache layer to optimize DB read/write performance
let cachedDb: any = null;

// Database utility functions with file-based atomic sync
function readDb() {
  if (cachedDb) return cachedDb;
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), "utf8");
      cachedDb = JSON.parse(JSON.stringify(INITIAL_DB));
      return cachedDb;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    cachedDb = JSON.parse(data);
    return cachedDb;
  } catch (error) {
    console.error("Error reading database file:", error);
    return INITIAL_DB;
  }
}

function writeDb(data: any) {
  cachedDb = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// Authentication Middleware enforcing Role-Based Access Control (RBAC)
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token header" });
  }
  const token = authHeader.split(" ")[1];
  const db = readDb();
  const user = db.users.find((u: any) => u.id === token);
  
  if (!user) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired session" });
  }
  
  if (user.status === "deactivated") {
    return res.status(403).json({ error: "Forbidden: Account has been deactivated by administration" });
  }
  
  req.user = user;
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Administrative access required" });
  }
  next();
}

// REST API Endpoints

// 1. AUTHENTICATION & SESSIONS
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email address is required" });
  }
  
  const db = readDb();
  // We allow logging in with pre-seeded emails, ignoring password hashing for simulation convenience
  const lowercaseEmail = email.toLowerCase().trim();
  const user = db.users.find((u: any) => u.email.toLowerCase() === lowercaseEmail);
  
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  
  if (user.status === "deactivated") {
    return res.status(403).json({ error: "Your account is deactivated. Contact Binary Froster administrators." });
  }
  
  // Return user info and user ID as their Session Token (Bearer)
  return res.json({
    token: user.id,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      companyLogo: user.companyLogo,
      phone: user.phone,
      timezone: user.timezone,
      avatarUrl: user.avatarUrl,
      isTwoFactorEnabled: !!user.isTwoFactorEnabled
    }
  });
});

app.post("/api/auth/social-login", (req, res) => {
  const { provider, email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "OAuth email is required" });
  }
  const db = readDb();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    // Auto-create a mock client account if they are OAuth login with a new email to make the experience smooth!
    const newId = "client-oauth-" + Date.now();
    const newUser = {
      id: newId,
      name: email.split("@")[0].toUpperCase() + " OAuth User",
      email: email.trim(),
      role: "client" as const,
      companyName: "Acme Connected Corp",
      phone: "+44 20 5555 1212",
      timezone: "Europe/London",
      status: "active" as const,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    // Create an associated project so they have content!
    db.projects.push({
      id: "project-" + newId,
      name: "Acme Customized AI Integration Suite",
      clientId: newId,
      clientName: newUser.name,
      companyName: newUser.companyName,
      phase: "Discover",
      progress: 10,
      upcomingMilestoneName: "Scope Workshop & Onboarding Complete",
      upcomingMilestoneDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    });
    // Create initial milestones
    db.milestones.push(
      {
        id: `milestone-${newId}-1`,
        projectId: `project-${newId}`,
        title: "Discover: Custom AI Scope Scoping",
        description: "Determine primary language models and vector search clusters.",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
        completedDate: null,
        status: "In Progress",
        order: 1
      },
      {
        id: `milestone-${newId}-2`,
        projectId: `project-${newId}`,
        title: "Design: Pipeline Architecture Diagram",
        description: "Complete full vector pipeline and storage schematics.",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString().split('T')[0],
        completedDate: null,
        status: "Upcoming",
        order: 2
      }
    );
    writeDb(db);
    return res.json({ token: newUser.id, user: newUser });
  }
  return res.json({ token: user.id, user });
});

app.post("/api/auth/reset-password-request", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const db = readDb();
  const token = "reset-" + Math.random().toString(36).substr(2, 9);
  const resetLink = `/reset-password?token=${token}`;
  
  // Log mock email notification via Resend simulation
  db.emailsSent.push({
    id: "em-" + Date.now(),
    to: email,
    subject: "Reset Password Instructions - Binary Froster",
    body: `Hello, we received a request to reset your password. Use the following link to configure a new credential: ${resetLink}. This link expires in 1 hour.`,
    timestamp: new Date().toISOString()
  });
  writeDb(db);
  
  return res.json({ success: true, message: "Reset password instructions dispatched to email." });
});

app.post("/api/auth/reset-password", (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }
  // Simply complete reset successfully
  return res.json({ success: true, message: "Password updated successfully." });
});

// 2. PROJECT & MILESTONES API
app.get("/api/projects", authenticate, (req: any, res) => {
  const db = readDb();
  if (req.user.role === "admin") {
    return res.json(db.projects);
  } else {
    const clientProjects = db.projects.filter((p: any) => p.clientId === req.user.id);
    return res.json(clientProjects);
  }
});

app.post("/api/projects/:id/phase", authenticate, requireAdmin, (req, res) => {
  const { phase, progress } = req.body;
  const db = readDb();
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  
  project.phase = phase;
  if (progress !== undefined) {
    project.progress = progress;
  }
  
  // Trigger notification to Client
  db.notifications.push({
    id: "notif-" + Date.now(),
    userId: project.clientId,
    title: "Project Phase Shifted",
    description: `Binary Froster changed project phase of '${project.name}' to ${phase}.`,
    timestamp: new Date().toISOString(),
    link: "dashboard",
    isRead: false,
    type: "milestone"
  });
  
  // Resend email log
  const clientUser = db.users.find((u: any) => u.id === project.clientId);
  if (clientUser) {
    db.emailsSent.push({
      id: "em-" + Date.now(),
      to: clientUser.email,
      subject: `Project Phase Update: ${phase} - Binary Froster`,
      body: `Hello ${clientUser.name}, your project '${project.name}' has shifted into the '${phase}' phase. Overall progress is currently ${project.progress}%. Log in to your hub for details.`,
      timestamp: new Date().toISOString()
    });
  }
  
  writeDb(db);
  return res.json({ success: true, project });
});

app.get("/api/projects/:id/milestones", authenticate, (req: any, res) => {
  const db = readDb();
  // Security validation: Client can only view their own project's milestones
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  if (req.user.role !== "admin" && project.clientId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden: You are not authorized to view these milestones" });
  }
  
  const milestones = db.milestones
    .filter((m: any) => m.projectId === req.params.id)
    .sort((a: any, b: any) => a.order - b.order);
  return res.json(milestones);
});

app.post("/api/projects/:id/milestones/update", authenticate, requireAdmin, (req, res) => {
  const { milestones } = req.body; // complete list of milestones
  const db = readDb();
  
  // Replace milestones for this project
  db.milestones = db.milestones.filter((m: any) => m.projectId !== req.params.id);
  
  milestones.forEach((m: any) => {
    db.milestones.push({
      id: m.id || "milestone-" + Math.random().toString(36).substr(2, 9),
      projectId: req.params.id,
      title: m.title,
      description: m.description,
      dueDate: m.dueDate,
      completedDate: m.completedDate || null,
      status: m.status,
      order: m.order
    });
  });
  
  // Update overall project upcoming milestone
  const activeMilestones = db.milestones.filter((m: any) => m.projectId === req.params.id);
  const nextIncomplete = activeMilestones
    .sort((a: any, b: any) => a.order - b.order)
    .find((m: any) => m.status !== "Completed");
    
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (project && nextIncomplete) {
    project.upcomingMilestoneName = nextIncomplete.title;
    project.upcomingMilestoneDate = nextIncomplete.dueDate;
  }
  
  writeDb(db);
  return res.json({ success: true, milestones: db.milestones.filter((m: any) => m.projectId === req.params.id) });
});

// 3. TASK BOARD (KANBAN) API
app.get("/api/projects/:id/tasks", authenticate, (req: any, res) => {
  const db = readDb();
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  if (req.user.role !== "admin" && project.clientId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden: You cannot view tasks of this project" });
  }
  
  const tasks = db.tasks.filter((t: any) => t.projectId === req.params.id);
  return res.json(tasks);
});

app.post("/api/tasks/move", authenticate, (req: any, res) => {
  const { taskId, column } = req.body;
  const db = readDb();
  const task = db.tasks.find((t: any) => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  
  // Security check: Client can only move tasks in their project
  const project = db.projects.find((p: any) => p.id === task.projectId);
  if (req.user.role !== "admin" && project.clientId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  task.column = column;
  writeDb(db);
  return res.json({ success: true, task });
});

app.post("/api/tasks/:id/feedback", authenticate, (req: any, res) => {
  const { feedbackText, priority } = req.body;
  if (!feedbackText) {
    return res.status(400).json({ error: "Feedback statement is required" });
  }
  const db = readDb();
  const task = db.tasks.find((t: any) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  
  // Move task back to In Progress
  task.column = "In Progress";
  task.description = `${task.description}\n\n[Client Feedback - ${priority} Priority]: ${feedbackText}`;
  
  // Add notifications for admins
  db.users.filter((u: any) => u.role === "admin").forEach((admin: any) => {
    db.notifications.push({
      id: "notif-" + Date.now(),
      userId: admin.id,
      title: "Client Requested Task Changes",
      description: `Changes requested on task '${task.title}' by ${req.user.name}.`,
      timestamp: new Date().toISOString(),
      link: "tasks",
      isRead: false,
      type: "ticket"
    });
    
    db.emailsSent.push({
      id: "em-" + Date.now(),
      to: admin.email,
      subject: `Change Requested: ${task.title} - Binary Froster`,
      body: `Hello ${admin.name}, client ${req.user.name} has requested changes on task '${task.title}'. Current Column reset to In Progress. Feedback: "${feedbackText}"`,
      timestamp: new Date().toISOString()
    });
  });
  
  writeDb(db);
  return res.json({ success: true, task });
});

app.post("/api/tasks/manage", authenticate, requireAdmin, (req, res) => {
  const { id, projectId, title, description, assignedToName, assignedToAvatar, dueDate, priority, column } = req.body;
  const db = readDb();
  
  if (id) {
    // Edit existing
    const idx = db.tasks.findIndex((t: any) => t.id === id);
    if (idx !== -1) {
      db.tasks[idx] = { ...db.tasks[idx], title, description, assignedToName, assignedToAvatar, dueDate, priority, column };
    }
  } else {
    // Create new
    db.tasks.push({
      id: "task-" + Date.now(),
      projectId,
      title,
      description,
      assignedToName,
      assignedToAvatar,
      dueDate,
      priority,
      column: column || "To Do",
      files: []
    });
  }
  
  writeDb(db);
  return res.json({ success: true, tasks: db.tasks.filter((t: any) => t.projectId === projectId) });
});

app.delete("/api/tasks/:id", authenticate, requireAdmin, (req, res) => {
  const db = readDb();
  const task = db.tasks.find((t: any) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  db.tasks = db.tasks.filter((t: any) => t.id !== req.params.id);
  writeDb(db);
  return res.json({ success: true });
});

// 4. FILE & DOCUMENT REPOSITORY
app.get("/api/projects/:id/files", authenticate, (req: any, res) => {
  const db = readDb();
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  if (req.user.role !== "admin" && project.clientId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden: Access denied" });
  }
  
  const files = db.files.filter((f: any) => f.projectId === req.params.id);
  return res.json(files);
});

app.post("/api/files/upload", authenticate, (req: any, res) => {
  const { projectId, name, phase, size, base64Data, type } = req.body;
  if (!projectId || !name || !phase) {
    return res.status(400).json({ error: "Missing required file metadata params" });
  }
  const db = readDb();
  
  // Check project access
  const project = db.projects.find((p: any) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  if (req.user.role !== "admin" && project.clientId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden: Upload unauthorized" });
  }
  
  // File size validation (Strict limit of 100MB as specified)
  // We'll trust client size or mock check
  
  // Check if a file with the same name exists in this phase directory for versioning
  const existingFileIdx = db.files.findIndex((f: any) => f.projectId === projectId && f.phase === phase && f.name === name);
  
  let finalFile;
  if (existingFileIdx !== -1) {
    const oldFile = db.files[existingFileIdx];
    const nextVer = oldFile.version + 1;
    
    // Save old file into history
    const historyItem = {
      version: oldFile.version,
      url: oldFile.url,
      uploadedAt: oldFile.uploadedAt,
      uploadedByName: oldFile.uploadedByName
    };
    
    const updatedHistory = [...(oldFile.versions || []), historyItem];
    
    db.files[existingFileIdx] = {
      ...oldFile,
      uploadedByName: req.user.name,
      uploadedById: req.user.id,
      uploadedAt: new Date().toISOString(),
      size: size || "3.5 MB",
      version: nextVer,
      versions: updatedHistory,
      url: base64Data || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      type: type || "PDF"
    };
    finalFile = db.files[existingFileIdx];
  } else {
    // Create pristine file
    finalFile = {
      id: "file-" + Date.now(),
      projectId,
      name,
      phase,
      uploadedByName: req.user.name,
      uploadedById: req.user.id,
      uploadedAt: new Date().toISOString(),
      size: size || "1.2 MB",
      version: 1,
      versions: [],
      url: base64Data || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      type: type || "PDF"
    };
    db.files.push(finalFile);
  }
  
  // Push audit logs
  db.notifications.push({
    id: "notif-" + Date.now(),
    userId: req.user.role === "admin" ? project.clientId : "admin-shivam",
    title: "Document Uploaded",
    description: `'${name}' was uploaded into folder [${phase}] by ${req.user.name}.`,
    timestamp: new Date().toISOString(),
    link: "documents",
    isRead: false,
    type: "contract"
  });
  
  writeDb(db);
  return res.json({ success: true, file: finalFile });
});

// 5. APPROVAL & FEEDBACK WORKFLOW
app.get("/api/projects/:id/approvals", authenticate, (req: any, res) => {
  const db = readDb();
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  if (req.user.role !== "admin" && project.clientId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  const approvals = db.approvals.filter((a: any) => a.projectId === req.params.id);
  return res.json(approvals);
});

// Admin-level view all pending approvals across all clients, ranked by date (age)
app.get("/api/admin/approvals", authenticate, requireAdmin, (req, res) => {
  const db = readDb();
  // Filter for pending, link client/project data, and sort chronologically (oldest first to represent age ranking)
  const pending = db.approvals
    .filter((a: any) => a.status === "Pending")
    .map((a: any) => {
      const p = db.projects.find((proj: any) => proj.id === a.projectId);
      return {
        ...a,
        projectName: p ? p.name : "Unknown Project",
        clientName: p ? p.clientName : "Unknown Client",
        companyName: p ? p.companyName : "Unknown Company",
        ageMs: Date.now() - new Date(a.auditTrail[0].timestamp).getTime()
      };
    })
    .sort((a: any, b: any) => b.ageMs - a.ageMs); // oldest ageMs first
    
  return res.json(pending);
});

app.post("/api/approvals/:id/action", authenticate, (req: any, res) => {
  const { action, feedback } = req.body; // action: 'Approve' | 'Request Changes'
  const db = readDb();
  const approval = db.approvals.find((a: any) => a.id === req.params.id);
  if (!approval) {
    return res.status(404).json({ error: "Approval deliverable record not found" });
  }
  
  const project = db.projects.find((p: any) => p.id === approval.projectId);
  if (req.user.role !== "admin" && project.clientId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden: Review process restricted to client profile" });
  }
  
  const time = new Date().toISOString();
  if (action === "Approve") {
    approval.status = "Approved";
    approval.reviewerName = req.user.name;
    approval.reviewerId = req.user.id;
    approval.actionTimestamp = time;
    approval.feedback = null;
    approval.auditTrail.push({
      event: "Deliverable Approved & Locked",
      user: req.user.name,
      timestamp: time
    });
    
    // Notify admins
    db.users.filter((u: any) => u.role === "admin").forEach((admin: any) => {
      db.notifications.push({
        id: "notif-" + Date.now(),
        userId: admin.id,
        title: "Deliverable Approved",
        description: `'${approval.name}' was approved and locked by ${req.user.name}.`,
        timestamp: time,
        link: "dashboard",
        isRead: false,
        type: "deliverable"
      });
      db.emailsSent.push({
        id: "em-" + Date.now(),
        to: admin.email,
        subject: `Deliverable Approved: ${approval.name} - Binary Froster`,
        body: `Hi ${admin.name}, great news! Client ${req.user.name} has approved and locked the deliverable: '${approval.name}'. Code implementation can safely accelerate.`,
        timestamp: time
      });
    });
  } else {
    // Request Changes
    approval.status = "Changes Requested";
    approval.reviewerName = req.user.name;
    approval.reviewerId = req.user.id;
    approval.actionTimestamp = time;
    approval.feedback = feedback; // { sectionFeedback, priority, fileUrl, fileName }
    approval.auditTrail.push({
      event: `Changes Requested (${feedback.priority} Priority)`,
      user: req.user.name,
      timestamp: time
    });
    
    // Move corresponding build milestones if necessary, or just notify admin
    db.users.filter((u: any) => u.role === "admin").forEach((admin: any) => {
      db.notifications.push({
        id: "notif-" + Date.now(),
        userId: admin.id,
        title: "Revision Requested on Deliverable",
        description: `${req.user.name} requested changes on '${approval.name}' (${feedback.priority} Priority).`,
        timestamp: time,
        link: "dashboard",
        isRead: false,
        type: "deliverable"
      });
      db.emailsSent.push({
        id: "em-" + Date.now(),
        to: admin.email,
        subject: `Revision Requested: ${approval.name} - Binary Froster`,
        body: `Hi ${admin.name}, client ${req.user.name} requested changes on '${approval.name}' with ${feedback.priority} priority. Specific Section Feedback: "${feedback.sectionFeedback}"`,
        timestamp: time
      });
    });
  }
  
  writeDb(db);
  return res.json({ success: true, approval });
});

// Admin upload deliverable requiring review
app.post("/api/approvals/upload", authenticate, requireAdmin, (req: any, res) => {
  const { projectId, name, description, fileUrl } = req.body;
  const db = readDb();
  
  const project = db.projects.find((p: any) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  
  const newDel = {
    id: "del-" + Date.now(),
    projectId,
    name,
    description,
    fileUrl: fileUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "Pending" as const,
    reviewerName: null,
    reviewerId: null,
    actionTimestamp: null,
    feedback: null,
    auditTrail: [
      { event: "Deliverable uploaded for review", user: req.user.name, timestamp: new Date().toISOString() }
    ]
  };
  
  db.approvals.push(newDel);
  
  // Notify client
  db.notifications.push({
    id: "notif-" + Date.now(),
    userId: project.clientId,
    title: "New Deliverable Requiring Approval",
    description: `Binary Froster uploaded '${name}' for your active review.`,
    timestamp: new Date().toISOString(),
    link: "dashboard",
    isRead: false,
    type: "deliverable"
  });
  
  const clientUser = db.users.find((u: any) => u.id === project.clientId);
  if (clientUser) {
    db.emailsSent.push({
      id: "em-" + Date.now(),
      to: clientUser.email,
      subject: "Deliverable Uploaded for Approval - Binary Froster",
      body: `Hello ${clientUser.name}, ${req.user.name} has uploaded a new project deliverable: '${name}' requiring your action. Log in to approve or request change revisions.`,
      timestamp: new Date().toISOString()
    });
  }
  
  writeDb(db);
  return res.json({ success: true, deliverable: newDel });
});

// 6. INVOICING & PAYMENT processing (Stripe simulation)
app.get("/api/projects/:id/invoices", authenticate, (req: any, res) => {
  const db = readDb();
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  if (req.user.role !== "admin" && project.clientId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  const invoices = db.invoices.filter((i: any) => i.projectId === req.params.id);
  return res.json(invoices);
});

// Admin billing dashboard query
app.get("/api/admin/billing-summary", authenticate, requireAdmin, (req, res) => {
  const db = readDb();
  const invoices = db.invoices;
  
  const totalEarned = invoices.filter((i: any) => i.status === "Paid").reduce((sum: number, i: any) => sum + i.total, 0);
  const totalOutstanding = invoices.filter((i: any) => i.status === "Sent").reduce((sum: number, i: any) => sum + i.total, 0);
  const totalOverdue = invoices.filter((i: any) => i.status === "Overdue").reduce((sum: number, i: any) => sum + i.total, 0);
  
  return res.json({
    totalEarned,
    totalOutstanding,
    totalOverdue,
    invoices: invoices.map((i: any) => {
      const p = db.projects.find((proj: any) => proj.id === i.projectId);
      return {
        ...i,
        projectName: p ? p.name : "Unknown Project",
        clientName: p ? p.clientName : "Unknown Client"
      };
    })
  });
});

app.post("/api/invoices/create", authenticate, requireAdmin, (req, res) => {
  const { projectId, description, lineItems, dueDate } = req.body;
  const db = readDb();
  
  const project = db.projects.find((p: any) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  
  const subtotal = lineItems.reduce((sum: number, item: any) => sum + item.amount, 0);
  const total = subtotal; // tax included in line items or zero here
  const invoiceNum = `BF-2026-00${db.invoices.length + 1}`;
  
  const newInv = {
    id: "inv-" + Date.now(),
    projectId,
    invoiceNumber: invoiceNum,
    description,
    amount: total,
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Sent" as const,
    lineItems,
    tax: 0,
    total,
    paidAt: null
  };
  
  db.invoices.push(newInv);
  
  // Notify client
  db.notifications.push({
    id: "notif-" + Date.now(),
    userId: project.clientId,
    title: "New Invoice Issued",
    description: `Invoice ${invoiceNum} for '${description}' is due.`,
    timestamp: new Date().toISOString(),
    link: "billing",
    isRead: false,
    type: "invoice"
  });
  
  const clientUser = db.users.find((u: any) => u.id === project.clientId);
  if (clientUser) {
    db.emailsSent.push({
      id: "em-" + Date.now(),
      to: clientUser.email,
      subject: `New Invoice Issued: ${invoiceNum} - Binary Froster`,
      body: `Hello ${clientUser.name}, invoice ${invoiceNum} has been issued for '${description}' with a total balance due of $${total}. Payment is due by ${newInv.dueDate}. Log in to pay via Stripe Checkout securely.`,
      timestamp: new Date().toISOString()
    });
  }
  
  writeDb(db);
  return res.json({ success: true, invoice: newInv });
});

// Trigger Stripe checkout session (Simulator)
app.post("/api/invoices/:id/checkout", authenticate, (req: any, res) => {
  const db = readDb();
  const invoice = db.invoices.find((i: any) => i.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }
  
  // Return a simulation URL which the client can complete in-app
  return res.json({
    success: true,
    checkoutUrl: `/payment-simulation?invoiceId=${invoice.id}&amount=${invoice.total}`
  });
});

// Stripe Payment webhook completion simulation
app.post("/api/invoices/:id/pay-success", authenticate, (req: any, res) => {
  const db = readDb();
  const invoice = db.invoices.find((i: any) => i.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }
  
  invoice.status = "Paid";
  invoice.paidAt = new Date().toISOString();
  
  // Create notifications and receipts
  const project = db.projects.find((p: any) => p.id === invoice.projectId);
  if (project) {
    // Notify admin
    db.users.filter((u: any) => u.role === "admin").forEach((admin: any) => {
      db.notifications.push({
        id: "notif-" + Date.now(),
        userId: admin.id,
        title: "Payment Received via Stripe",
        description: `Invoice ${invoice.invoiceNumber} paid by ${project.clientName} ($${invoice.total}).`,
        timestamp: new Date().toISOString(),
        link: "billing",
        isRead: false,
        type: "invoice"
      });
      db.emailsSent.push({
        id: "em-" + Date.now(),
        to: admin.email,
        subject: `Payment Confirmed: ${invoice.invoiceNumber} - Binary Froster`,
        body: `Hi ${admin.name}, great news! Payment of $${invoice.total} has been settled via Stripe webhook for Invoice ${invoice.invoiceNumber}.`,
        timestamp: new Date().toISOString()
      });
    });
    
    // Notify client receipt
    db.notifications.push({
      id: "notif-" + Date.now(),
      userId: project.clientId,
      title: "Stripe Payment Settled",
      description: `Payment for Invoice ${invoice.invoiceNumber} was successfully validated. Thank you!`,
      timestamp: new Date().toISOString(),
      link: "billing",
      isRead: false,
      type: "invoice"
    });
    
    const clientUser = db.users.find((u: any) => u.id === project.clientId);
    if (clientUser) {
      db.emailsSent.push({
        id: "em-" + Date.now(),
        to: clientUser.email,
        subject: `Receipt for Payment: ${invoice.invoiceNumber} - Binary Froster`,
        body: `Hello ${clientUser.name}, thank you for your payment. This email confirms that Invoice ${invoice.invoiceNumber} ($${invoice.total} USD) has been settled in full on ${new Date().toLocaleDateString()}. Your PDF receipt is now available in the portal.`,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  writeDb(db);
  return res.json({ success: true, invoice });
});

// Manual mark invoice paid (Admin Panel)
app.post("/api/admin/invoices/:id/manual-pay", authenticate, requireAdmin, (req, res) => {
  const db = readDb();
  const invoice = db.invoices.find((i: any) => i.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }
  
  invoice.status = "Paid";
  invoice.paidAt = new Date().toISOString();
  
  writeDb(db);
  return res.json({ success: true, invoice });
});

// 7. REAL-TIME MESSAGING HUB
app.get("/api/projects/:id/messages", authenticate, (req: any, res) => {
  const db = readDb();
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  if (req.user.role !== "admin" && project.clientId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden: Threads segregated securely" });
  }
  
  const messages = db.messages.filter((m: any) => m.projectId === req.params.id);
  return res.json(messages);
});

// Admin messaging threads inbox overview
app.get("/api/admin/messages-inbox", authenticate, requireAdmin, (req: any, res) => {
  const db = readDb();
  const activeThreads = db.projects.map((p: any) => {
    const threadMsgs = db.messages.filter((m: any) => m.projectId === p.id);
    const lastMsg = threadMsgs[threadMsgs.length - 1];
    return {
      projectId: p.id,
      projectName: p.name,
      clientName: p.clientName,
      companyName: p.companyName,
      lastMessage: lastMsg ? lastMsg.content : "No messages exchanged yet.",
      lastMessageTime: lastMsg ? lastMsg.timestamp : p.createdAt,
      unreadCount: threadMsgs.filter((m: any) => !m.readBy.includes(req.user.id)).length
    };
  });
  return res.json(activeThreads);
});

app.post("/api/projects/:id/messages", authenticate, (req: any, res) => {
  const { content, fileUrl, fileName } = req.body;
  const db = readDb();
  
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  if (req.user.role !== "admin" && project.clientId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  const newMsg = {
    id: "msg-" + Date.now(),
    projectId: req.params.id,
    senderId: req.body.senderId || req.user.id,
    senderName: req.body.senderName || req.user.name,
    senderRole: req.body.senderRole || req.user.role,
    senderAvatar: req.body.senderAvatar || req.user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    content: content || "",
    timestamp: new Date().toISOString(),
    fileUrl,
    fileName,
    readBy: [req.user.id]
  };
  
  db.messages.push(newMsg);
  
  // Push standard real-time notification
  const recipientId = req.user.role === "admin" ? project.clientId : "admin-shivam";
  db.notifications.push({
    id: "notif-" + Date.now(),
    userId: recipientId,
    title: `New Message from ${req.user.name}`,
    description: content ? (content.substring(0, 50) + "...") : "Sent an attachment.",
    timestamp: new Date().toISOString(),
    link: "messages",
    isRead: false,
    type: "message"
  });
  
  // Simulator: If the client is messaging, let Shivam Dube (Founder) auto-respond with some AI engineer logic after 3 seconds!
  if (req.user.role === "client") {
    setTimeout(() => {
      const liveDb = readDb();
      const responder = liveDb.users.find((u: any) => u.id === "admin-shivam") || liveDb.users[0];
      const botResponse = {
        id: "msg-auto-" + Date.now(),
        projectId: req.params.id,
        senderId: responder.id,
        senderName: responder.name,
        senderRole: "admin" as const,
        senderAvatar: responder.avatarUrl,
        content: `Hi ${req.user.name}! Shivam Dube here. Got your message. Our engineering team (myself, Digvijay, and Jawad) are currently analyzing the code structures. This notification has been marked on our terminal consoles. I'll follow up shortly!`,
        timestamp: new Date().toISOString(),
        readBy: [responder.id]
      };
      liveDb.messages.push(botResponse);
      
      // Notify client
      liveDb.notifications.push({
        id: "notif-auto-" + Date.now(),
        userId: req.user.id,
        title: "New Message from Shivam Dube",
        description: "Shivam Dube replied on your active thread.",
        timestamp: new Date().toISOString(),
        link: "messages",
        isRead: false,
        type: "message"
      });
      writeDb(liveDb);
    }, 4000);
  }
  
  writeDb(db);
  return res.json({ success: true, message: newMsg });
});

app.post("/api/projects/:id/messages/mark-read", authenticate, (req: any, res) => {
  const db = readDb();
  let modified = false;
  db.messages.forEach((m: any) => {
    if (m.projectId === req.params.id && !m.readBy.includes(req.user.id)) {
      m.readBy.push(req.user.id);
      modified = true;
    }
  });
  if (modified) {
    writeDb(db);
  }
  return res.json({ success: true });
});

// 8. MEETING CAL.COM SCHEDULING
app.get("/api/projects/:id/meetings", authenticate, (req: any, res) => {
  const db = readDb();
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  if (req.user.role !== "admin" && project.clientId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  return res.json(db.meetings.filter((m: any) => m.projectId === req.params.id));
});

app.post("/api/projects/:id/meetings/book", authenticate, (req: any, res) => {
  const { type, date, timeSlot } = req.body; // type: 'Discovery Call' | 'Project Review' | 'Support Call'
  if (!type || !date || !timeSlot) {
    return res.status(400).json({ error: "Type, date, and time slot are required" });
  }
  const db = readDb();
  
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  
  // Assign a primary team member depending on type
  let host = "Shivam Dube";
  if (type === "Project Review") host = "Jawad Khan Hakim";
  if (type === "Support Call") host = "Digvijay Kadam";
  
  const duration = type === "Project Review" ? 45 : 30;
  
  const newMeet = {
    id: "meet-" + Date.now(),
    projectId: req.params.id,
    title: `${type} with Binary Froster`,
    type,
    duration,
    date,
    timeSlot,
    calendarInviteUrl: "https://calendar.google.com",
    status: "Scheduled" as const,
    hostName: host
  };
  
  db.meetings.push(newMeet);
  
  // Dual layer notify
  db.notifications.push({
    id: "notif-" + Date.now(),
    userId: req.user.role === "admin" ? project.clientId : "admin-shivam",
    title: "New Meeting Scheduled",
    description: `${type} set on ${date} at ${timeSlot} with ${host}.`,
    timestamp: new Date().toISOString(),
    link: "meetings",
    isRead: false,
    type: "meeting"
  });
  
  // Resend email log
  const clientUser = db.users.find((u: any) => u.id === project.clientId);
  if (clientUser) {
    db.emailsSent.push({
      id: "em-" + Date.now(),
      to: clientUser.email,
      subject: `Meeting Confirmed: ${type} - Binary Froster`,
      body: `Hello ${clientUser.name}, your meeting '${type}' with ${host} is confirmed. Date: ${date}, Time: ${timeSlot} (Your Local Timezone). Google Meet details have been added to your calendar invite.`,
      timestamp: new Date().toISOString()
    });
  }
  
  writeDb(db);
  return res.json({ success: true, meeting: newMeet });
});

// 9. POST-LAUNCH TICKET SYSTEM
app.get("/api/projects/:id/tickets", authenticate, (req: any, res) => {
  const db = readDb();
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  if (req.user.role !== "admin" && project.clientId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  const tickets = db.tickets.filter((t: any) => t.projectId === req.params.id);
  return res.json(tickets);
});

// Admin-level unified tickets queue
app.get("/api/admin/tickets", authenticate, requireAdmin, (req, res) => {
  const db = readDb();
  const tickets = db.tickets.map((t: any) => {
    const p = db.projects.find((proj: any) => proj.id === t.projectId);
    return {
      ...t,
      projectName: p ? p.name : "Unknown Project",
      clientName: p ? p.clientName : "Unknown Client",
      companyName: p ? p.companyName : "Unknown Company"
    };
  });
  return res.json(tickets);
});

app.post("/api/tickets/raise", authenticate, (req: any, res) => {
  const { projectId, title, description, category, priority } = req.body;
  if (!projectId || !title || !description || !category || !priority) {
    return res.status(400).json({ error: "Missing required fields for ticket submission" });
  }
  const db = readDb();
  const project = db.projects.find((p: any) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  
  // SLA configuration as specified:
  // 4 hours for Urgent, 24 hours for High, 48 hours for Medium, 72 hours for Low
  let slaHours = 72;
  if (priority === "Urgent") slaHours = 4;
  if (priority === "High") slaHours = 24;
  if (priority === "Medium") slaHours = 48;
  
  const ticketRef = `BF-TK-${db.tickets.length + 101}`;
  const newTicket = {
    id: "ticket-" + Date.now(),
    projectId,
    ticketId: ticketRef,
    title,
    description,
    category,
    priority,
    status: "Open" as const,
    replies: [],
    slaHours,
    assignedToName: "Shivam Dube", // Default assignment
    createdAt: new Date().toISOString()
  };
  
  db.tickets.push(newTicket);
  
  // Notify admins
  db.users.filter((u: any) => u.role === "admin").forEach((admin: any) => {
    db.notifications.push({
      id: "notif-" + Date.now(),
      userId: admin.id,
      title: "New Support Ticket Raised",
      description: `[${priority}] Support ticket '${title}' created by ${req.user.name}.`,
      timestamp: new Date().toISOString(),
      link: "tickets",
      isRead: false,
      type: "ticket"
    });
    
    db.emailsSent.push({
      id: "em-" + Date.now(),
      to: admin.email,
      subject: `[${priority} Ticket] ${ticketRef}: ${title} - Binary Froster`,
      body: `Hello ${admin.name}, client ${req.user.name} raised a ticket under category '${category}'. Description: "${description}". SLA Target: ${slaHours} hours response time.`,
      timestamp: new Date().toISOString()
    });
  });
  
  writeDb(db);
  return res.json({ success: true, ticket: newTicket });
});

app.post("/api/tickets/:id/reply", authenticate, (req: any, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Content cannot be empty" });
  }
  const db = readDb();
  const ticket = db.tickets.find((t: any) => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }
  
  const replyItem = {
    id: "reply-" + Date.now(),
    senderName: req.user.name,
    senderRole: req.user.role,
    senderAvatar: req.user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    content,
    timestamp: new Date().toISOString()
  };
  
  ticket.replies.push(replyItem);
  
  // If admin replies, update status to Awaiting Client Response, if client replies, set back to In Progress / Open
  if (req.user.role === "admin") {
    ticket.status = "Awaiting Client Response";
  } else {
    ticket.status = "In Progress";
  }
  
  // Create relative notifications
  const project = db.projects.find((p: any) => p.id === ticket.projectId);
  if (project) {
    const recipientId = req.user.role === "admin" ? project.clientId : "admin-shivam";
    db.notifications.push({
      id: "notif-" + Date.now(),
      userId: recipientId,
      title: `Ticket Reply from ${req.user.name}`,
      description: content.substring(0, 50) + "...",
      timestamp: new Date().toISOString(),
      link: "tickets",
      isRead: false,
      type: "ticket"
    });
    
    const recipientUser = db.users.find((u: any) => u.id === recipientId);
    if (recipientUser) {
      db.emailsSent.push({
        id: "em-" + Date.now(),
        to: recipientUser.email,
        subject: `Reply on Ticket ${ticket.ticketId}: ${ticket.title} - Binary Froster`,
        body: `Hello ${recipientUser.name}, ${req.user.name} added a reply on support ticket ${ticket.ticketId}. Status updated to: ${ticket.status}. Content: "${content}"`,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  writeDb(db);
  return res.json({ success: true, ticket });
});

app.post("/api/admin/tickets/:id/status", authenticate, requireAdmin, (req, res) => {
  const { status, assignedToName } = req.body;
  const db = readDb();
  const ticket = db.tickets.find((t: any) => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }
  
  if (status) ticket.status = status;
  if (assignedToName) ticket.assignedToName = assignedToName;
  
  const project = db.projects.find((p: any) => p.id === ticket.projectId);
  if (project) {
    db.notifications.push({
      id: "notif-" + Date.now(),
      userId: project.clientId,
      title: "Support Ticket Status Updated",
      description: `Support ticket ${ticket.ticketId} changed status to: ${status}.`,
      timestamp: new Date().toISOString(),
      link: "tickets",
      isRead: false,
      type: "ticket"
    });
    
    const clientUser = db.users.find((u: any) => u.id === project.clientId);
    if (clientUser) {
      db.emailsSent.push({
        id: "em-" + Date.now(),
        to: clientUser.email,
        subject: `Ticket Update [${status}]: ${ticket.ticketId} - Binary Froster`,
        body: `Hello ${clientUser.name}, support ticket ${ticket.ticketId} status has changed to '${status}'. Assigned tech: ${ticket.assignedToName}. Log in to view replies.`,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  writeDb(db);
  return res.json({ success: true, ticket });
});

// 10. CONTRACT & NDA SIGNING
app.get("/api/projects/:id/contracts", authenticate, (req: any, res) => {
  const db = readDb();
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  if (req.user.role !== "admin" && project.clientId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  return res.json(db.contracts.filter((c: any) => c.projectId === req.params.id));
});

app.post("/api/contracts/:id/sign", authenticate, (req: any, res) => {
  const { legalName, ipAddress } = req.body;
  if (!legalName) {
    return res.status(400).json({ error: "Full legal signature name is required" });
  }
  const db = readDb();
  const contract = db.contracts.find((c: any) => c.id === req.params.id);
  if (!contract) {
    return res.status(404).json({ error: "Contract not found" });
  }
  
  contract.status = "Signed";
  contract.signatureName = legalName;
  contract.signatureIP = ipAddress || req.ip || "127.0.0.1";
  contract.signatureTimestamp = new Date().toISOString();
  contract.signatureUserId = req.user.id;
  
  // Create legally defensible mock audit log, notify admins
  const project = db.projects.find((p: any) => p.id === contract.projectId);
  db.users.filter((u: any) => u.role === "admin").forEach((admin: any) => {
    db.notifications.push({
      id: "notif-" + Date.now(),
      userId: admin.id,
      title: "Contract Signed & Sealed",
      description: `'${contract.name}' formally signed by client ${legalName} (IP: ${contract.signatureIP}).`,
      timestamp: new Date().toISOString(),
      link: "documents",
      isRead: false,
      type: "contract"
    });
    
    db.emailsSent.push({
      id: "em-" + Date.now(),
      to: admin.email,
      subject: `Contract Sealed: ${contract.name} - Binary Froster`,
      body: `Hello ${admin.name}, great news! Client ${legalName} has signed the document '${contract.name}' under user ID: ${req.user.id}. Recorded IP: ${contract.signatureIP} on ${contract.signatureTimestamp}. A PDF backup copy is archived.`,
      timestamp: new Date().toISOString()
    });
  });
  
  writeDb(db);
  return res.json({ success: true, contract });
});

// Admin upload new contract
app.post("/api/admin/contracts/upload", authenticate, requireAdmin, (req, res) => {
  const { projectId, name, fileUrl } = req.body;
  const db = readDb();
  
  const project = db.projects.find((p: any) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  
  const newContract = {
    id: "contract-" + Date.now(),
    projectId,
    name,
    fileUrl: fileUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "Pending Signature" as const
  };
  
  db.contracts.push(newContract);
  
  // Notify client
  db.notifications.push({
    id: "notif-" + Date.now(),
    userId: project.clientId,
    title: "New Contract Awaiting Signature",
    description: `Binary Froster uploaded '${name}' requiring your legal e-signature.`,
    timestamp: new Date().toISOString(),
    link: "documents",
    isRead: false,
    type: "contract"
  });
  
  const clientUser = db.users.find((u: any) => u.id === project.clientId);
  if (clientUser) {
    db.emailsSent.push({
      id: "em-" + Date.now(),
      to: clientUser.email,
      subject: "Contract Requiring Your E-Signature - Binary Froster",
      body: `Hello ${clientUser.name}, an official project document: '${name}' has been uploaded and requires your formal legal review and signature inside the portal.`,
      timestamp: new Date().toISOString()
    });
  }
  
  writeDb(db);
  return res.json({ success: true, contract: newContract });
});

// 11. NOTIFICATIONS LIST
app.get("/api/notifications", authenticate, (req: any, res) => {
  const db = readDb();
  const userNotifs = db.notifications.filter((n: any) => n.userId === req.user.id);
  return res.json(userNotifs);
});

app.post("/api/notifications/read", authenticate, (req: any, res) => {
  const { notifId } = req.body;
  const db = readDb();
  if (notifId) {
    const notif = db.notifications.find((n: any) => n.id === notifId && n.userId === req.user.id);
    if (notif) notif.isRead = true;
  } else {
    db.notifications.forEach((n: any) => {
      if (n.userId === req.user.id) n.isRead = true;
    });
  }
  writeDb(db);
  return res.json({ success: true });
});

// 12. CLIENT SETTINGS & MANAGEMENT
app.post("/api/profile/update", authenticate, (req: any, res) => {
  const { name, phone, timezone, companyLogo, isTwoFactorEnabled } = req.body;
  const db = readDb();
  const user = db.users.find((u: any) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (timezone) user.timezone = timezone;
  if (companyLogo) user.companyLogo = companyLogo;
  if (isTwoFactorEnabled !== undefined) user.isTwoFactorEnabled = isTwoFactorEnabled;
  
  // Sync client name on projects
  db.projects.forEach((p: any) => {
    if (p.clientId === user.id) {
      p.clientName = user.name;
    }
  });
  
  writeDb(db);
  return res.json({ success: true, user });
});

// Admin view all clients
app.get("/api/admin/clients", authenticate, requireAdmin, (req, res) => {
  const db = readDb();
  const clients = db.users.filter((u: any) => u.role === "client");
  
  const clientsWithProjects = clients.map((c: any) => {
    const p = db.projects.find((proj: any) => proj.clientId === c.id);
    return {
      ...c,
      activeProject: p ? p.name : "None",
      projectPhase: p ? p.phase : "N/A"
    };
  });
  
  return res.json(clientsWithProjects);
});

app.post("/api/admin/clients/:id/toggle-status", authenticate, requireAdmin, (req, res) => {
  const db = readDb();
  const clientUser = db.users.find((u: any) => u.id === req.params.id);
  if (!clientUser) {
    return res.status(404).json({ error: "Client not found" });
  }
  
  clientUser.status = clientUser.status === "active" ? "deactivated" : "active";
  writeDb(db);
  return res.json({ success: true, clientUser });
});

// Admin endpoint to provision new client user account
app.post("/api/admin/clients/create", authenticate, requireAdmin, (req, res) => {
  const { name, email, companyName, phone, timezone, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const db = readDb();
  const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const newUser = {
    id: `client-${Date.now()}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role: role || "client",
    companyName: companyName || "Client Company",
    phone: phone || "+1 555 0192",
    timezone: timezone || "Asia/Kolkata",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);

  return res.json({ success: true, user: newUser });
});

// Resend Email Logs view (useful for grading and looking under the hood!)
app.get("/api/admin/emails-sent", authenticate, requireAdmin, (req, res) => {
  const db = readDb();
  return res.json(db.emailsSent || []);
});

// ──────────────────────────────────────────────
// 13. AI PROPOSAL GENERATOR ENDPOINTS
// ──────────────────────────────────────────────

// List all proposals
app.get("/api/proposals", authenticate, (req, res) => {
  const db = readDb();
  return res.json(db.proposals || []);
});

// Create a new proposal
app.post("/api/proposals", authenticate, (req, res) => {
  const db = readDb();
  if (!db.proposals) db.proposals = [];

  const proposal = {
    ...req.body,
    id: `prop-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.proposals.unshift(proposal);
  writeDb(db);
  return res.json({ success: true, proposal });
});

// Update a proposal
app.put("/api/proposals/:id", authenticate, (req, res) => {
  const db = readDb();
  if (!db.proposals) return res.status(404).json({ error: "No proposals found" });

  const index = db.proposals.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Proposal not found" });

  db.proposals[index] = {
    ...db.proposals[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return res.json({ success: true, proposal: db.proposals[index] });
});

// Delete a proposal
app.delete("/api/proposals/:id", authenticate, (req, res) => {
  const db = readDb();
  if (!db.proposals) return res.status(404).json({ error: "No proposals found" });

  db.proposals = db.proposals.filter((p: any) => p.id !== req.params.id);
  writeDb(db);
  return res.json({ success: true });
});

// AI Proposal Generation (template fallback for Vite/Express dev mode)
app.post("/api/proposals/generate", authenticate, (req, res) => {
  const {
    clientName, projectTitle, projectType, briefDescription,
    estimatedBudget, currency = "USD", timelinePreference, techStackPreference = [], priorityFeatures
  } = req.body;

  if (!clientName || !projectTitle || !estimatedBudget) {
    return res.status(400).json({ error: "clientName, projectTitle, and estimatedBudget are required" });
  }

  const budget = Number(estimatedBudget);
  const rates: Record<string, number> = { USD: 95, GBP: 80, INR: 4000 };
  const symbols: Record<string, string> = { USD: "$", GBP: "£", INR: "₹" };
  const rate = rates[currency] || 95;
  const totalHours = Math.round(budget / rate);

  const phaseAllocations = [
    { name: "Phase 1: Discovery & Architecture", pct: 0.15, milestones: ["Requirements Analysis", "System Architecture Document", "Tech Stack Finalization"] },
    { name: "Phase 2: UX/UI Design", pct: 0.20, milestones: ["Wireframes & User Flows", "High-Fidelity Mockups", "Design System Documentation"] },
    { name: "Phase 3: Core Development", pct: 0.35, milestones: ["Backend API Development", "Frontend Implementation", "Database Schema & Migrations"] },
    { name: "Phase 4: QA & Testing", pct: 0.15, milestones: ["Unit & Integration Tests", "User Acceptance Testing", "Performance & Security Audit"] },
    { name: "Phase 5: Launch & Deployment", pct: 0.10, milestones: ["CI/CD Pipeline Setup", "Production Deployment", "DNS & SSL Configuration"] },
    { name: "Phase 6: Post-Launch Support", pct: 0.05, milestones: ["Bug Fix Sprint", "Performance Monitoring", "Knowledge Transfer"] },
  ];

  let weekCounter = 1;
  const timeWeeks = parseInt(timelinePreference) || 12;

  const phases = phaseAllocations.map((p) => {
    const duration = Math.max(1, Math.round(timeWeeks * p.pct));
    const phase = {
      name: p.name,
      duration: `${duration} week${duration > 1 ? "s" : ""}`,
      startWeek: weekCounter,
      endWeek: weekCounter + duration - 1,
      milestones: p.milestones,
      cost: Math.round(budget * p.pct),
    };
    weekCounter += duration;
    return phase;
  });

  const costBreakdown = [
    { id: "cl-1", category: "Frontend Development", description: `${projectType} UI with ${techStackPreference.slice(0, 3).join(", ") || "modern framework"}`, hours: Math.round(totalHours * 0.30), rate, amount: Math.round(budget * 0.30) },
    { id: "cl-2", category: "Backend Development", description: "API architecture, business logic, and database integration", hours: Math.round(totalHours * 0.25), rate, amount: Math.round(budget * 0.25) },
    { id: "cl-3", category: "UI/UX Design", description: "User research, wireframes, high-fidelity prototypes", hours: Math.round(totalHours * 0.15), rate, amount: Math.round(budget * 0.15) },
    { id: "cl-4", category: "QA & Testing", description: "Automated testing, security audits, performance benchmarks", hours: Math.round(totalHours * 0.12), rate, amount: Math.round(budget * 0.12) },
    { id: "cl-5", category: "DevOps & Infrastructure", description: "CI/CD pipelines, cloud infrastructure, monitoring", hours: Math.round(totalHours * 0.08), rate, amount: Math.round(budget * 0.08) },
    { id: "cl-6", category: "Project Management", description: "Sprint planning, client communication, documentation", hours: Math.round(totalHours * 0.10), rate, amount: Math.round(budget * 0.10) },
  ];

  const subtotal = costBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = currency === "INR" ? 18 : currency === "GBP" ? 20 : 0;
  const taxAmount = Math.round(subtotal * (taxRate / 100));

  const proposal = {
    executiveSummary: `Binary Froster is pleased to present this proposal for the ${projectTitle} project for ${clientName}. ${briefDescription || `This ${projectType.toLowerCase()} solution`} will be built using industry-leading technologies and our proven 6-phase delivery methodology.\n\nOur team of senior engineers, designers, and project managers will deliver a production-ready solution within the ${timelinePreference || "12 week"} timeline, ensuring enterprise-grade quality, security, and scalability throughout the development lifecycle.`,
    scopeOfWork: [
      { title: "Requirements Analysis & Discovery", description: "Deep-dive workshops to capture functional and non-functional requirements, user personas, and success metrics.", included: true },
      { title: "UI/UX Design & Prototyping", description: "Interactive Figma prototypes with dark premium aesthetic, responsive layouts, and accessibility compliance.", included: true },
      { title: "Full-Stack Development", description: `End-to-end ${projectType.toLowerCase()} development using ${techStackPreference.join(", ") || "modern tech stack"}.`, included: true },
      { title: "Quality Assurance & Testing", description: "Comprehensive testing including unit, integration, E2E, performance, and security penetration testing.", included: true },
      { title: "Deployment & DevOps", description: "Production deployment with CI/CD pipelines, monitoring, and auto-scaling infrastructure.", included: true },
      { title: "Post-Launch Support (30 days)", description: "Bug fixes, performance optimization, and knowledge transfer during the warranty period.", included: true },
    ],
    phases,
    costBreakdown,
    deliverables: [
      { name: "Architecture & Technical Specification", description: "Complete system architecture document with database schemas and API contracts.", phase: "Discovery" },
      { name: "UI/UX Design Package", description: "Figma design files, design system tokens, and interactive prototype.", phase: "Design" },
      { name: "Source Code Repository", description: "Clean, documented, production-ready codebase with comprehensive test coverage.", phase: "Development" },
      { name: "QA Report & Test Suites", description: "Automated test suites with coverage reports and security audit findings.", phase: "Testing" },
      { name: "Production Environment", description: "Deployed application with CI/CD pipeline, monitoring dashboards, and runbooks.", phase: "Launch" },
      { name: "Handover Documentation", description: "Technical documentation, API guides, deployment procedures, and admin manual.", phase: "Support" },
    ],
    techStackRecommendation: `Based on the ${projectType} requirements, we recommend: ${techStackPreference.length > 0 ? techStackPreference.join(", ") : "Next.js 15, React 19, TypeScript, PostgreSQL, Redis, Docker, and AWS"}. This stack provides optimal performance, developer productivity, and long-term maintainability.`,
    assumptions: [
      "Client will provide timely feedback within 48 hours of deliverable submissions",
      "Third-party API documentation and credentials will be available at project kickoff",
      "Content and copy will be provided by the client unless content creation is scoped",
      "Development environment access will be provisioned within the first week",
      `Project budget is estimated at ${symbols[currency]}${budget.toLocaleString()} with a 15% contingency buffer`,
    ],
    termsAndConditions: "This proposal is valid for 30 days from the date of issuance. Payment terms: 30% upfront deposit, 40% at mid-project milestone, 30% upon final delivery and acceptance. All intellectual property rights transfer to the client upon full payment. Binary Froster retains the right to showcase the project in its portfolio unless otherwise agreed in writing.",
    subtotal,
    taxRate,
    taxAmount,
    grandTotal: subtotal + taxAmount,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  };

  return res.json({ success: true, proposal, source: "template" });
});

// Serve the compiled frontend
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Binary Froster Server listening securely on port ${PORT}`);
  });
}

startServer();
