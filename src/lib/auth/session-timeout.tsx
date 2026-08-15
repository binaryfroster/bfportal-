"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/components/providers/auth-provider";
import { Modal } from "@/src/components/ui/modal";
import { Button } from "@/src/components/ui/button";
import { ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

// 25 minutes for warning, 5 minutes for logout (in milliseconds)
const WARNING_TIMEOUT = 25 * 60 * 1000;
const LOGOUT_TIMEOUT = 5 * 60 * 1000;

export function SessionTimeout() {
  const router = useRouter();
  const { user, logout } = useUser();
  
  const [showWarning, setShowWarning] = React.useState(false);
  const [countdown, setCountdown] = React.useState(300); // 5 minutes in seconds

  const warningTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleLogout = React.useCallback(() => {
    logout();
    setShowWarning(false);
    toast.error("Session expired due to inactivity.");
    router.replace("/login");
  }, [logout, router]);

  // Reset inactivity timers
  const resetTimers = React.useCallback(() => {
    if (showWarning) return; // If warning is visible, don't reset until they click "extend"

    // Clear existing timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    // Set new warning timer
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(300); // Reset countdown to 5 minutes
    }, WARNING_TIMEOUT);
  }, [showWarning]);

  // Extend session handler
  const extendSession = () => {
    setShowWarning(false);
    resetTimers();
    // Refresh cookie
    if (user) {
      document.cookie = `bf_session=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=1800`;
    }
    toast.success("Session extended.");
  };

  // Watch user actions
  React.useEffect(() => {
    if (!user) return;

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    
    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimers);
    });

    // Initialize timers
    resetTimers();

    return () => {
      // Cleanup
      events.forEach((event) => {
        window.removeEventListener(event, resetTimers);
      });
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [user, resetTimers]);

  // Handle countdown when warning is active
  React.useEffect(() => {
    if (showWarning) {
      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Trigger logout fallback in case interval drifts
      logoutTimerRef.current = setTimeout(handleLogout, LOGOUT_TIMEOUT);
    } else {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [showWarning, handleLogout]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      isOpen={showWarning}
      onClose={() => {}} // Block clicking outside or close button to dismiss
      title="Inactivity Warning"
      className="border-brand-warning/30"
    >
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="p-3 bg-brand-warning/10 border border-brand-warning/20 rounded-full text-brand-warning">
          <ShieldAlert className="w-8 h-8 animate-bounce" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">Your session is about to expire</p>
          <p className="text-xs font-mono text-text-secondary leading-relaxed">
            For security, you will be logged out automatically in{" "}
            <span className="text-brand-warning font-bold font-mono">{formatCountdown(countdown)}</span>{" "}
            due to inactivity.
          </p>
        </div>
        <div className="flex space-x-3 w-full pt-4">
          <Button onClick={handleLogout} variant="secondary" className="flex-1 cursor-pointer">
            LOG OUT
          </Button>
          <Button onClick={extendSession} variant="accent" className="flex-1 cursor-pointer">
            KEEP WORKING
          </Button>
        </div>
      </div>
    </Modal>
  );
}
