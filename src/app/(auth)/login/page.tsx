"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Key, Mail, Terminal, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@/src/components/providers/auth-provider";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="text-center font-mono text-xs text-text-muted p-8">// LOADING AUTH GATE CONSOLE...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { login } = useUser();
  
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Check if middleware redirected here due to deactivation
  React.useEffect(() => {
    if (searchParams?.get("error") === "deactivated") {
      setError("Your account is deactivated. Contact Binary Froster administrators.");
      toast.error("Account Deactivated");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all credentials.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const lowercaseEmail = email.toLowerCase().trim();
      const isAdminEmail = lowercaseEmail.includes("binaryfroster") || lowercaseEmail === "jawadkhanhakim@gmail.com";
      const detectedRole = isAdminEmail ? "admin" : "client";

      const success = await login(lowercaseEmail, detectedRole);
      if (success) {
        toast.success("Welcome back!");
        router.replace("/dashboard");
      } else {
        setError("Failed to initialize session.");
      }
    } catch (err: any) {
      setError(err?.message || "Invalid authentication credentials.");
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
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="h-12 w-12 rounded-full border border-accent-primary/20 bg-bg-secondary flex items-center justify-center mb-4 shadow-glow">
          <Terminal className="h-6 w-6 text-accent-primary animate-pulse" />
        </div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white">
          BINARY <span className="text-accent-primary">FROSTER</span>
        </h1>
        <p className="font-mono text-[9px] text-text-muted mt-1 uppercase tracking-widest">
          // Client Command Core
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-brand-error/10 border border-brand-error/20 rounded-input text-brand-error text-xs font-mono flex items-start gap-2">
          <span className="font-bold">[ERROR]</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-1">
          <label className="block font-mono text-[10px] text-text-secondary uppercase tracking-widest">
            // System Mail Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-text-muted z-10" />
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@sterling.com"
              className="w-full bg-bg-secondary border border-border-custom hover:border-accent-primary/40 focus:border-accent-primary text-white pl-10 pr-4 py-3 text-sm rounded-input outline-none transition-colors font-sans"
              required
            />
          </div>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail("shivam@binaryfroster.com");
                setPassword("password123");
              }}
              className="text-[9px] font-mono text-accent-primary hover:underline cursor-pointer"
            >
              [Admin Shivam]
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("jawad@binaryfroster.com");
                setPassword("password123");
              }}
              className="text-[9px] font-mono text-accent-primary hover:underline cursor-pointer"
            >
              [Admin Jawad]
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("digvijay@binaryfroster.com");
                setPassword("password123");
              }}
              className="text-[9px] font-mono text-accent-primary hover:underline cursor-pointer"
            >
              [Admin Digvijay]
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("john@sterling.com");
                setPassword("password123");
              }}
              className="text-[9px] font-mono text-text-secondary hover:underline cursor-pointer"
            >
              [Client John]
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="block font-mono text-[10px] text-text-secondary uppercase tracking-widest">
              // Access Cryptokey
            </label>
            <Link
              href="/forgot-password"
              className="font-mono text-[9px] text-text-muted hover:text-accent-primary transition-colors"
            >
              [FORGOT_KEY]
            </Link>
          </div>
          <div className="relative">
            <Key className="absolute left-3 top-3.5 h-4 w-4 text-text-muted z-10" />
            <input
              id="password-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-bg-secondary border border-border-custom hover:border-accent-primary/40 focus:border-accent-primary text-white pl-10 pr-10 py-3 text-sm rounded-input outline-none transition-colors font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-text-muted hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          id="login-button"
          type="submit"
          variant="accent"
          className="w-full font-mono text-[11px] uppercase tracking-widest py-3 cursor-pointer"
          isLoading={isLoading}
        >
          INITIALIZE SESSION
        </Button>

        <div className="text-center pt-3 border-t border-border-custom/50">
          <p className="font-mono text-[9px] text-text-muted leading-relaxed uppercase">
            // Client accounts are provisioned exclusively by Binary Froster Admins:
            <br />
            <span className="text-accent-primary font-bold">Shivam Dube • Jawad Khan Hakim • Digvijay Kadam</span>
          </p>
        </div>
      </form>
    </motion.div>
  );
}
