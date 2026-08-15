import React, { useState } from "react";
import { api } from "../lib/api";
import { User } from "../types";
import { Shield, Key, Mail, Terminal, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"login" | "twoFactor" | "forgot">("login");
  
  // 2FA state
  const [totpCode, setTotpCode] = useState("");
  const [tempUser, setTempUser] = useState<any>(null);
  
  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all credentials.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email);
      // Simulate 2FA check (if active or just a nice toggle)
      if (res.user.email.includes("sterling") || res.user.email.includes("acme") || email.includes("2fa")) {
        // Force 2FA flow to showcase high-security enterprise-grade standards
        setTempUser(res);
        setView("twoFactor");
      } else {
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || "Invalid authentication credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate TOTP code matching (accept any 6-digit code for mock testing)
    setTimeout(() => {
      if (totpCode.length === 6) {
        onLoginSuccess(tempUser.user);
      } else {
        setError("Invalid 2FA authentication code.");
      }
      setLoading(false);
    }, 1000);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.resetPasswordRequest(forgotEmail);
      setForgotSuccess(res.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    setLoading(true);
    setError(null);
    try {
      // Prompt some generic developer email
      const mockEmail = provider === "google" ? "john@sterling.com" : "jawadkhanhakim@gmail.com";
      const res = await api.socialLogin(provider, mockEmail);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Visual Ambient Grid / Cyber Circuit Accent */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `radial-gradient(#00d4ff 1px, transparent 1px), linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px)`,
        backgroundSize: "20px 20px, 40px 40px"
      }}></div>
      
      {/* Decorative cyan ambient blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[450px] bg-bg-card border border-border-custom p-8 rounded-card shadow-glow relative z-10"
      >
        {/* Header - Terminal Themed */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-12 w-12 rounded-full border border-accent-primary/20 bg-bg-secondary flex items-center justify-center mb-4 shadow-glow">
            <Terminal className="h-6 w-6 text-accent-primary animate-pulse" />
          </div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-text-primary">
            BINARY <span className="text-accent-primary">FROSTER</span>
          </h1>
          <p className="font-mono text-xs text-text-muted mt-1 uppercase tracking-widest">
            // Client Command Core
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-3 bg-brand-error/10 border border-brand-error/20 rounded-input text-brand-error text-xs font-mono flex items-start gap-2"
          >
            <span className="font-bold">[ERROR]</span>
            <span>{error}</span>
          </motion.div>
        )}

        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block font-mono text-[11px] text-text-secondary uppercase tracking-widest mb-1.5">
                // System Mail Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-text-muted" />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@sterling.com"
                  className="w-full bg-bg-secondary border border-border-custom hover:border-accent-primary/40 focus:border-accent-primary text-text-primary pl-10 pr-4 py-3 text-sm rounded-input outline-none transition-colors font-sans"
                  required
                />
              </div>
              <div className="mt-1 flex gap-2">
                <button 
                  type="button" 
                  onClick={() => { setEmail("john@sterling.com"); setPassword("password123"); }}
                  className="text-[10px] font-mono text-accent-primary hover:underline"
                >
                  [Autofill Client]
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEmail("jawad@binaryfroster.com"); setPassword("password123"); }}
                  className="text-[10px] font-mono text-accent-primary hover:underline"
                >
                  [Autofill Admin]
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block font-mono text-[11px] text-text-secondary uppercase tracking-widest">
                  // Access Cryptokey
                </label>
                <button 
                  type="button"
                  onClick={() => setView("forgot")}
                  className="font-mono text-[10px] text-text-muted hover:text-accent-primary transition-colors"
                >
                  [FORGOT_KEY]
                </button>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-3.5 h-4 w-4 text-text-muted" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-bg-secondary border border-border-custom hover:border-accent-primary/40 focus:border-accent-primary text-text-primary pl-10 pr-10 py-3 text-sm rounded-input outline-none transition-colors font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-button"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs uppercase tracking-widest font-bold rounded-input transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow-glow-strong"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  INITIALIZE SESSION
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Social OAuth Simulator */}
            <div className="relative my-6 flex py-1 items-center">
              <div className="flex-grow border-t border-border-custom"></div>
              <span className="flex-shrink mx-4 font-mono text-[10px] text-text-muted uppercase">// OR SECURE GATE</span>
              <div className="flex-grow border-t border-border-custom"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                className="py-2.5 bg-bg-secondary border border-border-custom hover:border-accent-primary text-text-primary font-mono text-[11px] uppercase rounded-input transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-red-500 font-bold">G</span> Google Sign-In
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin("github")}
                className="py-2.5 bg-bg-secondary border border-border-custom hover:border-accent-primary text-text-primary font-mono text-[11px] uppercase rounded-input transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                GitHub Sign-In
              </button>
            </div>
          </form>
        )}

        {view === "twoFactor" && (
          <form onSubmit={handleVerify2FA} className="space-y-5">
            <div className="p-3 bg-accent-primary/5 border border-accent-primary/20 rounded-input">
              <p className="font-mono text-xs text-accent-primary">
                [SECURE SHIELD] Enterprise MFA required for {email}. A simulated TOTP secret has been generated. Enter any 6-digit key.
              </p>
            </div>

            <div>
              <label className="block font-mono text-[11px] text-text-secondary uppercase tracking-widest mb-1.5">
                // 2-Factor Authentication Code
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-3.5 h-4 w-4 text-accent-primary" />
                <input
                  id="totp-input"
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 123456"
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary pl-10 pr-4 py-3 text-center tracking-widest font-mono text-lg rounded-input outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              id="verify-2fa-button"
              type="submit"
              disabled={loading || totpCode.length !== 6}
              className="w-full py-3 bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs uppercase tracking-widest font-bold rounded-input transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "VERIFY IDENTITY"
              )}
            </button>

            <button
              type="button"
              onClick={() => { setView("login"); setError(null); }}
              className="w-full text-center font-mono text-[10px] text-text-muted hover:text-text-primary transition-colors"
            >
              [BACK TO CREDENTIALS]
            </button>
          </form>
        )}

        {view === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <p className="font-mono text-xs text-text-secondary leading-relaxed">
              Enter your registered terminal email. Resend secure SMTP will compile a custom tokenized recovery string.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-brand-success/10 border border-brand-success/20 rounded-input text-brand-success text-xs font-mono leading-normal">
                {forgotSuccess}
              </div>
            ) : (
              <div>
                <label className="block font-mono text-[11px] text-text-secondary uppercase tracking-widest mb-1.5">
                  // Registered Terminal Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-text-muted" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="john@sterling.com"
                    className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary pl-10 pr-4 py-3 text-sm rounded-input outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            {!forgotSuccess && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs uppercase tracking-widest font-bold rounded-input transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "DISPATCH RECOVERY COMMAND"}
              </button>
            )}

            <button
              type="button"
              onClick={() => { setView("login"); setError(null); setForgotSuccess(null); }}
              className="w-full text-center font-mono text-[10px] text-text-muted hover:text-text-primary transition-colors"
            >
              [RETURN TO GATE]
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
