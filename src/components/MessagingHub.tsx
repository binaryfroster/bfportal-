import React, { useState, useEffect, useRef } from "react";
import { Message, Project } from "../types";
import { api } from "../lib/api";
import { MessageSquare, Send, Paperclip, FileText, User, Users, CheckCheck, Compass, Code, Terminal, Clock } from "lucide-react";
import { motion } from "motion/react";

interface MessagingHubProps {
  project: Project;
  user: any;
}

export default function MessagingHub({ project, user }: MessagingHubProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "files">("chat");
  const [isTyping, setIsTyping] = useState(false);
  const [adminSender, setAdminSender] = useState<"Shivam" | "Digvijay" | "Jawad">("Shivam");

  const feedRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const list = await api.getMessages(project.id);
      setMessages(list);
    } catch (err) {
      console.error("Failed loading chat thread:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 15000);
    return () => clearInterval(interval);
  }, [project]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent, senderRole: "client" | "admin" = "client") => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageText = text;
    setText("");

    try {
      if (senderRole === "client") {
        await api.sendMessage(project.id, messageText, undefined, undefined, user.id, user.name, "client");
      } else {
        // Simulated admin replying instantly
        const senderMap = {
          Shivam: { id: "admin-shivam", name: "Shivam Dube", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
          Digvijay: { id: "admin-digvijay", name: "Digvijay Kadam", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
          Jawad: { id: "admin-jawad", name: "Jawad Khan Hakim", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" }
        };
        const adm = senderMap[adminSender];
        await api.sendMessage(project.id, messageText, undefined, undefined, adm.id, adm.name, "admin", adm.avatar);
      }
      await loadMessages();
    } catch (err) {
      console.error("Failed dispatching message:", err);
    }
  };

  // Simulating an AI reply / admin response after 2 seconds when client types a critical system query
  const simulateAutoReply = async (clientQuery: string) => {
    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);
      try {
        await api.sendMessage(
          project.id,
          `Acknowledged. The engineering team has reviewed this query. Digvijay is verifying the visual artifacts and Shivam is adjusting the matching consensus pipeline. Updates will be deployed within 1 hour.`,
          undefined,
          undefined,
          "admin-shivam",
          "Shivam Dube",
          "admin",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        );
        await loadMessages();
      } catch (err) {
        console.error("Auto reply simulation failed:", err);
      }
    }, 2500);
  };

  const handleClientSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const clientQuery = text;
    
    await handleSendMessage(e, "client");

    // Auto-trigger typing indicator and simulation on certain words
    if (clientQuery.toLowerCase().includes("status") || clientQuery.toLowerCase().includes("bug") || clientQuery.toLowerCase().includes("fix") || clientQuery.toLowerCase().includes("uk")) {
      simulateAutoReply(clientQuery);
    }
  };

  // Filter messages that contain file attachments
  const sharedFiles = messages
    .filter((m) => m.attachments && m.attachments.length > 0)
    .flatMap((m) => m.attachments || []);

  if (loading) {
    return (
      <div className="bg-bg-card border border-border-custom p-6 rounded-card animate-pulse h-[500px]"></div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* LEFT: Participant drawer and shared files toggle */}
      <div className="bg-bg-card border border-border-custom p-4 rounded-card flex flex-col space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border-custom/50">
          <Users className="h-4 w-4 text-accent-primary" />
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">// COGNITIVE UNIT</span>
        </div>

        {/* Agency members lists */}
        <div className="space-y-3">
          <span className="block font-mono text-[8px] text-text-muted uppercase tracking-wider">// DESIGNATED INTEGRATORS</span>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 p-2 bg-bg-secondary/40 rounded border border-border-custom/50">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60" alt="Shivam" referrerPolicy="no-referrer" className="h-7.5 w-7.5 rounded-full border border-accent-primary/20 object-cover" />
              <div>
                <span className="block font-sans text-xs font-bold text-text-primary">Shivam Dube</span>
                <span className="block font-mono text-[8px] text-accent-primary uppercase font-medium">Lead Core Architect</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 bg-bg-secondary/40 rounded border border-border-custom/50">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60" alt="Digvijay" referrerPolicy="no-referrer" className="h-7.5 w-7.5 rounded-full border border-accent-primary/20 object-cover" />
              <div>
                <span className="block font-sans text-xs font-bold text-text-primary">Digvijay Kadam</span>
                <span className="block font-mono text-[8px] text-accent-primary uppercase font-medium">Lead Interface Engineer</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 bg-bg-secondary/40 rounded border border-border-custom/50">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60" alt="Jawad" referrerPolicy="no-referrer" className="h-7.5 w-7.5 rounded-full border border-accent-primary/20 object-cover" />
              <div>
                <span className="block font-sans text-xs font-bold text-text-primary">Jawad</span>
                <span className="block font-mono text-[8px] text-accent-primary uppercase font-medium">Product Delivery Specialist</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="h-[1px] bg-border-custom w-full"></div>

        <div className="grid grid-cols-2 gap-1.5 p-1 bg-bg-secondary/60 rounded border border-border-custom/80">
          <button
            onClick={() => setActiveTab("chat")}
            className={`py-1.5 font-mono text-[10px] uppercase font-bold rounded cursor-pointer ${activeTab === "chat" ? "bg-accent-primary text-bg-primary" : "text-text-secondary hover:text-text-primary"}`}
          >
            CHAT
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`py-1.5 font-mono text-[10px] uppercase font-bold rounded cursor-pointer ${activeTab === "files" ? "bg-accent-primary text-bg-primary" : "text-text-secondary hover:text-text-primary"}`}
          >
            FILES ({sharedFiles.length})
          </button>
        </div>
      </div>

      {/* RIGHT: Chat thread box */}
      <div className="lg:col-span-3 bg-bg-card border border-border-custom rounded-card flex flex-col overflow-hidden relative">
        
        {activeTab === "chat" ? (
          <>
            {/* Thread Header */}
            <div className="p-4 bg-bg-secondary/40 border-b border-border-custom/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-primary animate-pulse"></span>
                <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">// SECURE UPTIME CHANNEL</span>
              </div>
              <span className="font-mono text-[9px] text-text-muted">
                Read receipts: enabled
              </span>
            </div>

            {/* Messages Feed */}
            <div 
              ref={feedRef}
              className="flex-grow p-4 overflow-y-auto space-y-4 max-h-[420px]"
            >
              {messages.map((m) => {
                const isClient = m.senderRole === "client";
                
                return (
                  <div 
                    key={m.id}
                    className={`flex ${isClient ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] space-y-1.5 ${isClient ? "text-right" : "text-left"}`}>
                      {/* Name label */}
                      <span className="block font-mono text-[9px] text-text-muted">
                        {m.senderName} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      {/* Text Bubble */}
                      <div className={`p-3.5 text-xs rounded-input leading-relaxed border ${
                        isClient 
                          ? "bg-bg-secondary border-accent-primary/40 text-text-primary" 
                          : "bg-accent-primary/10 border-accent-primary/25 text-text-primary shadow-glow"
                      }`}>
                        <p>{m.text}</p>

                        {m.attachments && m.attachments.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-border-custom/50 space-y-1.5">
                            {m.attachments.map((file, i) => (
                              <a
                                key={i}
                                href={file.url}
                                download={file.name}
                                className="p-2 bg-bg-primary/50 border border-border-custom rounded flex items-center gap-2 hover:border-accent-primary/30 transition-colors"
                              >
                                <FileText className="h-3.5 w-3.5 text-accent-primary" />
                                <span className="underline font-mono text-[10px] text-text-primary">{file.name}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing simulation */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="space-y-1.5">
                    <span className="block font-mono text-[9px] text-text-muted">Digvijay Kadam is typing...</span>
                    <div className="p-3 bg-bg-secondary border border-border-custom/60 rounded-input flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-accent-primary rounded-full animate-bounce"></span>
                      <span className="h-1.5 w-1.5 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                      <span className="h-1.5 w-1.5 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Simulated Admin Control responder block (to show how Shivam replies) */}
            <div className="px-4 py-2 bg-bg-secondary/40 border-t border-b border-border-custom/50 flex flex-wrap items-center justify-between gap-2.5">
              <span className="font-mono text-[9px] text-accent-primary font-bold uppercase tracking-wider">// EXECUTIVE RESPOND TOOL</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-text-secondary">Sender:</span>
                <select 
                  value={adminSender} 
                  onChange={(e: any) => setAdminSender(e.target.value)}
                  className="bg-bg-primary border border-border-custom text-accent-primary font-mono text-[10px] px-2 py-1 rounded outline-none"
                >
                  <option value="Shivam">Shivam Dube (Lead Architect)</option>
                  <option value="Digvijay">Digvijay Kadam (Interface)</option>
                  <option value="Jawad">Jawad (Delivery)</option>
                </select>
                <button
                  onClick={(e) => handleSendMessage(e, "admin")}
                  className="px-3 py-1 bg-bg-primary hover:border-accent-primary hover:text-accent-primary border border-border-custom text-text-secondary font-mono text-[10px] rounded transition-all cursor-pointer"
                >
                  [DISPATCH_AS_ADMIN]
                </button>
              </div>
            </div>

            {/* Client Input bar */}
            <form onSubmit={handleClientSendSubmit} className="p-4 bg-bg-secondary/20 flex gap-2.5 items-center">
              <input 
                type="text"
                placeholder="Secure messaging input... (type 'status' or 'fix' for simulated urgent response)"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-grow bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-4 py-3 text-xs rounded-input outline-none font-sans"
              />
              <button 
                type="submit"
                disabled={!text.trim()}
                className="p-3 bg-accent-primary hover:bg-accent-hover disabled:bg-bg-secondary disabled:border-border-custom disabled:text-text-muted text-bg-primary rounded-input transition-all shadow-glow-strong cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          /* Segmented thread attachments tab */
          <div className="p-6 space-y-4">
            <span className="block font-mono text-[10px] text-accent-primary uppercase tracking-widest">// SECURED THREAD ARTIFACTS</span>
            <p className="text-xs text-text-secondary leading-relaxed">
              These documents have been shared strictly within chat communications and are separated from the main File Explorer directory.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto max-h-[400px]">
              {sharedFiles.length === 0 ? (
                <div className="col-span-2 text-center py-12 border border-dashed border-border-custom rounded-input">
                  <span className="font-mono text-[10px] text-text-muted">// NO_SHARED_THREAD_FILES</span>
                </div>
              ) : (
                sharedFiles.map((file, idx) => (
                  <div key={idx} className="p-3.5 bg-bg-secondary border border-border-custom rounded-input flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-accent-primary" />
                      <div className="space-y-0.5">
                        <span className="block font-sans text-xs font-semibold text-text-primary truncate max-w-[120px]">{file.name}</span>
                        <span className="block font-mono text-[9px] text-text-muted uppercase">Thread File</span>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      download={file.name}
                      className="font-mono text-[10px] text-accent-primary hover:underline"
                    >
                      [DOWNLOAD]
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
