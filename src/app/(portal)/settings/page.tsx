"use client";

import * as React from "react";
import {
  UserCheck,
  Shield,
  Key,
  Bell,
  Check,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/src/components/providers/auth-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, updateProfile } = useUser();
  const [name, setName] = React.useState(user?.name || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [phone, setPhone] = React.useState(user?.phone || "");
  const [timezone, setTimezone] = React.useState(user?.timezone || "Europe/London");
  const [companyName, setCompanyName] = React.useState(user?.companyName || "");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  // 2FA states
  const [show2FA, setShow2FA] = React.useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");
  const [verifying2fa, setVerifying2fa] = React.useState(false);
  const [error2fa, setError2fa] = React.useState("");

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setTimezone(user.timezone || "Europe/London");
      setCompanyName(user.companyName || "");
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // Simulate API update
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (user) {
      await updateProfile({
        name,
        email,
        phone,
        timezone,
        companyName,
      });
    }

    setSuccess(true);
    setLoading(false);
    toast.success("Profile ledger updated successfully");
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying2fa(true);
    setError2fa("");

    setTimeout(() => {
      setVerifying2fa(false);
      if (otpCode.length === 6) {
        setIs2FAEnabled(true);
        setShow2FA(false);
        toast.success("Consensus 2FA secured successfully");
      } else {
        setError2fa("Security check failed: OTP validation mismatch.");
      }
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: Profile Form */}
      <Card className="lg:col-span-2 bg-bg-card border-border-custom relative overflow-hidden">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2 border-b border-border-custom/50">
          <UserCheck className="h-4.5 w-4.5 text-accent-primary mr-2" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // REQUISITION PROFILE LEDGERS
          </span>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                  REQUISITION OFFICER
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                  SECURE CONTACT EMAIL
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white px-3 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                  PRIMARY NODE TELEPHONE
                </label>
                <input
                  required
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white px-3 py-2 text-xs rounded-input outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                  SYSTEM TIMEZONE MATCH
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-mono cursor-pointer"
                >
                  <option value="Europe/London">London (GMT+1)</option>
                  <option value="America/New_York">New York (EST)</option>
                  <option value="Asia/Kolkata">Kolkata (IST)</option>
                  <option value="America/Los_Angeles">Pacific (PST)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                ORGANIZATION BRAND TITLE
              </label>
              <input
                required
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white px-3 py-2 text-xs rounded-input outline-none font-sans font-semibold"
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border-custom/50">
              {success ? (
                <span className="font-mono text-xs text-brand-success flex items-center gap-1">
                  <Check className="h-4 w-4" /> // REQUISITION LEDGERS SYNC: OK
                </span>
              ) : (
                <span />
              )}

              <Button
                type="submit"
                variant="accent"
                className="font-mono text-xs uppercase font-bold py-2.5 cursor-pointer"
                isLoading={loading}
              >
                COMMIT CHANGES
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* RIGHT: Security & Telemetry */}
      <div className="space-y-6">
        {/* MFA setup */}
        <Card className="bg-bg-card border-border-custom">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 border-b border-border-custom/50">
            <Shield className="h-4.5 w-4.5 text-accent-primary mr-2" />
            <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
              // SECURITY SIGNATURES
            </span>
          </CardHeader>
          <CardContent className="pt-4 text-white space-y-4">
            <p className="text-xs text-text-secondary leading-relaxed">
              Require verification codes on all ledger operations. Protect matching settlement entries.
            </p>

            {is2FAEnabled ? (
              <div className="p-4 bg-brand-success/5 border border-brand-success/15 rounded-input flex items-center justify-between">
                <span className="font-mono text-xs text-brand-success font-semibold uppercase tracking-wider">
                  [SECURED]: MULTI-FACTOR ACTIVE
                </span>
                <button
                  onClick={() => setIs2FAEnabled(false)}
                  className="font-mono text-[10px] text-text-muted hover:text-white underline cursor-pointer"
                >
                  [DEACTIVATE]
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShow2FA(true);
                  setError2fa("");
                  setOtpCode("");
                }}
                className="w-full py-2.5 bg-bg-secondary border border-border-custom hover:border-accent-primary/50 text-white font-mono text-xs font-semibold rounded-input uppercase transition-colors cursor-pointer"
              >
                [ACTIVATE_2_FACTOR_AUTH]
              </button>
            )}
          </CardContent>
        </Card>

        {/* Notifications preferences */}
        <Card className="bg-bg-card border-border-custom">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 border-b border-border-custom/50">
            <Bell className="h-4.5 w-4.5 text-accent-primary mr-2 animate-pulse" />
            <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
              // SYSTEM TELEMETRY ALERTS
            </span>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-xs text-text-secondary">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                className="accent-accent-primary h-4 w-4 bg-bg-secondary border-border-custom rounded cursor-pointer"
              />
              <span>Pager alerts for Deliverable reviews</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                className="accent-accent-primary h-4 w-4 bg-bg-secondary border-border-custom rounded cursor-pointer"
              />
              <span>Stripe webhook confirmation emails</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-accent-primary h-4 w-4 bg-bg-secondary border-border-custom rounded cursor-pointer"
              />
              <span>Shivam's direct code commit logs</span>
            </label>
          </CardContent>
        </Card>
      </div>

      {/* 2FA MODAL SETUP */}
      <AnimatePresence>
        {show2FA && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShow2FA(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-bg-card border border-border-custom rounded-card p-6 shadow-glow overflow-hidden space-y-5 text-white"
            >
              <div className="flex justify-between items-center pb-3 border-b border-border-custom/50">
                <div className="flex items-center gap-2">
                  <Key className="h-4.5 w-4.5 text-accent-primary" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">
                    // 2FA CONSENSUS KEY
                  </span>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-xs text-text-secondary">
                  Scan the verification bar using Google Authenticator and enter your OTP token code.
                </p>

                <div className="mx-auto h-32 w-32 bg-white p-2 rounded flex items-center justify-center border border-accent-primary/20 shadow-glow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120"
                    alt="QR Code"
                    className="h-full w-full object-cover filter contrast-125"
                  />
                </div>

                <form onSubmit={handleVerify2FA} className="space-y-3 text-left">
                  <div>
                    <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                      OTP TOKEN CODE (any 6 digits)
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 123456"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white text-center px-4 py-2 text-sm font-mono tracking-widest rounded-input outline-none"
                    />
                  </div>

                  {error2fa && (
                    <span className="block font-mono text-[9px] text-brand-error uppercase text-center">
                      {error2fa}
                    </span>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShow2FA(false)}
                      className="py-2 bg-bg-secondary border border-border-custom text-text-secondary hover:text-white font-mono text-[10px] uppercase rounded cursor-pointer"
                    >
                      [CANCEL]
                    </button>
                    <button
                      type="submit"
                      disabled={verifying2fa || otpCode.length < 6}
                      className="py-2 bg-accent-primary text-bg-primary font-mono text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {verifying2fa ? <Loader2 className="h-3 w-3 animate-spin" /> : "AUTHENTICATE"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
