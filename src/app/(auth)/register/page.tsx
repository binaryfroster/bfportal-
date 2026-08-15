"use client";

import * as React from "react";
import { Terminal, ShieldAlert, ArrowLeft, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

export default function RegisterPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-bg-card border border-border-custom p-8 rounded-card shadow-glow relative z-10 max-w-md w-full mx-auto"
    >
      {/* Header - Terminal Themed */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="h-12 w-12 rounded-full border border-accent-primary/20 bg-bg-secondary flex items-center justify-center mb-4 shadow-glow">
          <Terminal className="h-6 w-6 text-accent-primary animate-pulse" />
        </div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white">
          BINARY <span className="text-accent-primary">FROSTER</span>
        </h1>
        <p className="font-mono text-[9px] text-text-muted mt-1 uppercase tracking-widest">
          // ADMIN PROVISIONING GATE
        </p>
      </div>

      {/* Restricted Notice */}
      <div className="p-4 bg-accent-primary/5 border border-accent-primary/20 rounded-input mb-6 space-y-3">
        <div className="flex items-center gap-2 text-accent-primary font-mono text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>PUBLIC REGISTRATION DISABLED</span>
        </div>
        <p className="font-sans text-xs text-text-secondary leading-relaxed">
          Self-service account registration is closed. All client account creation power is restricted exclusively to Binary Froster Administrators:
        </p>
        <div className="p-3 bg-bg-secondary/80 border border-border-custom/50 rounded text-xs font-mono text-white space-y-1">
          <div className="flex items-center gap-2">
            <UserCheck className="h-3.5 w-3.5 text-accent-primary" />
            <span>Shivam Dube (Founder & AI Engineer)</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-3.5 w-3.5 text-accent-primary" />
            <span>Jawad Khan Hakim (Backend Architect)</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-3.5 w-3.5 text-accent-primary" />
            <span>Digvijay Kadam (UI/UX Designer)</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Link href="/login" className="block w-full">
          <Button
            variant="accent"
            className="w-full font-mono text-xs uppercase tracking-widest py-3 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            RETURN TO LOGIN GATE
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
