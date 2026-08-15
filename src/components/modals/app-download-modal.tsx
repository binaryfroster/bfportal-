"use client";

import React, { useState, useEffect } from "react";
import { Download, Monitor, Smartphone, Check, Sparkles, X, QrCode, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppDownloadModal({ isOpen, onClose }: AppDownloadModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setDownloadedFormat("PWA Desktop App");
      }
      setDeferredPrompt(null);
    } else {
      // Direct simulated download for Desktop PWA / Web Package
      triggerPackageDownload("Binary_Froster_Portal_Desktop_v1.0.exe", "Desktop Application");
    }
  };

  const handleDownloadMobileAPK = () => {
    triggerPackageDownload("Binary_Froster_Portal_Mobile_v1.0.apk", "Mobile Android APK");
  };

  const triggerPackageDownload = (filename: string, formatName: string) => {
    const dummyBlob = new Blob(
      [
        `BINARY FROSTER PORTAL - ${formatName.toUpperCase()}\nPackage Version: 1.0.0\nAuthorized Founders: Shivam Dube, Jawad Khan Hakim, Digvijay Kadam\nDownloaded At: ${new Date().toISOString()}`
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(dummyBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedFormat(formatName);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[#0F172A] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden text-white"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                <Download className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-sans text-base font-bold text-white flex items-center gap-2">
                  BINARY FROSTER <span className="text-cyan-400">APP DOWNLOAD HUB</span>
                </h3>
                <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  Native Web Desktop & Mobile APK Installations
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Success Banner */}
          {downloadedFormat && (
            <div className="m-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400 font-mono text-xs">
              <Check className="h-5 w-5 shrink-0 stroke-[3]" />
              <span>Successfully initiated download for <strong>{downloadedFormat}</strong>! Package ready for installation.</span>
            </div>
          )}

          {/* Download Options Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Desktop Web App Package */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl flex flex-col justify-between space-y-4 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-mono font-bold uppercase rounded-full">
                    Desktop App (.EXE)
                  </span>
                </div>
                <h4 className="font-sans text-sm font-bold text-white">Desktop Application</h4>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  Install standalone desktop experience with native window controls, offline workspace caching, and real-time push notifications.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleInstallPWA}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <Download className="h-4 w-4" />
                  DOWNLOAD DESKTOP APP
                </button>
                <span className="block text-center font-mono text-[9px] text-slate-500 uppercase">
                  Compatible with Windows, macOS & Linux
                </span>
              </div>
            </div>

            {/* Mobile App APK / PWA Package */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl flex flex-col justify-between space-y-4 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold uppercase rounded-full">
                    Mobile App (.APK)
                  </span>
                </div>
                <h4 className="font-sans text-sm font-bold text-white">Mobile Application</h4>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  Download Android APK or add to iOS/Android Home Screen. Includes mobile bottom navigation bar and touch gestures.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleDownloadMobileAPK}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Download className="h-4 w-4" />
                  DOWNLOAD MOBILE APK
                </button>
                <span className="block text-center font-mono text-[9px] text-slate-500 uppercase">
                  Supports Android 8.0+ & iOS Mobile PWA
                </span>
              </div>
            </div>
          </div>

          {/* Footer - Authorized Founders Branding */}
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Verified Binary Froster Signature Release</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 font-bold">
              <span>Shivam Dube</span> • <span>Jawad Khan Hakim</span> • <span>Digvijay Kadam</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
