"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/components/providers/auth-provider";
import { Sidebar } from "@/src/components/layout/sidebar";
import { Topbar } from "@/src/components/layout/topbar";
import { SessionTimeout } from "@/src/lib/auth/session-timeout";
import { Skeleton } from "@/src/components/ui/skeleton";
import { PortalDataProvider } from "@/src/components/providers/portal-data-provider";

import { CommandPalette } from "@/src/components/ui/command-palette";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [cmdPaletteOpen, setCmdPaletteOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Handle auto-collapse sidebar on smaller screens
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // trigger on mount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="space-y-4 max-w-sm w-full px-6 text-center">
          <div className="w-10 h-10 rounded bg-gradient-to-tr from-accent-primary to-[#008ebb] flex items-center justify-center font-bold font-mono text-bg-primary text-lg mx-auto animate-pulse">
            BF
          </div>
          <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">
            Accessing Cryptokey Session...
          </p>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <PortalDataProvider>
      <div className="flex h-screen bg-bg-primary overflow-hidden relative font-sans">
        {/* Command Palette Modal */}
        <CommandPalette
          isOpen={cmdPaletteOpen}
          onClose={() => setCmdPaletteOpen(false)}
        />

        {/* Session timeout monitoring */}
        <SessionTimeout />

        {/* Sidebar Navigation */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs cursor-pointer"
          />
        )}

        {/* Main Container */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Topbar
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            title="Binary Froster Command Core"
          />
          <main className="flex-1 overflow-y-auto px-6 py-8 scrollbar-thin relative bg-bg-primary bg-[radial-gradient(#1f1f1f_1px,transparent_1px)] bg-[size:24px_24px]">
            {children}
          </main>
        </div>
      </div>
    </PortalDataProvider>
  );
}
