"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Terminal, Key, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="text-center font-mono text-xs text-text-muted p-8">// LOADING SECURITY GATE CONSOLE...</div>}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call to reset password
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setSuccess(true);
      toast.success("Password updated successfully!");
    } catch (err: any) {
      setError(err?.message || "Failed to update cryptokey.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-bg-card border border-border-custom p-8 rounded-card shadow-glow relative z-10"
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
          // Reset Cryptokey
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-brand-error/10 border border-brand-error/20 rounded-input text-brand-error text-xs font-mono flex items-start gap-2">
          <span className="font-bold">[ERROR]</span>
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="space-y-4">
          <div className="p-4 bg-brand-success/10 border border-brand-success/20 rounded-input text-brand-success text-xs font-mono flex items-start gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase">[SUCCESS]</p>
              <p className="mt-0.5">Your access cryptokey has been successfully overwritten. You can now establish a new portal session.</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/login")}
            variant="accent"
            className="w-full font-mono text-[11px] uppercase tracking-widest py-3 cursor-pointer"
          >
            LAUNCH PORTAL SESSION
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="font-mono text-[11px] text-text-secondary leading-relaxed">
            Specify a secure new cryptokey for your portal terminal authentication. Token: <span className="text-accent-primary font-bold">{token ? token.substring(0, 8) : "default"}...</span>
          </p>

          <div className="space-y-1">
            <label className="block font-mono text-[9px] text-text-secondary uppercase tracking-widest">
              // New Cryptokey
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3.5 h-4 w-4 text-text-muted z-10" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-bg-secondary border border-border-custom hover:border-accent-primary/40 focus:border-accent-primary text-white pl-10 pr-4 py-2.5 text-sm rounded-input outline-none transition-colors font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-mono text-[9px] text-text-secondary uppercase tracking-widest">
              // Confirm Cryptokey
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3.5 h-4 w-4 text-text-muted z-10" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-bg-secondary border border-border-custom hover:border-accent-primary/40 focus:border-accent-primary text-white pl-10 pr-4 py-2.5 text-sm rounded-input outline-none transition-colors font-mono"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="accent"
            className="w-full font-mono text-[11px] uppercase tracking-widest py-3 cursor-pointer"
            isLoading={isLoading}
          >
            OVERWRITE ACCESS KEY
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-text-muted hover:text-white font-mono text-[10px] transition-colors"
            >
              [CANCEL]
            </Link>
          </div>
        </form>
      )}
    </motion.div>
  );
}
