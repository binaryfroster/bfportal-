"use client";

import * as React from "react";
import { Terminal, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Simulate API call to send recovery email
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const token = "reset-" + Math.random().toString(36).substring(2, 11);
      const resetLink = `/reset-password?token=${token}`;

      // Simulate sending transactional email and saving recovery link in console/logs
      console.log(`[Resend simulation] Reset Link sent to ${email}: ${resetLink}`);
      
      setSuccessMessage(
        "Reset instructions compiled and dispatched via Resend secure SMTP log. Use the link below to configure your new cryptokey."
      );
      toast.success("Recovery link dispatched!");
    } catch (err: any) {
      setError(err?.message || "Failed to process request.");
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
          // Recover Cryptokey
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-brand-error/10 border border-brand-error/20 rounded-input text-brand-error text-xs font-mono flex items-start gap-2">
          <span className="font-bold">[ERROR]</span>
          <span>{error}</span>
        </div>
      )}

      {successMessage ? (
        <div className="space-y-4">
          <div className="p-4 bg-brand-success/10 border border-brand-success/20 rounded-input text-brand-success text-xs font-mono leading-relaxed">
            {successMessage}
          </div>
          <div className="pt-2 text-center">
            <Link
              href="/reset-password?token=mock-token"
              className="inline-flex items-center text-xs font-mono text-accent-primary hover:underline"
            >
              [LAUNCH RESET CONSOLE] <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-text-muted hover:text-white font-mono text-[10px] transition-colors"
            >
              [RETURN TO GATE]
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="font-mono text-[11px] text-text-secondary leading-relaxed">
            Enter your registered system email address. Our node will compile and dispatch a custom tokenized recovery string.
          </p>

          <div className="space-y-1">
            <label className="block font-mono text-[9px] text-text-secondary uppercase tracking-widest">
              // Registered Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-text-muted z-10" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@sterling.com"
                className="w-full bg-bg-secondary border border-border-custom hover:border-accent-primary/40 focus:border-accent-primary text-white pl-10 pr-4 py-2.5 text-sm rounded-input outline-none transition-colors"
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
            DISPATCH RECOVERY COMMAND
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-text-muted hover:text-white font-mono text-[10px] transition-colors"
            >
              [RETURN TO GATE]
            </Link>
          </div>
        </form>
      )}
    </motion.div>
  );
}
