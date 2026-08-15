"use client";

import * as React from "react";
import {
  MessageSquare,
  Send,
  FileText,
  Users,
  CheckCheck,
} from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

interface Message {
  id: string;
  senderName: string;
  senderRole: "client" | "admin";
  senderAvatar: string;
  text: string;
  timestamp: string;
  attachments?: Array<{ name: string; url: string }>;
}

export default function MessagesPage() {
  const { user } = useUser();
  const { messages, sendMessage } = usePortalData();
  const [text, setText] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"chat" | "files">("chat");
  const [isTyping, setIsTyping] = React.useState(false);
  const [adminSender, setAdminSender] = React.useState<"Shivam" | "Digvijay" | "Jawad">("Shivam");

  const feedRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (senderRole: "client" | "admin" = "client") => {
    if (!text.trim()) return;

    const messageText = text;
    setText("");

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderName:
        senderRole === "client"
          ? user?.name || "Client User"
          : adminSender === "Shivam"
          ? "Shivam Dube"
          : adminSender === "Digvijay"
          ? "Digvijay Kadam"
          : "Jawad Khan Hakim",
      senderRole,
      senderAvatar:
        senderRole === "client"
          ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
          : adminSender === "Shivam"
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
          : adminSender === "Digvijay"
          ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
          : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      text: messageText,
      timestamp: new Date().toISOString(),
    };

    sendMessage(newMsg);

    // Simulated responses from admin team
    if (senderRole === "client") {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          senderName: "Shivam Dube",
          senderRole: "admin",
          senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          text: `Got your message. The engineering team will review it and follow up as soon as possible.`,
          timestamp: new Date().toISOString(),
        };
        sendMessage(replyMsg);
      }, 2000);
    }
  };

  const sharedFiles = messages
    .filter((m) => m.attachments && m.attachments.length > 0)
    .flatMap((m) => m.attachments || []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* LEFT: Participant list */}
      <Card className="bg-bg-card border-border-custom p-4 flex flex-col space-y-4 h-full">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2 border-b border-border-custom/50">
          <Users className="h-4 w-4 text-accent-primary mr-2" />
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
            // COGNITIVE UNIT
          </span>
        </CardHeader>
        <div className="space-y-3 flex-grow overflow-y-auto">
          <span className="block font-mono text-[8px] text-text-muted uppercase tracking-wider">
            // DESIGNATED INTEGRATORS
          </span>

          <div className="space-y-2">
            <div className="flex items-center gap-2.5 p-2 bg-bg-secondary/40 rounded border border-border-custom/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60"
                alt="Shivam"
                className="h-7.5 w-7.5 rounded-full border border-accent-primary/20 object-cover"
              />
              <div>
                <span className="block font-sans text-xs font-bold text-white">Shivam Dube</span>
                <span className="block font-mono text-[8px] text-accent-primary uppercase font-medium">
                  Founder & AI Engineer
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 bg-bg-secondary/40 rounded border border-border-custom/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60"
                alt="Digvijay"
                className="h-7.5 w-7.5 rounded-full border border-accent-primary/20 object-cover"
              />
              <div>
                <span className="block font-sans text-xs font-bold text-white">
                  Digvijay Kadam
                </span>
                <span className="block font-mono text-[8px] text-accent-primary uppercase font-medium">
                  UI/UX Designer
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 bg-bg-secondary/40 rounded border border-border-custom/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60"
                alt="Jawad"
                className="h-7.5 w-7.5 rounded-full border border-accent-primary/20 object-cover"
              />
              <div>
                <span className="block font-sans text-xs font-bold text-white">Jawad Khan</span>
                <span className="block font-mono text-[8px] text-accent-primary uppercase font-medium">
                  Backend Architect
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 p-1 bg-bg-secondary/60 rounded border border-border-custom/80">
          <button
            onClick={() => setActiveTab("chat")}
            className={`py-1.5 font-mono text-[10px] uppercase font-bold rounded cursor-pointer ${
              activeTab === "chat" ? "bg-accent-primary text-bg-primary" : "text-text-secondary hover:text-white"
            }`}
          >
            CHAT
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`py-1.5 font-mono text-[10px] uppercase font-bold rounded cursor-pointer ${
              activeTab === "files" ? "bg-accent-primary text-bg-primary" : "text-text-secondary hover:text-white"
            }`}
          >
            FILES ({sharedFiles.length})
          </button>
        </div>
      </Card>

      {/* RIGHT: Chat thread box */}
      <Card className="lg:col-span-3 bg-bg-card border-border-custom flex flex-col h-full overflow-hidden">
        {activeTab === "chat" ? (
          <>
            {/* Thread Header */}
            <div className="p-4 bg-bg-secondary/40 border-b border-border-custom/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-primary animate-pulse" />
                <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
                  // SECURE CHAT CHANNEL
                </span>
              </div>
              <span className="font-mono text-[9px] text-text-muted">Read receipts: enabled</span>
            </div>

            {/* Messages Feed */}
            <div ref={feedRef} className="flex-grow p-4 overflow-y-auto space-y-4">
              {messages.map((m) => {
                const isClient = m.senderRole === "client";

                return (
                  <div key={m.id} className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] space-y-1.5 ${isClient ? "text-right" : "text-left"}`}>
                      <span className="block font-mono text-[9px] text-text-muted">
                        {m.senderName} •{" "}
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <div
                        className={`p-3.5 text-xs rounded-input leading-relaxed border ${
                          isClient
                            ? "bg-bg-secondary border-accent-primary/40 text-white"
                            : "bg-accent-primary/10 border-accent-primary/25 text-white shadow-glow"
                        }`}
                      >
                        <p>{m.text}</p>

                        {m.attachments && m.attachments.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-border-custom/50 space-y-1.5 text-left">
                            {m.attachments.map((file, i) => (
                              <a
                                key={i}
                                href={file.url}
                                download={file.name}
                                className="p-2 bg-bg-primary/50 border border-border-custom rounded flex items-center gap-2 hover:border-accent-primary/30 transition-colors cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5 text-accent-primary" />
                                <span className="underline font-mono text-[10px] text-white">
                                  {file.name}
                                </span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="space-y-1.5">
                    <span className="block font-mono text-[9px] text-text-muted">
                      Shivam Dube is typing...
                    </span>
                    <div className="p-3 bg-bg-secondary border border-border-custom/60 rounded-input flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-accent-primary rounded-full animate-bounce" />
                      <span
                        className="h-1.5 w-1.5 bg-accent-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <span
                        className="h-1.5 w-1.5 bg-accent-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Response simulation switcher (shown for development ease / control) */}
            {user?.role === "admin" && (
              <div className="px-4 py-2 bg-bg-secondary/40 border-t border-b border-border-custom/50 flex flex-wrap items-center justify-between gap-2.5">
                <span className="font-mono text-[9px] text-accent-primary font-bold uppercase tracking-wider">
                  // EXECUTIVE RESPOND TOOL
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={adminSender}
                    onChange={(e: any) => setAdminSender(e.target.value)}
                    className="bg-bg-primary border border-border-custom text-accent-primary font-mono text-[10px] px-2 py-1 rounded outline-none cursor-pointer"
                  >
                    <option value="Shivam">Shivam Dube (AI)</option>
                    <option value="Digvijay">Digvijay Kadam (Design)</option>
                    <option value="Jawad">Jawad Khan (Backend)</option>
                  </select>
                  <Button
                    onClick={() => handleSendMessage("admin")}
                    variant="accent"
                    size="sm"
                    className="font-mono text-[10px] uppercase font-bold cursor-pointer"
                  >
                    [DISPATCH_AS_ADMIN]
                  </Button>
                </div>
              </div>
            )}

            {/* Client input bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage("client");
              }}
              className="p-4 bg-bg-secondary/25 border-t border-border-custom/50 flex gap-2.5 items-center"
            >
              <input
                id="chat-input"
                type="text"
                placeholder="Secure messaging input... type something to trigger response simulation"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-grow bg-bg-secondary border border-border-custom focus:border-accent-primary text-white px-4 py-3 text-xs rounded-input outline-none font-sans"
              />
              <Button
                id="chat-send-button"
                type="submit"
                variant="accent"
                disabled={!text.trim()}
                className="p-3 cursor-pointer shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          /* Shared Files attachments tab */
          <div className="p-6 space-y-4 overflow-y-auto">
            <span className="block font-mono text-[10px] text-accent-primary uppercase tracking-widest">
              // SECURED THREAD ARTIFACTS
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              These documents have been shared strictly within chat communications.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {sharedFiles.length === 0 ? (
                <div className="col-span-2 text-center py-12 border border-dashed border-border-custom rounded-input">
                  <span className="font-mono text-[10px] text-text-muted">
                    // NO_SHARED_THREAD_FILES
                  </span>
                </div>
              ) : (
                sharedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-bg-secondary border border-border-custom rounded-input flex items-center justify-between gap-4 text-white"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-accent-primary" />
                      <div className="space-y-0.5">
                        <span className="block font-sans text-xs font-semibold truncate max-w-[120px]">
                          {file.name}
                        </span>
                        <span className="block font-mono text-[9px] text-text-muted uppercase">
                          Thread Attachment
                        </span>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      download={file.name}
                      className="font-mono text-[10px] text-accent-primary hover:underline cursor-pointer"
                    >
                      [DOWNLOAD]
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
