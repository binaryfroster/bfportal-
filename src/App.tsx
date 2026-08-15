import { useState, useEffect } from "react";
import { User, Project, Notification } from "./types";
import { api } from "./lib/api";
import Login from "./components/Login";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import ProjectTracker from "./components/ProjectTracker";
import KanbanBoard from "./components/KanbanBoard";
import FileManager from "./components/FileManager";
import DeliverableApproval from "./components/DeliverableApproval";
import BillingHub from "./components/BillingHub";
import MessagingHub from "./components/MessagingHub";
import MeetingScheduler from "./components/MeetingScheduler";
import TicketsHub from "./components/TicketsHub";
import AdminPanel from "./components/AdminPanel";

import { 
  Terminal, ShieldAlert, Bell, LayoutDashboard, Compass, Kanban, Folder, 
  ShieldCheck, CreditCard, MessageSquare, Calendar, HelpCircle, Settings, LogOut, Loader2, Check, Menu, X 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  
  // Developer test helper role
  const [roleOverride, setRoleOverride] = useState<"client" | "admin">("client");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    async function initSession() {
      try {
        const session = await api.getCurrentUser();
        if (session && session.user) {
          setCurrentUser(session.user);
          setRoleOverride(session.user.role);
          
          if (session.projects && session.projects.length > 0) {
            setActiveProject(session.projects[0]);
          }
        }
      } catch (err) {
        console.error("Session init failed:", err);
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, []);

  // Sync notifications
  const loadNotifications = async () => {
    if (!currentUser) return;
    try {
      const list = await api.getNotifications();
      setNotifications(list);
    } catch (err) {
      console.error("Notifications fetch failed:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLoginSuccess = (user: User, projects?: Project[]) => {
    setCurrentUser(user);
    setRoleOverride(user.role);
    if (projects && projects.length > 0) {
      setActiveProject(projects[0]);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setActiveProject(null);
    setActiveView("dashboard");
  };

  const handleOnboardingComplete = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleNotificationRead = async (id: string) => {
    try {
      await api.readNotification(id);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRoleOverride = () => {
    const nextRole = roleOverride === "client" ? "admin" : "client";
    setRoleOverride(nextRole);
    // Switch default active views accordingly
    if (nextRole === "admin") {
      setActiveView("admin");
    } else {
      setActiveView("dashboard");
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center text-accent-primary font-mono text-xs">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent-primary" />
          <p className="uppercase tracking-widest">// DECRYPTING BINARY TUNNELS...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Force onboarding checklist before entering dashboard
  const onboardingIncomplete = !currentUser.phone || !currentUser.timezone;
  if (onboardingIncomplete) {
    return <Onboarding user={currentUser} onOnboardingComplete={handleOnboardingComplete} />;
  }

  // Navigation Items
  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, role: "any" },
    { id: "tracker", label: "Project Tracker", icon: <Compass className="h-4 w-4" />, role: "any" },
    { id: "kanban", label: "Kanban Board", icon: <Kanban className="h-4 w-4" />, role: "any" },
    { id: "files", label: "File Vaults", icon: <Folder className="h-4 w-4" />, role: "any" },
    { id: "approvals", label: "Deliverables Review", icon: <ShieldCheck className="h-4 w-4" />, role: "any" },
    { id: "billing", label: "Billing Ledgers", icon: <CreditCard className="h-4 w-4" />, role: "any" },
    { id: "messages", label: "Direct Thread", icon: <MessageSquare className="h-4 w-4" />, role: "any" },
    { id: "meetings", label: "Cal Scheduler", icon: <Calendar className="h-4 w-4" />, role: "any" },
    { id: "tickets", label: "Support Engine", icon: <HelpCircle className="h-4 w-4" />, role: "any" },
    { id: "admin", label: "Admin Console", icon: <Settings className="h-4 w-4 text-accent-primary animate-spin" style={{ animationDuration: "12s" }} />, role: "admin" }
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary text-text-primary font-sans relative">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 border-r border-border-custom bg-bg-secondary flex-col flex-shrink-0">
        {/* logo */}
        <div className="p-6 border-b border-border-custom flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent-primary flex items-center justify-center rounded-sm flex-shrink-0">
            <span className="font-mono font-bold text-bg-primary text-lg">B</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-bold text-sm tracking-tighter uppercase text-text-primary">Binary Froster</span>
            <span className="text-[10px] text-accent-primary font-mono leading-none">ENGINEERING_CORE</span>
          </div>
        </div>

        {/* nav */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          <div className="px-6 py-2 text-[10px] uppercase tracking-widest text-text-muted font-mono">Navigation</div>
          {NAV_ITEMS.filter(item => item.role === "any" || item.role === roleOverride).map((item, index) => {
            const isSelected = activeView === item.id;
            const numStr = (index + 1).toString().padStart(2, '0');
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center px-6 py-3 text-xs font-medium text-left transition-all cursor-pointer border-l-2 ${
                  isSelected 
                    ? "border-accent-primary bg-bg-card text-accent-primary font-bold shadow-[0_0_15px_rgba(0,212,255,0.05)]" 
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <span className="mr-3 font-mono text-[10px] opacity-60">{numStr}.</span>
                <span className="mr-2 flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Project Lead */}
        <div className="p-4 border-t border-border-custom bg-bg-secondary/40">
          <div className="bg-bg-card rounded-lg p-3 border border-border-custom/55">
            <div className="text-[10px] font-mono text-text-muted uppercase mb-2">Project Lead</div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-border-custom border border-border-custom mr-2 overflow-hidden flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
                  className="w-full h-full object-cover" 
                  alt="Shivam Dube"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-text-primary leading-tight">Shivam Dube</span>
                <span className="text-[10px] text-accent-primary font-mono leading-none mt-0.5">Founder / AI Eng</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-bg-secondary border-r border-border-custom flex flex-col z-50 md:hidden"
            >
              <div className="p-6 border-b border-border-custom flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent-primary flex items-center justify-center rounded-sm">
                    <span className="font-mono font-bold text-bg-primary text-lg">B</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono font-bold text-sm tracking-tighter uppercase text-text-primary">Binary Froster</span>
                    <span className="text-[10px] text-accent-primary font-mono leading-none">ENGINEERING_CORE</span>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                <div className="px-6 py-2 text-[10px] uppercase tracking-widest text-text-muted font-mono">Navigation</div>
                {NAV_ITEMS.filter(item => item.role === "any" || item.role === roleOverride).map((item, index) => {
                  const isSelected = activeView === item.id;
                  const numStr = (index + 1).toString().padStart(2, '0');
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-6 py-3 text-xs font-medium text-left transition-all cursor-pointer border-l-2 ${
                        isSelected 
                          ? "border-accent-primary bg-bg-card text-accent-primary font-bold" 
                          : "border-transparent text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <span className="mr-3 font-mono text-[10px] opacity-60">{numStr}.</span>
                      <span className="mr-2 flex-shrink-0">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border-custom bg-bg-secondary/40">
                <div className="bg-bg-card rounded-lg p-3">
                  <div className="text-[10px] font-mono text-text-muted uppercase mb-2">Project Lead</div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-border-custom border border-border-custom mr-2 overflow-hidden flex-shrink-0">
                      <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
                        className="w-full h-full object-cover" 
                        alt="Shivam Dube"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-text-primary">Shivam Dube</span>
                      <span className="text-[10px] text-accent-primary font-mono">Founder / AI Eng</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Panel Column */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-border-custom flex items-center justify-between px-6 md:px-8 bg-bg-secondary flex-shrink-0">
          <div className="flex items-center space-x-3 text-xs">
            {/* Hamburger for mobile */}
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 -ml-2 text-text-secondary hover:text-text-primary md:hidden cursor-pointer rounded-md hover:bg-bg-card transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-2 font-mono text-text-secondary">
              <span className="text-text-muted font-bold">ROOT /</span>
              <span className="font-bold tracking-tight text-text-primary uppercase">
                {activeProject ? activeProject.name.replace(/\s+/g, "_") : "PROJECT_HYPERION"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">
            
            {/* ROLE SWAPPER FOR TESTING */}
            <button
              onClick={toggleRoleOverride}
              className="px-2.5 py-1 bg-bg-primary border border-accent-primary/20 text-accent-primary hover:bg-accent-primary/5 font-mono text-[9px] uppercase font-bold rounded transition-all cursor-pointer flex items-center gap-1"
              title="Convenient swap tool to test both client view and Shivam Dube's admin view"
            >
              <ShieldAlert className="h-3 w-3" />
              Role: {roleOverride === "admin" ? "Admin" : "Client"}
            </button>

            {/* NOTIFICATION BELL */}
            <div className="relative flex items-center">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-md border border-border-custom bg-bg-primary hover:text-accent-primary hover:border-accent-primary/40 transition-all relative cursor-pointer outline-none"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-brand-error animate-ping"></span>
                )}
              </button>

              {/* Notifications Menu list */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-3 w-80 bg-bg-card border border-border-custom rounded-card shadow-glow overflow-hidden z-40"
                    >
                      <div className="p-3 bg-bg-secondary border-b border-border-custom/50 flex justify-between items-center">
                        <span className="font-mono text-[9px] text-text-secondary uppercase tracking-widest">// LEDGER UPDATES</span>
                        <span className="font-mono text-[9px] text-text-muted">
                          {unreadNotifications.length} unread
                        </span>
                      </div>

                      <div className="divide-y divide-border-custom/40 max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-text-muted font-mono text-[9px]">
                            // NO_TELEMETRY_UPDATES
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id}
                              className={`p-3 text-xs transition-colors flex justify-between gap-3 ${
                                notif.read ? "bg-transparent opacity-60" : "bg-bg-secondary/40"
                              }`}
                            >
                              <div className="space-y-0.5">
                                <p className="font-sans text-text-primary leading-normal">{notif.text}</p>
                                <span className="block font-mono text-[8px] text-text-muted">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              {!notif.read && (
                                <button
                                  onClick={() => handleNotificationRead(notif.id)}
                                  className="h-5 w-5 rounded-full border border-border-custom/80 hover:border-brand-success hover:text-brand-success flex items-center justify-center flex-shrink-0 cursor-pointer"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-[1px] bg-border-custom"></div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-text-primary">{currentUser.name}</div>
                <div className="text-[10px] text-text-muted font-mono uppercase tracking-tight">
                  {currentUser.companyName || "NEXUS_CORP"}
                </div>
              </div>
              <div className="w-9 h-9 rounded-md border border-accent-primary flex items-center justify-center bg-bg-primary text-accent-primary font-mono text-sm font-bold shadow-[0_0_10px_rgba(0,212,255,0.15)] flex-shrink-0">
                {currentUser.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md border border-border-custom bg-bg-primary hover:text-brand-error hover:border-brand-error/40 transition-all cursor-pointer"
                title="Sign out Secure Session"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

          </div>
        </header>

        {/* Dynamic Inner Tab View */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-bg-primary">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeView === "dashboard" && activeProject && (
                <Dashboard 
                  user={currentUser} 
                  project={activeProject} 
                  onNavigate={(v) => setActiveView(v)} 
                  onActionClick={(type, data) => {
                    if (type === "approve") {
                      setActiveView("approvals");
                    } else if (type === "pay") {
                      setActiveView("billing");
                    } else if (type === "sign") {
                      setActiveView("approvals");
                    }
                  }}
                />
              )}

              {activeView === "tracker" && activeProject && (
                <ProjectTracker project={activeProject} />
              )}

              {activeView === "kanban" && activeProject && (
                <KanbanBoard project={activeProject} userRole={roleOverride} />
              )}

              {activeView === "files" && activeProject && (
                <FileManager project={activeProject} user={currentUser} />
              )}

              {activeView === "approvals" && activeProject && (
                <DeliverableApproval project={activeProject} userRole={roleOverride} />
              )}

              {activeView === "billing" && activeProject && (
                <BillingHub project={activeProject} user={currentUser} />
              )}

              {activeView === "messages" && activeProject && (
                <MessagingHub project={activeProject} user={currentUser} />
              )}

              {activeView === "meetings" && activeProject && (
                <MeetingScheduler project={activeProject} user={currentUser} />
              )}

              {activeView === "tickets" && activeProject && (
                <TicketsHub project={activeProject} user={currentUser} userRole={roleOverride} />
              )}

              {activeView === "admin" && activeProject && (
                <AdminPanel project={activeProject} onRefreshProject={async () => {
                  const session = await api.getCurrentUser();
                  if (session && session.projects && session.projects.length > 0) {
                    setActiveProject(session.projects[0]);
                  }
                }} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* System Footer Info */}
        <footer className="h-12 border-t border-border-custom px-6 md:px-8 flex items-center justify-between bg-bg-secondary text-[10px] font-mono text-text-muted flex-shrink-0">
          <div className="flex items-center space-x-4">
            <span>SYSTEM: STABLE</span>
            <span className="text-accent-primary">•</span>
            <span>LATENCY: 24ms</span>
            <span className="text-accent-primary">•</span>
            <span>V1.4.2-PROD</span>
          </div>
          <div className="hidden sm:block">
            &copy; 2026 BINARY FROSTER PVT LTD. PRECISION-BUILT TECHNOLOGY.
          </div>
        </footer>

      </main>
    </div>
  );
}
