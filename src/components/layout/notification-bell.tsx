"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Check, MessageSquare, Calendar, CreditCard, FileCheck, HelpCircle, FileText, Settings } from "lucide-react";
import { Notification } from "@/src/types";
import { cn, formatDate } from "@/src/lib/utils";

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    userId: "client-john",
    title: "Deliverable Awaiting Review",
    description: "Jawad Khan Hakim uploaded 'Fintech Engine Architecture Whitepaper' for your formal approval.",
    timestamp: "2026-06-20T10:00:00Z",
    link: "/approvals",
    isRead: false,
    type: "deliverable",
  },
  {
    id: "notif-2",
    userId: "client-john",
    title: "New Invoice Issued",
    description: "Invoice BF-2026-003 for Phase 3: Core Backend (Deposit) has been generated.",
    timestamp: "2026-06-15T09:00:00Z",
    link: "/billing",
    isRead: false,
    type: "invoice",
  },
];

export function NotificationBell() {
  const [notifications, setNotifications] = React.useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [isOpen, setIsOpen] = React.useState(false);
  const bellRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "message":
        return <MessageSquare className="w-4 h-4 text-accent-primary" />;
      case "milestone":
        return <Calendar className="w-4 h-4 text-brand-success" />;
      case "invoice":
        return <CreditCard className="w-4 h-4 text-brand-warning" />;
      case "deliverable":
        return <FileCheck className="w-4 h-4 text-accent-primary" />;
      case "ticket":
        return <HelpCircle className="w-4 h-4 text-brand-error" />;
      case "contract":
        return <FileText className="w-4 h-4 text-white" />;
      default:
        return <Bell className="w-4 h-4 text-text-secondary" />;
    }
  };

  return (
    <div ref={bellRef} className="relative">
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded bg-bg-secondary hover:bg-neutral-800 text-text-secondary hover:text-white transition-colors cursor-pointer border border-border-custom"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-card border border-border-custom bg-bg-card p-1 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-custom bg-bg-secondary/20">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Notifications ({unreadCount})
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center text-[10px] font-mono text-accent-primary hover:text-accent-hover cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Bell className="w-8 h-8 text-text-muted mb-2" />
                <p className="text-sm text-text-secondary">All caught up!</p>
                <p className="text-xs text-text-muted mt-1">No new notifications.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-custom/50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn("p-4 transition-colors", {
                      "bg-white/[0.01]": !notif.isRead,
                      "opacity-60": notif.isRead,
                    })}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded bg-bg-secondary border border-border-custom shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 space-y-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-white truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] font-mono text-text-muted shrink-0 ml-2">
                            {formatDate(notif.timestamp, "HH:mm")}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary leading-normal">
                          {notif.description}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <Link
                            href={notif.link}
                            onClick={() => {
                              markAsRead(notif.id);
                              setIsOpen(false);
                            }}
                            className="text-[10px] font-mono text-accent-primary hover:underline"
                          >
                            View details &rarr;
                          </Link>
                          {!notif.isRead && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="text-[10px] font-mono text-text-muted hover:text-white"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
