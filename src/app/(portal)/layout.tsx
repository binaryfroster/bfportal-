"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/components/providers/auth-provider";
import { Sidebar } from "@/src/components/layout/sidebar";
import { Topbar } from "@/src/components/layout/topbar";
import { BottomNav } from "@/src/components/layout/bottom-nav";
import { AppDownloadModal } from "@/src/components/modals/app-download-modal";
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
  const [downloadModalOpen, setDownloadModalOpen] = React.useState(false);

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
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0D14]">
        <div className="space-y-4 max-w-sm w-full px-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-bold font-mono text-slate-950 text-xl mx-auto shadow-lg shadow-cyan-500/20 animate-pulse">
            BF
          </div>
          <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
            INITIALIZING NATIVE SESSION...
          </p>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-slate-900" />
            <Skeleton className="h-4 w-5/6 mx-auto bg-slate-900" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <PortalDataProvider>
      <div className="flex h-screen bg-[#0A0D14] overflow-hidden relative font-sans text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Command Palette Modal */}
        <CommandPalette
          isOpen={cmdPaletteOpen}
          onClose={() => setCmdPaletteOpen(false)}
        />

        {/* App Download Center Modal */}
        <AppDownloadModal
          isOpen={downloadModalOpen}
          onClose={() => setDownloadModalOpen(false)}
        />

        {/* Session timeout monitoring */}
        <SessionTimeout />

        {/* Sidebar Navigation */}
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onOpenDownloadModal={() => setDownloadModalOpen(true)}
        />

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 z-30 md:hidden backdrop-blur-sm cursor-pointer"
          />
        )}

        {/* Main Container */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Topbar
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            title="Binary Froster Command Core"
            onOpenDownloadModal={() => setDownloadModalOpen(true)}
          />
          
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 scrollbar-thin relative bg-[#0A0D14] pb-20 md:pb-8">
            {children}
          </main>

          {/* Mobile Bottom Navigation Bar (< 768px) */}
          <BottomNav onOpenDownloadModal={() => setDownloadModalOpen(true)} />
        </div>
      </div>
    </PortalDataProvider>
  );
}
